const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
	{
		filename: {
			type: String,
			required: true
		},
		mimetype: {
			type: String,
			required: true,
			trim: true
		},
		blobUrl: {                           // NEW FIELD
			type: String,
			required: true
		},
		blobName: {                          // NEW FIELD
			type: String,
			required: true
		},
		containerName: {                     // NEW FIELD
			type: String,
			default: 'uploads'
		},
		Admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin"
		},
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		Brand: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Brand"
		},
		Product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product"
		},
		Blog: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Blog"
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

const Image = mongoose.model("Image", ImageSchema);


module.exports = { Image };
