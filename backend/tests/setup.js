// These must be set synchronously, before any test file requires
// Middlewares/Server (which runs validateEnv() at module load time).
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/torquehub-test-placeholder";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_dummy";
process.env.AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "UseDevelopmentStorage=true";
process.env.CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000";

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

beforeAll(async () => {
	mongod = await MongoMemoryServer.create();
	await mongoose.connect(mongod.getUri());
	// Mounts every router onto the app exported by Middlewares/Server —
	// mirrors what app.js does in production. Required here (rather than
	// at module load) so it runs after the env vars above are already set.
	require("../Middlewares/Routes");
}, 60000);

afterAll(async () => {
	await mongoose.disconnect();
	if (mongod) await mongod.stop();
});

afterEach(async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
});
