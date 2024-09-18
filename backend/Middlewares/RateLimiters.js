const rateLimit = require("express-rate-limit");

// Route files import `authLimiter` synchronously at module-load time, so the
// Redis store (when configured) is built synchronously here too — only the
// direct REDIS_CONNECTION_STRING form is supported for this specific use,
// not the async Key-Vault-identifier fallback other secrets use. Falls back
// to the default in-memory store when Redis isn't configured, so local dev
// and single-instance deployments are unaffected.
function buildStore() {
	if (!process.env.REDIS_CONNECTION_STRING) {
		return undefined;
	}

	try {
		const Redis = require("ioredis");
		const RedisStore = require("rate-limit-redis");
		const client = new Redis(process.env.REDIS_CONNECTION_STRING);
		client.on("error", (err) => console.error("[redis] rate-limit store connection error:", err?.message));
		return new RedisStore({ sendCommand: (...args) => client.call(...args) });
	} catch (err) {
		console.error("[redis] failed to initialize Redis-backed rate limiting, falling back to in-memory:", err?.message);
		return undefined;
	}
}

const authLimiter = rateLimit({
	windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
	max: Number(process.env.RATE_LIMIT_MAX) || 20,
	standardHeaders: true,
	legacyHeaders: false,
	store: buildStore(),
	message: { status: 429, message: "Too many attempts, please try again later." }
});

module.exports = { authLimiter };
