const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
	{
		Product: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		ProductCode: {
			type: String,
			required: true,
			trim: true
		},
		name: {
			type: String,
			required: true,
			trim: true
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0
		},
		quantity: {
			type: String,
			required: true,
		},
		currentColor: {
			type: String,
			default: "-"
		},
		condition: {
			type: String,
			// enum: [
			// 	"New",
			// 	"Used",
			// 	"Refurbished",
			// 	"OEM",
			// 	"Aftermarket"
			// ],
			default: "New"
		},
		currentSize: {
			type: String,
			default: "-"
		},
		currentMaterial: {
			type: String,
			// enum: [
			// 	"ceramic",
			// 	"semi-metallic",
			// 	"organic",
			// 	"aluminum",
			// 	"steel",
			// 	"carbon-fiber",
			// 	"rubber",
			// 	"cast-iron",
			// 	"composite",
			// 	"chrome"
			// ],
			default: "-"
		},
		isArchive: {
			type: Boolean,
			default: false
		},
		specifications: {
			type: String,
		},
		technical_specs: {
			weight: {
				type: String
			},
			dimensions: {
				type: String
			},
			warranty: {
				type: String
			}
		},
		brand: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Brand",
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		Discount: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Discount"
		},
		review: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Review"
		},
		whishlist: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Wishlist"
		},
		color: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Product"
		},
		size: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Product"
		},
		material: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Product"
		},
		images: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Image"
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

ProductSchema.index({ brand: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isArchive: 1 });
// Powers the $text-scored branch of GET /SearchProducts, for multi-word
// queries where a plain substring regex would miss any-word matches.
ProductSchema.index({ name: "text", description: "text", ProductCode: "text" });

const Product = mongoose.model("Product", ProductSchema);

module.exports = { Product };
