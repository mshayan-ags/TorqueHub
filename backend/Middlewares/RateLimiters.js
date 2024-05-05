const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
	windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
	max: Number(process.env.RATE_LIMIT_MAX) || 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { status: 429, message: "Too many attempts, please try again later." }
});

module.exports = { authLimiter };
