const Blog = require("../models/Blog");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { SaveImageDB } = require("./Image");
const { default: mongoose } = require("mongoose");
const { requirePermission } = require("../Middlewares/RequirePermission");

const router = Router();

// Accepts either a single {name,data,type} base64 image object, an array of
// them, or already-existing Image ObjectId string(s) — matches the shape the
// admin panel's Upload component sends for other entities (Brand/Product).
async function resolveBlogImages(rawImage, blogId, res) {
	if (!rawImage) return undefined;

	const items = Array.isArray(rawImage) ? rawImage : [rawImage];
	const resolvedIds = [];

	for (const item of items) {
		if (item?.name && item?.data) {
			const image = await SaveImageDB(item, { Blog: new mongoose.Types.ObjectId(blogId) }, res);
			if (image?.file?._id) {
				resolvedIds.push(new mongoose.Types.ObjectId(image.file._id));
			} else {
				res.status(500).json({ status: 500, message: image?.Error || "Image upload failed" });
				return null;
			}
		} else if (typeof item === "string") {
			resolvedIds.push(new mongoose.Types.ObjectId(item));
		}
	}

	return resolvedIds;
}

router.get("/GetAllBlogs", async (req, res) => {
	try {
		Blog.find({ isArchive: false })
			.populate(["Image"])
			.sort({ publicationDate: -1 })
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

router.get("/BlogInfo/:id", async (req, res) => {
	try {
		Blog.findOne({ _id: req.params.id })
			.populate(["Image"])
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

router.post("/Create-Blog", requirePermission("manageContent"), async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Credentials = req.body;
		const Check = await CheckAllRequiredFieldsAvailaible(Credentials, ["title", "content"], res);
		if (Check) {
			return;
		}

		const newBlog = new Blog({
			title: Credentials?.title,
			content: Credentials?.content,
			categories: Credentials?.categories,
			tags: Credentials?.tags,
			Admin: id
		});

		await newBlog.save();

		if (Credentials?.Image) {
			const resolvedImages = await resolveBlogImages(Credentials?.Image, newBlog?._id, res);
			if (resolvedImages === null) return; // resolveBlogImages already sent an error response
			if (resolvedImages) {
				await Blog.updateOne({ _id: newBlog?._id }, { Image: resolvedImages }, { new: false });
			}
		}

		res.status(200).json({ status: 200, message: "Blog Created Successfully", id: newBlog?._id });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Update-Blog/:id", requirePermission("manageContent"), async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Credentials = req.body;
		const searchBlog = await Blog.findOne({ _id: req.params.id });
		if (!searchBlog?._id) {
			return res.status(401).json({ status: 401, message: "Blog Not Found" });
		}

		const updateBlog = {
			title: Credentials?.title ?? searchBlog?.title,
			content: Credentials?.content ?? searchBlog?.content,
			categories: Credentials?.categories ?? searchBlog?.categories,
			tags: Credentials?.tags ?? searchBlog?.tags
		};

		if (Credentials?.Image) {
			const resolvedImages = await resolveBlogImages(Credentials?.Image, searchBlog?._id, res);
			if (resolvedImages === null) return; // resolveBlogImages already sent an error response
			if (resolvedImages) {
				updateBlog.Image = resolvedImages;
			}
		}

		await Blog.updateOne({ _id: req.params.id }, updateBlog, { new: false });
		res.status(200).json({ status: 200, message: "Blog Updated Successfully" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Delete-Blog/:id", requirePermission("manageContent"), async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const searchBlog = await Blog.findOne({ _id: req.params.id });
		if (!searchBlog?._id) {
			return res.status(401).json({ status: 401, message: "Blog Not Found" });
		}

		await Blog.updateOne({ _id: req.params.id }, { isArchive: true }, { new: false });
		res.status(200).json({ status: 200, message: "Blog Deleted Successfully" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
