const { default: mongoose } = require("mongoose");
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
const stripeFactory = require('stripe');
const { User } = require("../models/User");
const { Admin } = require("../models/Admin");
const { Brand } = require("../models/Brand");
const { Category } = require("../models/Category");
const { Product } = require("../models/Product");
const { Address } = require("../models/Address");
const { Bank } = require("../models/Bank");
const { Discount } = require("../models/Discount");
const { Sale } = require("../models/Sale");
const { Coupon } = require("../models/Coupon");
const { CouponRedeem } = require("../models/ReedemCoupon");
const Wishlist = require("../models/Whishlist");
const Review = require("../models/Review");
const Blog = require("../models/Blog");
const { PendingSale } = require("../models/PendingSale");

const cosmosSecretIdentifier = process.env.COSMOS_SECRET_IDENTIFIER;
const stripeSecretIdentifier = process.env.STRIPE_SECRET_IDENTIFIER;

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

let cachedCosmosConnectionString;
let cosmosSecretPromise;

async function getCosmosConnectionString() {
	if (process.env.MONGODB_URI) {
		return process.env.MONGODB_URI;
	}

	if (cachedCosmosConnectionString) {
		return cachedCosmosConnectionString;
	}

	if (!cosmosSecretPromise) {
		cosmosSecretPromise = fetchSecretValue(cosmosSecretIdentifier)
			.then((value) => {
				cachedCosmosConnectionString = value;
				return value;
			})
			.catch((error) => {
				cosmosSecretPromise = undefined;
				throw error;
			});
	}

	return cosmosSecretPromise;
}

let stripeClient;
let stripeClientPromise;

async function getStripeClient() {
	if (stripeClient) {
		return stripeClient;
	}

	if (process.env.STRIPE_SECRET_KEY) {
		stripeClient = stripeFactory(process.env.STRIPE_SECRET_KEY);
		return stripeClient;
	}

	if (!stripeClientPromise) {
		stripeClientPromise = fetchSecretValue(stripeSecretIdentifier)
			.then((apiKey) => {
				stripeClient = stripeFactory(apiKey);
				return stripeClient;
			})
			.catch((error) => {
				stripeClientPromise = undefined;
				throw error;
			});
	}

	return stripeClientPromise;
}

const connect = async () => {
	try {
		const connectionString = await getCosmosConnectionString();
		await mongoose.connect(connectionString);
		console.log("Connected to mongodb");
		await User.find();
		await Product.find();
		await Category.find();
		await Brand.find();
		await Admin.find();
		await Address.find();
		await Bank.find();
		await Discount.find();
		await Sale.find();
		await Coupon.find();
		await CouponRedeem.find();
		await Wishlist.find();
		await Review.find();
		await Blog.find();
		await PendingSale.find();
	} catch (err) {
		console.log(err);
		throw err;
	}

	return mongoose;
};

module.exports = { connect, getStripeClient };



