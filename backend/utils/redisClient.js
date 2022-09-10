const { fetchSecretValue } = require("./azureSecrets");

const directConnectionString = process.env.REDIS_CONNECTION_STRING;
const secretIdentifier = process.env.REDIS_SECRET_IDENTIFIER;

let clientPromise;

// Returns a shared ioredis client, or null when no Redis config is present
// at all (local dev falls back to in-memory rate limiting / no Socket.IO
// adapter, rather than failing to boot). Uses ioredis's default lazy
// connect-and-queue behavior, so callers can use the client immediately
// without awaiting an explicit "ready" event.
async function getRedisClient() {
	if (!directConnectionString && !secretIdentifier) {
		return null;
	}

	if (clientPromise) {
		return clientPromise;
	}

	clientPromise = (async () => {
		const connectionString = directConnectionString || (await fetchSecretValue(secretIdentifier));
		const Redis = require("ioredis");
		const client = new Redis(connectionString);
		client.on("error", (err) => console.error("[redis] connection error:", err?.message));
		return client;
	})().catch((error) => {
		clientPromise = undefined;
		throw error;
	});

	return clientPromise;
}

module.exports = { getRedisClient };
