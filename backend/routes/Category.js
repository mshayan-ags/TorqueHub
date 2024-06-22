const { Category } = require("../models/Category");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");

const router = Router();

router.post("/Create-Category", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["name", "description"],
				res
			);
			if (Check) {
				return;
			}
			const newCategory = new Category({
				name: Credentials?.name,
				description: Credentials?.description
			});

			const saveCategory = await newCategory.save();

			if (saveCategory?._id) {
				res.status(200).json({
					status: 200,
					message: "Category Created in Succesfully"
				});
			} else {
				res.status(500).json({ status: 500, message: "Something Went Wrong" });
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

router.post("/Update-Category/:id", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchCategory = await Category.findOne({ _id: req?.params?.id });
			if (searchCategory?._id) {
				const updateCategory = {
					name: Credentials?.name || searchCategory?.name,
					description: Credentials?.description || searchCategory?.description
				};

				const saveCategory = await Category.updateOne(
					{
						_id: req?.params?.id
					},
					updateCategory,
					{
						new: false
					}
				);

				if (saveCategory?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Category Updated in Succesfully"
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

router.get("/CategoryInfo/:id", async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
		if (Check) {
			return;
		}

		Category.findOne({ _id: req.params.id })
			.populate()
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

router.get("/GetAllCategorys", async (req, res) => {
	try {
		Category.find()
			.populate()
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
