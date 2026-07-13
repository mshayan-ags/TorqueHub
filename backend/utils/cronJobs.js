const cron = require("node-cron");
const { AbandonedCart } = require("../models/AbandonedCart");
const { Sale } = require("../models/Sale");
const { Product } = require("../models/Product");
const { Admin } = require("../models/Admin");
const { sendMail } = require("./mailer");

const ABANDONED_CART_HOURS = Number(process.env.ABANDONED_CART_HOURS) || 24;
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

// Hourly: emails users whose cart hasn't moved in ABANDONED_CART_HOURS and
// have no completed Sale since (i.e. they didn't already check out through
// this cart or another one) — each cart is only ever reminded once per
// abandonment (reminderSentAt), reset whenever /Sync-Cart runs again.
async function sendAbandonedCartReminders() {
	try {
		const cutoff = new Date(Date.now() - ABANDONED_CART_HOURS * 60 * 60 * 1000);
		const candidates = await AbandonedCart.find({
			lastUpdated: { $lte: cutoff },
			reminderSentAt: null
		}).populate(["User", "items.ProductID"]);

		for (const cart of candidates) {
			if (!cart?.User?.email) {
				continue;
			}

			const completedSaleSince = await Sale.findOne({
				User: cart.User._id,
				created_at: { $gte: cart.lastUpdated }
			});
			if (completedSaleSince?._id) {
				// They checked out since this cart snapshot — nothing to remind.
				await AbandonedCart.deleteOne({ _id: cart._id });
				continue;
			}

			const itemLines = (cart.items || [])
				.filter((i) => i?.ProductID?.name)
				.map((i) => `- ${i.ProductID.name} x${i.quantity}`)
				.join("\n");
			if (!itemLines) {
				continue;
			}

			await sendMail({
				to: cart.User.email,
				subject: "You left something in your TorqueHub cart",
				text: `Hi ${cart.User.name || "there"},\n\nYou still have items waiting in your cart:\n\n${itemLines}\n\nCome back and finish your order whenever you're ready.`
			});

			await AbandonedCart.updateOne({ _id: cart._id }, { reminderSentAt: new Date() });
		}
	} catch (error) {
		console.error("[cron] abandoned cart reminder failed:", error?.message);
	}
}

// Daily: a single digest email per admin listing every non-archived product
// at or below LOW_STOCK_THRESHOLD remaining units.
async function sendLowStockDigest() {
	try {
		const products = await Product.find({ isArchive: false }).select("name ProductCode quantity");
		const lowStock = products.filter((p) => Number(p?.quantity) <= LOW_STOCK_THRESHOLD);
		if (!lowStock.length) {
			return;
		}

		const admins = await Admin.find({}).select("email name");
		const lines = lowStock.map((p) => `- ${p.name} (${p.ProductCode}): ${p.quantity} left`).join("\n");

		for (const admin of admins) {
			if (!admin?.email) {
				continue;
			}
			await sendMail({
				to: admin.email,
				subject: `Low stock digest: ${lowStock.length} product(s) need restocking`,
				text: `The following products are at or below ${LOW_STOCK_THRESHOLD} units:\n\n${lines}`
			});
		}
	} catch (error) {
		console.error("[cron] low stock digest failed:", error?.message);
	}
}

function startCronJobs() {
	cron.schedule("0 * * * *", sendAbandonedCartReminders);
	cron.schedule("0 8 * * *", sendLowStockDigest);
}

module.exports = { startCronJobs, sendAbandonedCartReminders, sendLowStockDigest };
