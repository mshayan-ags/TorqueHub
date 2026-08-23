const { Address } = require("../models/Address");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");

const router = Router();

router.post("/Create-Address", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				[
					"full_name",
					"phone_number",
					"address_line1",
					"city",
					"state",
					"postal_code",
					"country",
				],
				res
			);
			if (Check) {
				return;
			}
			const searchUser = await User.findOne({ _id: id });
			if (searchUser?._id) {
				const newAddress = new Address({
					full_name: Credentials?.full_name,
					phone_number: Credentials?.phone_number,
					address_line1: Credentials?.address_line1,
					city: Credentials?.city,
					state: Credentials?.state,
					postal_code: Credentials?.postal_code,
					country: Credentials?.country,
					address_line2: Credentials?.address_line2,
					is_default: Credentials?.is_default,
					isArchive: false,
					User: new mongoose.Types.ObjectId(id)
				});

				const saveAddress = await newAddress.save();

				const searchUserAddresses = await Address.find({ User: id }).select("_id");
				const updateUser = await User.updateOne(
					{ _id: id },
					{
						Address: searchUserAddresses
					},
					{
						new: false
					}
				);

				if (saveAddress?._id && updateUser?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Address Created in Succesfully",
						id: saveAddress?._id
					});
				} else {
					console.log("1")
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(401).json({ status: 401, message: "Please Check Your Data" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log("2", error)

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

router.post("/Update-Address/:id", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchUser = await User.findOne({ _id: id });
			const searchAddress = await Address.findOne({ _id: req?.params?.id });
			if (searchAddress?.User?.toString() !== id) {
				return res.status(403).json({ status: 403, message: "Forbidden" });
			}
			if (searchUser?._id && searchAddress?._id) {
				const updateAddress = {
					full_name: Credentials?.full_name || searchAddress?.full_name,
					phone_number: Credentials?.phone_number || searchAddress?.phone_number,
					address_line1: Credentials?.address_line1 || searchAddress?.address_line1,
					city: Credentials?.city || searchAddress?.city,
					state: Credentials?.state || searchAddress?.state,
					postal_code: Credentials?.postal_code || searchAddress?.postal_code,
					country: Credentials?.country || searchAddress?.country,
					address_line2: Credentials?.address_line2 || searchAddress?.address_line2,
					is_default: Credentials?.is_default || searchAddress?.is_default
				};

				const saveAddress = await Address.updateOne(
					{
						_id: req?.params?.id
					},
					updateAddress,
					{
						new: false
					}
				);

				const searchUserAddresses = await Address.find({ User: id }).select("_id");
				const updateUser = await User.updateOne(
					{ _id: id },
					{
						Address: searchUserAddresses
					},
					{
						new: false
					}
				);

				if (saveAddress?.acknowledged && updateUser?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Address Updated in Succesfully"
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

router.post("/Delete-Address/:id", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchUser = await User.findOne({ _id: id });
			const searchAddress = await Address.findOne({ _id: req?.params?.id });
			if (searchAddress?.User?.toString() !== id) {
				return res.status(403).json({ status: 403, message: "Forbidden" });
			}
			if (searchUser?._id && searchAddress?._id) {
				const updateAddress = {
					isArchive: true
				};

				const saveAddress = await Address.updateOne(
					{
						_id: req?.params?.id
					},
					updateAddress,
					{
						new: false
					}
				);

				const searchUserAddresses = await Address.find({ User: id }).select("_id");
				const updateUser = await User.updateOne(
					{ _id: id },
					{
						Address: searchUserAddresses
					},
					{
						new: false
					}
				);

				if (saveAddress?.acknowledged && updateUser?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Address Deleted in Succesfully"
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

router.get("/AddressInfo/:id", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		const { id: userId, message: userMessage } = await getUserId(req);
		if (id || userId) {
			const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
			if (Check) {
				return;
			}

			Address.findOne({ _id: req.params.id })
				.populate(["User"])
				.then((data) => {
					if (!id && data?.User?._id?.toString() !== userId) {
						return res.status(403).json({ status: 403, message: "Forbidden" });
					}
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message || userMessage });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllAddresss", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);

		if (id) {
			Address.find()
				.populate(["User"])
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

router.get("/GetAllAddressUser", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);

		if (id) {
			Address.find({
				User: id,
				isArchive: false
			})
				.populate(["User"])
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
module.exports = router;
