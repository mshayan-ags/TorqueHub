const { Discount } = require('../models/Discount')
const { getAdminId } = require('../utils/AuthCheck')
const { Router } = require('express')
const { User } = require('../models/User')
const { default: mongoose } = require('mongoose')
const { CheckAllRequiredFieldsAvailaible } = require('../utils/functions')
const { Product } = require('../models/Product')
const { Brand } = require('../models/Brand')
const { Category } = require('../models/Category')
const { Admin } = require('../models/Admin')
const { logAction } = require('../utils/auditLog')
const { requirePermission } = require('../Middlewares/RequirePermission')

const router = Router()

router.post('/Create-Discount', requirePermission("manageContent"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req)

		if (id) {
			const Credentials = req.body

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				['type', 'DiscountType', 'value', 'startDate', 'endDate', 'isActive'],
				res,
			)
			if (Check) {
				return
			}
			const newDiscount = new Discount({
				type: Credentials?.type || null,
				DiscountType: Credentials?.DiscountType,
				value: Credentials?.value,
				startDate: Credentials?.startDate,
				endDate: Credentials?.endDate,
				isActive: Credentials?.isActive,
				Admin: new mongoose.Types.ObjectId(id),
				targetType: Credentials?.targetType ? new mongoose.Types.ObjectId(Credentials?.targetType) : null
			})

			// If Discount On Brand Or Category
			if (Credentials?.type) {
				const Document =
					Credentials?.type == 'Brand'
						? Brand
						: Credentials?.type == 'Category'
							? Category
							: null;
				if (Document?.collection && Credentials?.targetType) {
					const find = await Document?.find({ _id: Credentials?.targetType })

					if (find?._id) {
						newDiscount.targetType = new mongoose.Types.ObjectId(find?._id)

						await Document.updateOne(
							{ _id: find?._id },
							{
								Discount: new mongoose.Types.ObjectId(newDiscount?._id),
							},
							{
								new: false,
							},
						)
					}
				}
			}


			// Setting Discount On Products
			let ProductArr =
				Credentials?.type == 'Product'
					? await Product.find({
						_id: { $in: Credentials?.Products },
					})?.select('_id')
					: Credentials?.type == 'Brand'
						? await Product.find({ brand: Credentials?.targetType })?.select('_id')
						: Credentials?.type == 'Category'
							? await Product.find({ category: Credentials?.targetType })?.select(
								'_id',
							)
							: null

			newDiscount.Product = await ProductArr;
			const saveDiscount = await newDiscount.save()

			const searchAdminDiscountes = await Discount.find({ Admin: id }).select(
				'_id'
			)
			const updateAdmin = await Admin.updateOne(
				{ _id: id },
				{
					Discount: searchAdminDiscountes,
				},
				{
					new: false,
				},
			)
			let Count = 0;
			const ProductDiscounted = []
			async function AddDiscountToProduct() {
				await ProductArr?.forEach(async (a, i) => {
					const UpdateProduct = await Product.updateOne(
						{ _id: a },
						{
							Discount: new mongoose.Types.ObjectId(newDiscount?._id),
						},
						{
							new: false,
						},
					)
					if (await UpdateProduct?.acknowledged) {
						await ProductDiscounted.push(UpdateProduct?.acknowledged)
						if (ProductDiscounted?.length == ProductArr?.length) {
							await Response()
						} else if (Count < 4 && i == (ProductArr?.length - 1)) {
							await AddDiscountToProduct()
						}
					} else {
						await AddDiscountToProduct()
					}
				})
				await Count++;
			}
			async function Response(params) {
				if (saveDiscount?._id && ProductDiscounted?.length == ProductArr?.length) {
					logAction({
						adminId: id,
						action: "Create-Discount",
						targetType: "Discount",
						targetId: saveDiscount?._id,
						summary: `Created ${saveDiscount?.DiscountType} discount on ${ProductArr?.length} product(s)`
					});
					res.status(200).json({
						status: 200,
						message: "Discount Created in Succesfully"
					});
				} else {
					res.status(500).json({ status: 500, message: 'Something Went Wrong' })
				}
			}
			await AddDiscountToProduct();
		} else {
			res.status(401).json({ status: 401, message: message })
		}
	} catch (error) {
		console.log("2", error)

		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]
					} as it's not unique`,
			})
		} else {
			res.status(500).json({ status: 500, message: error })
		}
	}
})

router.post('/Update-Discount/:id', requirePermission("manageContent"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req)

		if (id) {
			const Credentials = req.body

			const Check = await CheckAllRequiredFieldsAvailaible(
				req?.params,
				['id'],
				res,
			)
			if (Check) {
				return
			}
			const searchDiscount = await Discount.findOne({ _id: req?.params?.id })
			if (searchDiscount?._id) {
				const updateDiscount = {
					DiscountType: Credentials?.DiscountType || searchDiscount?.DiscountType,
					value:
						Credentials?.value || searchDiscount?.value,
					startDate:
						Credentials?.startDate || searchDiscount?.startDate,
					endDate:
						Credentials?.endDate || searchDiscount?.endDate,
					isActive: Credentials?.isActive || searchDiscount?.isActive,
				}

				const saveDiscount = await Discount.updateOne(
					{
						_id: req?.params?.id,
					},
					updateDiscount,
					{
						new: false,
					},
				)
				if (saveDiscount?._id) {
					res.status(200).json({
						status: 200,
						message: 'Discount Updated in Succesfully',
					})
				} else {
					res.status(500).json({ status: 500, message: 'Something Went Wrong' })
				}
			} else {
				res.status(401).json({ status: 401, message: 'Please Check Your Data' })
			}
		} else {
			res.status(401).json({ status: 401, message: message })
		}
	} catch (error) {
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]
					} as it's not unique`,
			})
		} else {
			res.status(500).json({ status: 500, message: error })
		}
	}
})

router.get('/DiscountInfo/:id', async (req, res) => {
	try {
		const { id, message } = await getAdminId(req)
		const { id: userId, message: userMessage } = await getAdminId(req)
		if (id || userId) {
			const Check = await CheckAllRequiredFieldsAvailaible(
				req.params,
				['id'],
				res,
			)
			if (Check) {
				return
			}

			Discount.findOne({ _id: req.params.id })
				.populate([])
				.then((data) => {
					res.status(200).json({ status: 200, data: data })
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err })
				})
		} else {
			res.status(401).json({ status: 401, message: message || userMessage })
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error })
	}
})

router.get('/GetAllDiscounts', async (req, res) => {
	try {
		const { id, message } = await getAdminId(req)

		if (id) {
			Discount.find()
				.populate([])
				.then((data) => {
					res.status(200).json({ status: 200, data: data })
				})
				.catch((err) => {
					console.log(err)
					res.status(500).json({ status: 500, message: err })
				})
		} else {
			res.status(401).json({ status: 401, message: message })
		}
	} catch (error) {
		console.log(error)

		res.status(500).json({ status: 500, message: error })
	}
})

module.exports = router
