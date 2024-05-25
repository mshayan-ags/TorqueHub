const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true
		},
		content: {
			type: String,
			required: true
		},
		categories: [
			{
				type: String
			}
		],
		tags: [
			{
				type: String
			}
		],
		publicationDate: {
			type: Date,
			default: Date.now
		},
		Admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin"
		},
		Image: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Image"
		},
		isArchive: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
