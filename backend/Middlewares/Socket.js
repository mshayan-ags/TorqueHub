const { User } = require("../models/User");
const { Admin } = require("../models/Admin");
const { Sale } = require("../models/Sale");
const { getTokenPayload } = require("../utils/AuthCheck");

module.exports = function attachSocketHandlers(io) {
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake?.auth?.token;
			if (!token) {
				return next(new Error("Authentication required"));
			}

			const payload = getTokenPayload(token);
			const admin = await Admin.findOne({ _id: payload?.id, Role: payload?.Role });

			if (admin?._id) {
				socket.isAdmin = true;
				socket.userId = admin?._id?.toString();
				return next();
			}

			const user = await User.findOne({ _id: payload?.id });
			if (user?._id) {
				socket.isAdmin = false;
				socket.userId = user?._id?.toString();
				return next();
			}

			return next(new Error("Not authenticated"));
		} catch (err) {
			return next(new Error("Not authenticated"));
		}
	});

	io.on("connection", (socket) => {
		if (socket.isAdmin) {
			socket.join("admins");
		}

		socket.on("join-order", async (saleId) => {
			try {
				const sale = await Sale.findOne({ _id: saleId });
				if (!sale?._id) {
					return socket.emit("join-order-error", { message: "Order not found" });
				}

				if (!socket.isAdmin && sale?.User?.toString() !== socket.userId) {
					return socket.emit("join-order-error", { message: "Forbidden" });
				}

				socket.join(`order:${saleId}`);
			} catch (err) {
				socket.emit("join-order-error", { message: "Something went wrong" });
			}
		});
	});
};
