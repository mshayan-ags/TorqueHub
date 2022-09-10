const crypto = require("crypto");

function generateOtp() {
	return crypto.randomInt(100000, 999999).toString();
}

function otpExpiryDate(minutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10) {
	return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = { generateOtp, otpExpiryDate };
