const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

// Shared Azure Key Vault secret-resolution helpers. Every backend module that
// needs an env-var-or-Key-Vault-fallback secret (Mongo/Stripe in Db.js,
// Storage in saveImage.js, ACS Email in mailer.js, Redis in redisClient.js)
// should import from here instead of re-implementing this.
function parseSecretIdentifier(secretUrl) {
	if (!secretUrl) {
		throw new Error("Azure Key Vault secret identifier is not defined.");
	}

	const parsedUrl = new URL(secretUrl);
	const segments = parsedUrl.pathname.split('/').filter(Boolean);

	if (segments[0] !== 'secrets' || !segments[1]) {
		throw new Error("Invalid Azure Key Vault secret identifier provided.");
	}

	return {
		vaultUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
		secretName: segments[1],
		secretVersion: segments[2]
	};
}

// Narrowed to Azure CLI credential only — a bare DefaultAzureCredential()
// probes every credential type in order (including a slow IMDS timeout for
// Managed Identity when not actually running in Azure), which is needlessly
// slow outside of production.
const credential = new DefaultAzureCredential({
	excludeAzureCliCredential: false,
	excludeEnvironmentCredential: true,
	excludeManagedIdentityCredential: true,
	excludeVisualStudioCodeCredential: true,
	excludeAzurePowerShellCredential: true,
	excludeDeveloperCliCredential: true,
});

const secretClients = new Map();

function getSecretClient(vaultUrl) {
	if (!secretClients.has(vaultUrl)) {
		secretClients.set(vaultUrl, new SecretClient(vaultUrl, credential));
	}
	return secretClients.get(vaultUrl);
}

async function fetchSecretValue(secretIdentifier) {
	const { vaultUrl, secretName, secretVersion } = parseSecretIdentifier(secretIdentifier);
	const client = getSecretClient(vaultUrl);
	const options = secretVersion ? { version: secretVersion } : undefined;
	const response = await client.getSecret(secretName, options);

	if (!response?.value) {
		throw new Error(`Secret ${secretName} has no value.`);
	}

	return response.value;
}

module.exports = { parseSecretIdentifier, getSecretClient, fetchSecretValue, credential };
