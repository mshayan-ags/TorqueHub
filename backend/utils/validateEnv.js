function hasStorageConfig() {
	return Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.STORAGE_SECRET_IDENTIFIER);
}

function hasDbConfig() {
	return Boolean(process.env.MONGODB_URI || process.env.COSMOS_SECRET_IDENTIFIER);
}

function hasStripeConfig() {
	return Boolean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_IDENTIFIER);
}

function validateEnv() {
	const missing = [];

	if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
	if (!hasDbConfig()) missing.push("MONGODB_URI (or COSMOS_SECRET_IDENTIFIER)");
	if (!hasStripeConfig()) missing.push("STRIPE_SECRET_KEY (or STRIPE_SECRET_IDENTIFIER)");
	if (!hasStorageConfig()) missing.push("AZURE_STORAGE_CONNECTION_STRING (or STORAGE_SECRET_IDENTIFIER)");

	if (missing.length > 0) {
		console.error("Fatal: missing required environment variables:\n  - " + missing.join("\n  - "));
		console.error("Copy .env.example to .env and fill in the values before starting the server.");
		process.exit(1);
	}
}

module.exports = { validateEnv };
