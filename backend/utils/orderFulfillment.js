const { default: mongoose } = require("mongoose");
const { Sale } = require("../models/Sale");
const { User } = require("../models/User");
const { Address } = require("../models/Address");
const { Bank } = require("../models/Bank");
const { Product } = require("../models/Product");
const { Discount } = require("../models/Discount");
const { SaleOfProduct } = require("../models/SaleOfProduct");
const { CouponRedeem } = require("../models/ReedemCoupon");

async function saveOneSaleOfProduct(element, newSale) {
	const searchProduct = await Product.findOne({ _id: element.ProductID });

	if (!searchProduct) {
		throw new Error("Something Went Wrong");
	}

	const newSaleOfProduct = new SaleOfProduct({
		product: element.ProductID,
		Sale: newSale._id,
		quantity: element.quantity,
		totalPrice: searchProduct.price
	});

	if (element.DiscountID) {
		const searchDiscount = await Discount.findOne({ _id: element.DiscountID });
		if (searchDiscount) {
			newSaleOfProduct.Discount = searchDiscount._id;
		}

		const DiscountAmount = searchDiscount?.DiscountType == "FixedAmount"
			? Number(searchDiscount.value)
			: searchDiscount?.DiscountType == "Percentage"
				? (Number(searchProduct.price) / 100) * Number(searchDiscount.value)
				: 0;
		newSaleOfProduct.totalPriceAfterDiscount = Number(searchProduct.price) - Number(DiscountAmount);
		await newSaleOfProduct.save();

		const searchDiscounts = await SaleOfProduct.find({ Discount: element.DiscountID }).select("_id");
		await Discount.updateOne(
			{ _id: element.DiscountID },
			{ SaleOfProduct: searchDiscounts },
			{ new: false }
		);
	} else {
		newSaleOfProduct.totalPriceAfterDiscount = Number(searchProduct.price);
		await newSaleOfProduct.save();
	}
}

async function saveAllProducts(ProductsArr, newSale) {
	for (const element of ProductsArr) {
		if (!element?.ProductID || !element?.quantity) {
			throw new Error("Please Fill the Required Fields for each product");
		}
		await saveOneSaleOfProduct(element, newSale);
	}
}

/**
 * Creates a Sale (and its SaleOfProduct rows) from an order payload.
 * Idempotent on stripePaymentIntentId: calling this twice with the same
 * intent id returns the already-created sale instead of duplicating it.
 * Used by both the synchronous /Create-Sale flow and the Stripe webhook,
 * so it must not depend on an HTTP `res` object.
 */
async function createSaleFromOrder(orderPayload, userId) {
	const {
		Product: ProductsArr,
		Address: AddressId,
		Bank: BankId,
		Coupon,
		paymentMethod,
		Notes,
		Total,
		scheduleDate,
		status,
		stripePaymentIntentId
	} = orderPayload || {};

	if (stripePaymentIntentId) {
		const existing = await Sale.findOne({ stripePaymentIntentId });
		if (existing?._id) {
			return { sale: existing, alreadyExisted: true };
		}
	}

	const searchUser = await User.findOne({ _id: userId });
	const searchAddress = await Address.findOne({ _id: AddressId });
	const searchBank = BankId ? await Bank.findOne({ _id: BankId }) : null;
	const searchCouponReedem = Coupon
		? await CouponRedeem.findOne({ _id: Coupon }).populate(["Coupon"])
		: null;

	if (!searchUser || !searchAddress) {
		throw new Error("Please Check Your Data");
	}

	const newSale = new Sale({
		User: new mongoose.Types.ObjectId(userId),
		Address: new mongoose.Types.ObjectId(AddressId),
		Bank: searchBank?._id ? new mongoose.Types.ObjectId(BankId) : undefined,
		CouponRedeem: searchCouponReedem?._id ? new mongoose.Types.ObjectId(searchCouponReedem?._id) : null,
		paymentMethod: paymentMethod,
		Notes: Notes,
		totalAmount: Total || 0,
		totalAmountAfterDiscount: Total || 0,
		couponvalue: 0,
		scheduleDate: scheduleDate || new Date(),
		status: status || "Pending",
		stripePaymentIntentId: stripePaymentIntentId || undefined
	});

	await newSale.save();
	await saveAllProducts(ProductsArr || [], newSale);

	const searchProducts = await SaleOfProduct.find({ Sale: newSale._id })
		.select("_id totalPrice totalPriceAfterDiscount quantity");

	let total = 0;
	let totalAfterDiscount = 0;
	searchProducts?.forEach((a) => {
		total += a?.totalPrice * a?.quantity;
		totalAfterDiscount += a?.totalPriceAfterDiscount * a?.quantity;
	});

	newSale.Product = searchProducts;
	newSale.totalAmount = total;
	const couponvalue = searchCouponReedem?._id
		? (searchCouponReedem?.Coupon?.discountType == "Percentage"
			? (total / 100) * searchCouponReedem?.Coupon?.discountValue
			: searchCouponReedem?.Coupon?.discountValue)
		: 0;
	newSale.totalAmountAfterDiscount = Number(totalAfterDiscount) - Number(couponvalue);
	newSale.couponvalue = Number(couponvalue);

	await Sale.updateOne({ _id: newSale?._id }, newSale, { new: false });

	if (searchCouponReedem?._id) {
		await CouponRedeem.updateOne(
			{ _id: searchCouponReedem?._id },
			{
				Sale: newSale?._id,
				coupon_sale: `${searchCouponReedem?.Coupon?._id}_${newSale?._id}`,
				isUsed: true
			},
			{ new: false }
		);
	}

	const searchUserSales = await Sale.find({ User: userId }).select("_id");
	await User.updateOne(
		{ _id: userId },
		{
			Sale: searchUserSales,
			points: Number(searchUser?.points + newSale.totalAmount) || 0
		},
		{ new: false }
	);

	const searchAddressSales = await Sale.find({ Address: AddressId }).select("_id");
	await Address.updateOne(
		{ _id: AddressId },
		{ Sale: searchAddressSales },
		{ new: false }
	);

	if (searchBank?._id) {
		const searchBankSales = await Sale.find({ Bank: BankId }).select("_id");
		await Bank.updateOne(
			{ _id: BankId },
			{ Sale: searchBankSales },
			{ new: false }
		);
	}

	return { sale: newSale, alreadyExisted: false };
}

module.exports = { createSaleFromOrder };
