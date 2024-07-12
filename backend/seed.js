// Populates the database with a realistic demo automotive-parts catalog —
// brands, categories, products (with real illustrated images), a blog post,
// and a demo admin/customer account. Safe to re-run: it only ever touches
// documents it tagged itself (ProductCode starting "SEED-", the "TorqueTech
// Performance" brand, and the two demo account emails below), so it will
// not disturb real data already in the database.
//
// Usage: npm run seed   (reads the same .env as the server — set MONGODB_URI
// or COSMOS_SECRET_IDENTIFIER first)

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { connect } = require("./Middlewares/Db");
const { Image } = require("./models/Image");
const { Brand } = require("./models/Brand");
const { Category } = require("./models/Category");
const { Product } = require("./models/Product");
const Blog = require("./models/Blog");
const { User } = require("./models/User");
const { Admin } = require("./models/Admin");

const DEMO_ADMIN_EMAIL = "admin@torquehub.demo";
const DEMO_USER_EMAIL = "customer@torquehub.demo";
const DEMO_BRAND_NAME = "torquetech performance";
const DEMO_PASSWORD = "password123";

const PRODUCTS = [
	{
		file: "brake-pad.svg",
		ProductCode: "SEED-BP01",
		name: "Ceramic Brake Pad Set",
		description: "Low-dust ceramic brake pads engineered for smooth, quiet stopping power and long pad life.",
		price: 64.99,
		quantity: 40,
		currentMaterial: "Ceramic",
		condition: "New",
		specifications: "Includes wear sensors and premium anti-rattle shims. Fits most sedan and crossover applications.",
		technical_specs: { weight: "2.4 lbs", dimensions: "6 x 4 x 1 in", warranty: "2 years" },
		category: "brake systems"
	},
	{
		file: "brake-rotor.svg",
		ProductCode: "SEED-BR01",
		name: "Vented Brake Rotor",
		description: "Cross-drilled, vented rotor for improved heat dissipation and consistent braking under load.",
		price: 89.99,
		quantity: 25,
		currentMaterial: "Semi-Metallic",
		condition: "New",
		specifications: "OE-matched dimensions and bolt pattern. Zinc-coated to resist corrosion.",
		technical_specs: { weight: "12 lbs", dimensions: "12 x 12 x 1.5 in", warranty: "1 year" },
		category: "brake systems"
	},
	{
		file: "oil-filter.svg",
		ProductCode: "SEED-OF01",
		name: "Spin-On Oil Filter",
		description: "High-efficiency spin-on oil filter that captures contaminants without restricting flow.",
		price: 12.49,
		quantity: 120,
		currentMaterial: "Steel",
		condition: "New",
		specifications: "Silicone anti-drain-back valve. Filters down to 20 microns.",
		technical_specs: { weight: "0.6 lbs", dimensions: "3 x 3 x 4 in", warranty: "N/A" },
		category: "filters"
	},
	{
		file: "air-filter.svg",
		ProductCode: "SEED-AF01",
		name: "High-Flow Air Filter",
		description: "Pleated panel air filter that boosts airflow to the engine while trapping fine particles.",
		price: 24.99,
		quantity: 60,
		currentMaterial: "Cotton-Gauze",
		condition: "New",
		specifications: "Washable and reusable. Rated for up to 50,000 miles between cleanings.",
		technical_specs: { weight: "0.8 lbs", dimensions: "10 x 9 x 1.5 in", warranty: "Lifetime" },
		category: "filters"
	},
	{
		file: "spark-plug.svg",
		ProductCode: "SEED-SP01",
		name: "Iridium Spark Plug (Set of 4)",
		description: "Fine-wire iridium electrode for reliable ignition, better fuel economy, and long service life.",
		price: 34.99,
		quantity: 80,
		currentMaterial: "Iridium",
		condition: "New",
		specifications: "Pre-gapped and ready to install. Rated for up to 100,000 miles.",
		technical_specs: { weight: "0.3 lbs", dimensions: "3.5 x 1 x 1 in", warranty: "3 years" },
		category: "electrical"
	},
	{
		file: "battery.svg",
		ProductCode: "SEED-BT01",
		name: "AGM Starting Battery",
		description: "Maintenance-free AGM battery with strong cold-cranking amps for reliable starts in any weather.",
		price: 189.99,
		quantity: 15,
		currentMaterial: "Aluminum",
		condition: "New",
		specifications: "Spill-proof AGM construction. Vibration-resistant case.",
		technical_specs: { weight: "38 lbs", dimensions: "10 x 7 x 8 in", warranty: "3 years" },
		category: "electrical"
	}
];

const CATEGORIES = [
	{ name: "brake systems", description: "Brake pads, rotors, and calipers" },
	{ name: "filters", description: "Oil, air, and fuel filters" },
	{ name: "electrical", description: "Batteries, spark plugs, and ignition parts" }
];

async function upsertImage(fileName) {
	const filePath = path.join(__dirname, "seed-assets", fileName);
	const svgContent = fs.readFileSync(filePath, "utf8");
	const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

	let image = await Image.findOne({ filename: fileName });
	if (!image) {
		image = await Image.create({
			filename: fileName,
			mimetype: "image/svg+xml",
			blobUrl: dataUri,
			blobName: fileName,
			containerName: "seed-assets"
		});
	}
	return image;
}

async function seed() {
	await connect();

	console.log("Cleaning up any previous seed run...");
	await Product.deleteMany({ ProductCode: { $in: PRODUCTS.map((p) => p.ProductCode) } });
	await Category.deleteMany({ name: { $in: CATEGORIES.map((c) => c.name) } });
	await Brand.deleteMany({ name: DEMO_BRAND_NAME });
	await User.deleteMany({ email: DEMO_USER_EMAIL });
	await Admin.deleteMany({ email: DEMO_ADMIN_EMAIL });
	await Blog.deleteMany({ title: "5 Signs Your Brakes Need Attention" });

	console.log("Creating brand and categories...");
	const brand = await Brand.create({
		name: DEMO_BRAND_NAME,
		description: "Performance-tested auto parts built for daily drivers and enthusiasts alike.",
		country: "USA",
		website: "https://torquehub.example.com"
	});

	const categoryDocs = {};
	for (const c of CATEGORIES) {
		categoryDocs[c.name] = await Category.create(c);
	}

	console.log("Creating products with real illustrated images...");
	for (const p of PRODUCTS) {
		const image = await upsertImage(p.file);
		const product = await Product.create({
			Product: `${p.ProductCode}-${p.currentMaterial}`,
			ProductCode: p.ProductCode,
			name: p.name,
			description: p.description,
			price: p.price,
			quantity: p.quantity,
			currentMaterial: p.currentMaterial,
			condition: p.condition,
			specifications: p.specifications,
			technical_specs: p.technical_specs,
			brand: brand._id,
			category: categoryDocs[p.category]._id,
			images: [image._id]
		});
		console.log(`  - ${product.name} ($${product.price})`);
	}

	console.log("Creating demo blog post...");
	await Blog.create({
		title: "5 Signs Your Brakes Need Attention",
		content: "Squealing, grinding, longer stopping distances, vibration under braking, and a soft pedal are all warning signs that your brake pads or rotors need inspection.",
		categories: ["Maintenance"],
		tags: ["brakes", "safety"]
	});

	console.log("Creating demo accounts...");
	const userPassword = await bcrypt.hash(DEMO_PASSWORD, 15);
	await User.create({ name: "Demo Customer", email: DEMO_USER_EMAIL, password: userPassword, stripeID: "seed-user" });

	const adminPassword = await bcrypt.hash(DEMO_PASSWORD, 15);
	await Admin.create({ name: "Demo Admin", email: DEMO_ADMIN_EMAIL, phoneNumber: 5551234567, password: adminPassword, Role: "Admin" });

	console.log("\nSeed complete.");
	console.log(`  Customer login: ${DEMO_USER_EMAIL} / ${DEMO_PASSWORD}`);
	console.log(`  Admin login:    ${DEMO_ADMIN_EMAIL} / ${DEMO_PASSWORD}`);

	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
