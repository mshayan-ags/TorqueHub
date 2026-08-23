const { Product } = require("../models/Product");
const { Image } = require("../models/Image");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible, escapeRegex } = require("../utils/functions");
const { logAction } = require("../utils/auditLog");
const { requirePermission } = require("../Middlewares/RequirePermission");
const { SaveImageDB } = require("./Image");
const { Brand } = require("../models/Brand");
const { Category } = require("../models/Category");


const router = Router();

async function saveimagesArr({ ImgArr, id, res }) {
	const ImgIDArr = [];
	await ImgArr.map(async (a, i) => {
		const image = await SaveImageDB(a, { Product: new mongoose.Types.ObjectId(id) }, res);
		if (image?.file?._id) {
			ImgIDArr.push(new mongoose.Types.ObjectId(image?.file?._id));
		} else {
			res.status(500).json({ status: 500, message: image?.Error });
		}
	});
}

// Extracted from the old /Create-Product handler so /Bulk-Create-Products
// (CSV import) can create products through the exact same validation/save
// path instead of duplicating it. Deliberately excludes image handling —
// that stays in /Create-Product's own route body, and CSV rows never carry
// images (out of scope; images are a manual follow-up step for bulk-imported
// products). Throws a plain Error with a user-facing .message on failure.
async function createOneProduct(Credentials) {
	const requiredFields = [
		"name", "description", "price", "quantity", "currentColor",
		"currentSize", "currentMaterial", "specifications", "brand",
		"category", "ProductCode"
	];
	const missingField = requiredFields.find((f) => Credentials?.[f] == null || Credentials?.[f] === "");
	if (missingField) {
		throw new Error(`Please Fill the Required Field ${missingField}`);
	}

	const productKey = `${Credentials?.ProductCode}-${Credentials?.currentColor}-${Credentials?.currentSize}-${Credentials?.currentMaterial}`;
	const searchProduct = await Product.find({ Product: productKey });
	if (searchProduct.length > 0) {
		throw new Error("This Product Already Exist");
	}

	const searchBrand = await Brand.findOne({ _id: Credentials?.brand });
	const searchCategory = await Category.findOne({ _id: Credentials?.category });
	if (!searchBrand?._id || !searchCategory?._id) {
		throw new Error("Please Check Your Data");
	}

	const newProduct = new Product({
		Product: productKey,
		ProductCode: Credentials?.ProductCode,
		name: Credentials?.name,
		description: Credentials?.description,
		price: Credentials?.price,
		quantity: Credentials?.quantity,
		currentColor: Credentials?.currentColor,
		currentSize: Credentials?.currentSize,
		currentMaterial: Credentials?.currentMaterial,
		condition: Credentials?.condition,
		specifications: Credentials?.specifications,
		brand: new mongoose.Types.ObjectId(Credentials?.brand),
		category: new mongoose.Types.ObjectId(Credentials?.category),
		fitment: Array.isArray(Credentials?.fitment) ? Credentials.fitment : [],
		technical_specs: {
			weight: Credentials?.weight,
			dimensions: Credentials?.dimensions,
			warranty: Credentials?.warranty
		}
	});

	const saveProduct = await newProduct.save();

	const searchbrandProducts = await Product.find({ brand: Credentials?.brand }).select("_id");
	await Brand.updateOne({ _id: Credentials?.brand }, { Product: searchbrandProducts }, { new: false });

	const searchcategoryProducts = await Product.find({ category: Credentials?.category }).select("_id");
	await Category.updateOne({ _id: Credentials?.category }, { Product: searchcategoryProducts }, { new: false });

	return saveProduct;
}

router.post("/Create-Product", requirePermission("manageProducts"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				[
					"name",
					"description",
					"price",
					"quantity",
					"currentColor",
					"currentSize",
					"currentMaterial",
					"specifications",
					"brand",
					"category",
					"images",
					"ProductCode"
				],
				res
			);
			if (Check) {
				return;
			}

			let saveProduct;
			try {
				saveProduct = await createOneProduct(Credentials);
			} catch (err) {
				return res.status(400).json({ status: 400, message: err?.message || "Something Went Wrong" });
			}

			const ImgArr = [...Credentials?.images];

			if (ImgArr?.length > 0) {
				async function connectImgArrDb() {
					const uniqueimages = await Image.find({
						Product: saveProduct?._id
					}).select("_id");

					saveProduct.images = uniqueimages;

					if (uniqueimages.length != saveProduct.images.length) {
						setTimeout(() => {
							connectImgArrDb();
						}, 500);
					}
				}
				await saveimagesArr({
					ImgArr,
					id: saveProduct?._id,
					res
				});
				setTimeout(async () => {
					await connectImgArrDb();
				}, 2000);
			}

			linkAllImagesToProducts()
			logAction({
				adminId: id,
				action: "Create-Product",
				targetType: "Product",
				targetId: saveProduct?._id,
				summary: `Created product "${saveProduct?.name}"`
			});
			res.status(200).json({
				status: 200,
				message: "Product Created in Succesfully"
			});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error);
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]} as it's not unique`
			});
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.post("/Update-Product/:id", requirePermission("manageProducts"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchProduct = await Product.findOne({ _id: req?.params?.id });

			if (searchProduct?._id) {
				const updateProduct = {
					name: Credentials?.name || searchProduct?.name,
					ProductCode: Credentials?.ProductCode || searchProduct?.ProductCode,
					description: Credentials?.description || searchProduct?.description,
					price: Credentials?.price || searchProduct?.price,
					quantity: Credentials?.quantity || searchProduct?.quantity,
					currentColor: Credentials?.currentColor || searchProduct?.currentColor,
					currentSize: Credentials?.currentSize || searchProduct?.currentSize,
					currentMaterial: Credentials?.currentMaterial || searchProduct?.currentMaterial,
					condition: Credentials?.condition || searchProduct?.condition,
					specifications: Credentials?.specifications || searchProduct?.specifications,
					fitment: Array.isArray(Credentials?.fitment) ? Credentials.fitment : searchProduct?.fitment,
					technical_specs: {
						weight: Credentials?.weight || searchProduct?.weight,
						dimensions: Credentials?.dimensions || searchProduct?.dimensions,
						warranty: Credentials?.warranty || searchProduct?.warranty
					}
				};

				updateProduct.Product = `${updateProduct?.ProductCode}-${updateProduct?.currentColor}-${updateProduct?.currentSize}-${updateProduct?.currentMaterial}`;
				const searchProductUnique = await Product.find({
					Product: updateProduct.Product
				});

				if (
					searchProductUnique.filter((a) => a?._id.toString() != searchProduct?._id.toString())
						.length > 0
				) {
					res.status(400).json({ status: 400, message: "This Product Already Exist" });
					return;
				}
				if (Credentials?.images?.length > 0) {
					const ImgArr = [...Credentials?.images];
					await saveimagesArr({
						ImgArr,
						id: searchProduct?._id,
						res
					});
				}

				const uniqueimages = await Image.find({
					Product: searchProduct?._id
				}).select("_id");

				const saveProduct = await Product.updateOne(
					{
						_id: req?.params?.id
					},
					{ ...updateProduct, images: uniqueimages },
					{
						new: false
					}
				);

				if (saveProduct?.acknowledged) {
					logAction({
						adminId: id,
						action: "Update-Product",
						targetType: "Product",
						targetId: searchProduct?._id,
						summary: `Updated product "${updateProduct?.name}"`
					});
					res.status(200).json({
						status: 200,
						message: "Product Updated Succesfully"
					});
				} else {
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(401).json({ status: 401, message: "Please Check Your Data" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error);
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]} as it's not unique`
			});
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.post("/Delete-Product/:id", requirePermission("manageProducts"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchProduct = await Product.findOne({ _id: req?.params?.id });
			if (searchProduct?._id) {
				const updateProduct = {
					isArchive: true
				};

				const saveProduct = await Product.updateOne(
					{
						_id: req?.params?.id
					},
					updateProduct,
					{
						new: false
					}
				);

				if (saveProduct?.acknowledged) {
					logAction({
						adminId: id,
						action: "Delete-Product",
						targetType: "Product",
						targetId: searchProduct?._id,
						summary: `Archived product "${searchProduct?.name}"`
					});
					res.status(200).json({
						status: 200,
						message: "Product Deleted in Succesfully"
					});
				} else {
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(401).json({ status: 401, message: "Please Check Your Data" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]} as it's not unique`
			});
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.post("/Add-Product-Accesories/:ProductCode", requirePermission("manageProducts"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["ProductCode"], res);
			if (Check) {
				return;
			}
			const searchProduct = await Product.find({ ProductCode: req?.params?.ProductCode });
			if (searchProduct?.length > 0) {
				const Credentials = req.body;

				const color = [...searchProduct?.[0]?.color];
				const material = [...searchProduct?.[0]?.material];
				const size = [...searchProduct?.[0]?.size];
				if (Credentials?.ColorProductId)
					color.push(new mongoose.Types.ObjectId(Credentials?.ColorProductId));
				if (Credentials?.SizeProductId)
					size.push(new mongoose.Types.ObjectId(Credentials?.SizeProductId));
				if (Credentials?.MaterialProductId)
					material.push(new mongoose.Types.ObjectId(Credentials?.MaterialProductId));

				const saveProduct = await Product.updateMany(
					{
						ProductCode: req?.params?.ProductCode
					},
					{
						color: Array.from(new Set(color.map((item) => item.toString()))),
						size: Array.from(new Set(size.map((item) => item.toString()))),
						material: Array.from(new Set(material.map((item) => item.toString())))
					},
					{
						new: false
					}
				);

				if (saveProduct?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Product Accesories Added in Succesfully"
					});
				} else {
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(401).json({ status: 401, message: "Please Check Your Data" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]} as it's not unique`
			});
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.post("/Remove-Product-Accesories/:ProductCode", requirePermission("manageProducts"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["ProductCode"], res);
			if (Check) {
				return;
			}
			const searchProduct = await Product.find({ ProductCode: req?.params?.ProductCode });
			if (searchProduct?.length > 0) {
				const Credentials = req.body;

				let color = [...searchProduct?.[0]?.color];
				let material = [...searchProduct?.[0]?.material];
				let size = [...searchProduct?.[0]?.size];

				if (Credentials?.ColorProductId)
					color = color.filter((item) => item.toString() != Credentials?.ColorProductId);
				if (Credentials?.SizeProductId)
					size = size.filter((item) => item.toString() != Credentials?.SizeProductId);
				if (Credentials?.MaterialProductId)
					material = material.filter((item) => item.toString() != Credentials?.MaterialProductId);

				const saveProduct = await Product.updateMany(
					{
						ProductCode: req?.params?.ProductCode
					},
					{
						color: Array.from(new Set(color)),
						size: Array.from(new Set(size)),
						material: Array.from(new Set(material))
					},
					{
						new: false
					}
				);

				if (saveProduct?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Product Accesories Removeed in Succesfully"
					});
				} else {
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(401).json({ status: 401, message: "Please Check Your Data" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error);
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]} as it's not unique`
			});
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.get("/ProductInfo/:id", async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
		if (Check) {
			return;
		}

		Product.findOne({ _id: req.params.id })
			.populate(["images", "Discount", "category", "brand", { path: "color", populate: ["images"] }, { path: "size", populate: ["images"] }, { path: "material", populate: ["images"] }])
			.then((data) => {
				res.status(200).json({ status: 200, data: data });
			})
			.catch((err) => {
				res.status(500).json({ status: 500, message: err });
			});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllProducts", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);

		if (id) {
			Product.find()
				.populate(["images", "Discount", "category", "brand"])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/SearchProducts", async (req, res) => {
	try {
		const q = (req.query?.q || "").trim();
		if (!q) {
			return res.status(200).json({ status: 200, data: [] });
		}

		const pattern = new RegExp(escapeRegex(q), "i");
		const [matchingBrands, matchingCategories] = await Promise.all([
			Brand.find({ name: pattern }).select("_id"),
			Category.find({ name: pattern }).select("_id")
		]);

		const results = await Product.find({
			isArchive: false,
			$or: [
				{ name: pattern },
				{ ProductCode: pattern },
				{ description: pattern },
				{ brand: { $in: matchingBrands.map((b) => b._id) } },
				{ category: { $in: matchingCategories.map((c) => c._id) } }
			]
		}).populate(["images", "Discount", "category", "brand"]);

		// Multi-word queries also get $text relevance scoring merged in —
		// the regex above only finds substring matches, $text also matches
		// queries whose words appear in a different order/field than typed
		// (e.g. "front brake" matching a product named "Brake Pad - Front").
		if (q.split(/\s+/).filter(Boolean).length >= 2) {
			const seen = new Set(results.map((p) => p._id.toString()));
			const textMatches = await Product.find(
				{ isArchive: false, $text: { $search: q } },
				{ score: { $meta: "textScore" } }
			)
				.sort({ score: { $meta: "textScore" } })
				.populate(["images", "Discount", "category", "brand"]);

			textMatches.forEach((p) => {
				if (!seen.has(p._id.toString())) {
					seen.add(p._id.toString());
					results.push(p);
				}
			});
		}

		res.status(200).json({ status: 200, data: results });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/RelatedProducts/:id", async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
		if (Check) {
			return;
		}

		const product = await Product.findOne({ _id: req.params.id });
		if (!product?._id) {
			return res.status(404).json({ status: 404, message: "Product Not Found" });
		}

		const related = await Product.find({
			_id: { $ne: product._id },
			isArchive: false,
			$or: [{ category: product.category }, { brand: product.brand }]
		})
			.limit(8)
			.populate(["images", "Discount", "category", "brand"]);

		res.status(200).json({ status: 200, data: related });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

// CSV import: client-side parses/previews the file and posts plain row
// objects here. Brand/category are identified by name (human-editable CSV),
// resolved to ObjectIds here, then handed to the same createOneProduct()
// used by /Create-Product. Images are explicitly out of scope for CSV rows
// — imported products need images added as a manual follow-up step.
router.post("/Bulk-Create-Products", requirePermission("manageProducts"), async (req, res) => {
	try {
		const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
		if (!rows.length) {
			return res.status(400).json({ status: 400, message: "No rows to import" });
		}

		const results = [];
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			try {
				const brandDoc = await Brand.findOne({ name: row?.brand });
				const categoryDoc = await Category.findOne({ name: row?.category });
				if (!brandDoc?._id || !categoryDoc?._id) {
					throw new Error(`Unknown brand "${row?.brand}" or category "${row?.category}"`);
				}

				const saved = await createOneProduct({
					...row,
					brand: brandDoc._id.toString(),
					category: categoryDoc._id.toString()
				});
				results.push({ row: i + 1, ProductCode: row?.ProductCode, success: true, id: saved?._id });
			} catch (err) {
				results.push({ row: i + 1, ProductCode: row?.ProductCode, success: false, message: err?.message || "Something Went Wrong" });
			}
		}

		logAction({
			adminId: req.adminId,
			action: "Bulk-Create-Products",
			targetType: "Product",
			summary: `Bulk-imported ${results.filter((r) => r.success).length}/${rows.length} products`
		});

		res.status(200).json({ status: 200, data: results });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllProductsUser", async (req, res) => {
	try {
		Product.find({
			isArchive: false
		})
			.populate(["images", "Discount", "category", "brand"])
			.then((data) => {
				res.status(200).json({ status: 200, data: data });
			})
			.catch((err) => {
				res.status(500).json({ status: 500, message: err });
			});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

async function linkAllImagesToProducts() {
	try {
		// Step 1: Retrieve all products and images from the database
		const products = await Product.find({});
		const images = await Image.find({});

		if (products.length === 0) {
			console.log('No products found');
			return;
		}

		if (images.length === 0) {
			console.log('No images found');
			return;
		}

		// Step 2: Create a map of product IDs to their corresponding images
		const productImageMap = {};

		images.forEach((image) => {
			const productId = image.Product; // This is the ObjectId referencing the Product
			if (productId) {
				if (!productImageMap[productId]) {
					productImageMap[productId] = [];
				}
				productImageMap[productId].push(image._id); // Add the image ID to the array for that product
			}
		});

		// Step 3: Link each product to its corresponding images
		for (const product of products) {
			const imageIds = productImageMap[product._id]; // Get the image IDs for this product
			if (imageIds) {
				// Add image IDs to the product's images array
				product.images.push(...imageIds);
				await product.save(); // Save the updated product
			}
		}

		console.log('All products successfully linked with their images');
	} catch (error) {
		console.error('Error linking images to products:', error.message);
	}
}

const updateAllProductsByTrimmingCodes = async () => {
	try {
		// Fetch all unique ProductCodes from the database
		const allProducts = await Product.find({}).select("ProductCode");

		// Extract unique ProductCodes
		const uniqueProductCodes = [...new Set(allProducts.map(product => product.ProductCode))];

		// Loop through each unique ProductCode
		for (let code of uniqueProductCodes) {
			// Trim the last 3 characters from the ProductCode
			const partialCode = code.slice(0, -3);
			console.log(partialCode)
			// Find all products that contain this partial code in their ProductCode
			const searchProducts = await Product.find({ ProductCode: { $regex: partialCode, $options: "i" } });
			// Loop through the found products and update them
			for (let product of searchProducts) {

				let color = [...product?.color];
				let material = [...product?.material];
				let size = [...product?.size];

				const seenColors = [];
				const seenMaterial = [];
				const seenSize = [];

				searchProducts.forEach(product => {
					if (product.currentColor && !seenColors.includes(product.currentColor)) {
						color.push(new mongoose.Types.ObjectId(product?._id));
						seenColors.push(product.currentColor)
					}

					if (product.currentMaterial && !seenMaterial.includes(product.currentMaterial)) {
						material.push(new mongoose.Types.ObjectId(product?._id));
						seenMaterial.push(product.currentMaterial)
					}

					if (product.currentSize && !seenSize.includes(product.currentSize)) {
						size.push(new mongoose.Types.ObjectId(product?._id));
						seenSize.push(product.currentSize)
					}
				});

				// Update the product with unique color, size, and material arrays
				await Product.updateMany(
					{ _id: product._id },
					{
						color: Array.from(new Set(color.map((item) => item.toString()))),
						size: Array.from(new Set(size.map((item) => item.toString()))),
						material: Array.from(new Set(material.map((item) => item.toString())))
					},
					{
						new: false
					}
				).then(() => console.count('done '));
			}
		}

		console.log("All products updated successfully.");
	} catch (error) {
		console.error("Error updating products:", error);
	}
};


module.exports = router;
