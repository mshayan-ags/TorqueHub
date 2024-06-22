const { Product } = require("../models/Product");
const { Image } = require("../models/Image");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
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

router.post("/Create-Product", async (req, res) => {
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

			const searchProduct = await Product.find({
				Product: `${Credentials?.ProductCode}-${Credentials?.currentColor}-${Credentials?.currentSize}-${Credentials?.currentMaterial}`
			});
			if (searchProduct.length > 0) {
				res.status(400).json({ status: 400, message: "This Product Already Exist" });
				return;
			}
			const searchBrand = await Brand.findOne({ _id: Credentials?.brand });
			const searchCategory = await Category.findOne({ _id: Credentials?.category });

			if (searchCategory?._id && searchBrand?._id && searchProduct.length <= 0) {
				const newProduct = new Product({
					Product: `${Credentials?.ProductCode}-${Credentials?.currentColor}-${Credentials?.currentSize}-${Credentials?.currentMaterial}`,
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
					technical_specs: {
						weight: Credentials?.weight,
						dimensions: Credentials?.dimensions,
						warranty: Credentials?.warranty
					}
				});

				const ImgArr = [...Credentials?.images];

				if (ImgArr?.length > 0) {
					async function connectImgArrDb() {
						const uniqueimages = await Image.find({
							Product: newProduct?._id
						}).select("_id");

						newProduct.images = uniqueimages;

						if (uniqueimages.length != newProduct.images.length) {
							setTimeout(() => {
								connectImgArrDb();
							}, 500);
						}
					}
					await saveimagesArr({
						ImgArr,
						id: newProduct?._id,
						res
					});
					setTimeout(async () => {
						await connectImgArrDb();
					}, 2000);
				}

				const saveProduct = await newProduct.save();

				const searchbrandProducts = await Product.find({ brand: Credentials?.brand }).select("_id");
				const updatebrand = await Brand.updateOne(
					{ _id: Credentials?.brand },
					{
						Product: searchbrandProducts
					},
					{
						new: false
					}
				);

				const searchcategoryProducts = await Product.find({
					category: Credentials?.category
				}).select("_id");
				const updatecategory = await Category.updateOne(
					{ _id: Credentials?.category },
					{
						Product: searchcategoryProducts
					},
					{
						new: false
					}
				);

				if (saveProduct?._id && updatecategory?.acknowledged && updatebrand?.acknowledged) {
					linkAllImagesToProducts()
					res.status(200).json({
						status: 200,
						message: "Product Created in Succesfully"
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

router.post("/Update-Product/:id", async (req, res) => {
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

router.post("/Delete-Product/:id", async (req, res) => {
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

				if (saveProduct?._id) {
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

router.post("/Add-Product-Accesories/:ProductCode", async (req, res) => {
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

router.post("/Remove-Product-Accesories/:ProductCode", async (req, res) => {
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

				material.filter((item) => {
					console.log(
						item.toString() != Credentials?.MaterialProductId,
						item,
						Credentials?.MaterialProductId
					);
					if (item != new mongoose.Types.ObjectId(Credentials?.MaterialProductId)) return item;
				});
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
