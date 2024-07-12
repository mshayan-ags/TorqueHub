// Throwaway integration-test harness — NOT part of the app, delete after use.
// Boots the real Express app against an in-memory MongoDB and seeds a
// realistic automotive catalog via the real seed.js script, so the
// Frontend/Admin apps have real data to render for manual UI testing.
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "dev-integration-secret";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_dummy";
process.env.AZURE_STORAGE_CONNECTION_STRING = "UseDevelopmentStorage=true";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:3001";
process.env.PORT = "5000";

(async () => {
	const mongod = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongod.getUri();

	const mongoose = require("mongoose");
	await mongoose.connect(process.env.MONGODB_URI);

	const { execSync } = require("child_process");
	execSync("node seed.js", { stdio: "inherit", env: process.env });

	require("./Middlewares/Server");
	require("./Middlewares/Routes");
	const { httpServer, port } = require("./Middlewares/Server");
	httpServer.listen(port, () => console.log(`INTEGRATION_SERVER_READY on http://localhost:${port}`));
})();
