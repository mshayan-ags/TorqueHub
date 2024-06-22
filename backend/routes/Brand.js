const { Brand } = require("../models/Brand");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { SaveImageDB } = require("./Image");

const router = Router();

router.post("/Create-Brand", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["name", "description", "country", "website"],
				res
			);
			if (Check) {
				return;
			}
			const newBrand = new Brand({
				name: Credentials?.name,
				description: Credentials?.description,
				country: Credentials?.country,
				website: Credentials?.website
			});

			if (Credentials?.logo?.name) {
				const image = await SaveImageDB(
					Credentials?.logo,
					{ Brand: new mongoose.Types.ObjectId(newBrand?._id) },
					res
				);

				if (image?.file?._id) {
					newBrand.logo = new mongoose.Types.ObjectId(image?.file?._id);
				} else {
					res.status(500).json({ status: 500, message: image?.Error });
				}
			}

			const saveBrand = await newBrand.save();

			if (saveBrand?._id) {
				res.status(200).json({
					status: 200,
					message: "Brand Created in Succesfully"
				});
			} else {
				res.status(500).json({ status: 500, message: "Something Went Wrong" });
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

router.post("/Update-Brand/:id", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchBrand = await Brand.findOne({ _id: req?.params?.id });
			if (searchBrand?._id) {
				const updateBrand = {
					name: Credentials?.name || searchBrand?.name,
					description: Credentials?.description || searchBrand?.description,
					country: Credentials?.country || searchBrand?.country,
					website: Credentials?.website || searchBrand?.website
				};

				if (Credentials?.logo?.name) {
					const image = await SaveImageDB(
						Credentials?.logo,
						{ Brand: new mongoose.Types.ObjectId(searchBrand?._id) },
						res
					);

					if (image?.file?._id) {
						updateBrand.logo = new mongoose.Types.ObjectId(image?.file?._id);
					} else {
						res.status(500).json({ status: 500, message: image?.Error });
					}
				}

				const saveBrand = await Brand.updateOne(
					{
						_id: req?.params?.id
					},
					updateBrand,
					{
						new: false
					}
				);

				if (saveBrand?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Brand Updated in Succesfully"
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

router.get("/BrandInfo/:id", async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
		if (Check) {
			return;
		}

		Brand.findOne({ _id: req.params.id })
			.populate(["logo"])
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

router.get("/GetAllBrands", async (req, res) => {
	try {
		Brand.find()
			.populate(["logo"])
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

module.exports = router;
