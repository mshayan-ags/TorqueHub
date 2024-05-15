import React, { useEffect, useState } from "react";
import MainImage from "../../assets/AutoPartFallback.svg";
import axios from "axios";
import { BackendLink, ImageCloud } from "../../link";
import { withCartContext } from "../../context/Cart";
import { HiMinus, HiPlus } from "react-icons/hi";
import { FaTrash } from "react-icons/fa";

function CartCard({ id, isItemCart, RemoveItemCart, UpdateItemCart, getItemCart }) {

	const [quantity, setQuantity] = useState(1)

	const [ProductInfo, setProductInfo] = useState({});
	const [ProductError, setProductError] = useState(null);
	const GetProductInfo = () => {
		axios
			.get(`${BackendLink}/ProductInfo/${id}`)
			.then((res) => {
				if (res?.data?.status == 200) {
					window.scrollTo({
						top: 0,
						behavior: 'smooth' // This makes the scrolling smooth
					});
					setProductInfo(res?.data?.data);
				} else {
					setProductError(res?.data?.message);
				}
			})
			.catch((err) => {
				setProductError(err?.message);
			});
	};

	useEffect(() => {
		GetProductInfo()
	}, [id])


	useEffect(() => {
		if (isItemCart(ProductInfo?._id)) {
			UpdateItemCart(ProductInfo?._id, quantity)
		}
	}, [quantity])

	return (
		<React.Fragment>
			<div className="group relative md:flex md:flex-row grid grid-cols-8 gap-2 items-center justify-between p-4 md:p-6 border-b border-[#f0f0f2] hover:bg-[#f5f5f7] transition-colors duration-200">
				<div className="md:w-[38%] w-[100%] col-span-5 flex items-center gap-4">
					<div className="relative overflow-hidden rounded-xl bg-[#f5f5f7]">
						<img
							src={ProductInfo?.images?.[0]?.filename ? `${ImageCloud}/${ProductInfo?.images?.[0]?.filename}` : MainImage}
							className="w-[50px] h-[50px] md:w-[80px] md:h-[80px] object-cover"
							alt={ProductInfo?.name}
						/>
					</div>
					<div>
						<p className="text-sm md:text-base font-medium text-[#1d1d1f] mb-1">{ProductInfo?.name}</p>
						{ProductInfo?.Discount?._id && (
							<span className="inline-block px-3 py-1 bg-[#1d1d1f] text-white text-xs font-medium rounded-full">
								SALE
							</span>
						)}
					</div>
				</div>
				<div className="hidden md:flex md:w-[10%] w-[100%]">
					{ProductInfo?.Discount?._id ? (
						<div className="flex flex-col items-center">
							<p className="text-sm font-semibold text-[#1d1d1f]">
								${ProductInfo?.Discount?.DiscountType == 'Percentage' ? Number((ProductInfo?.price) - ((ProductInfo?.price) / 100 * ProductInfo?.Discount?.value))?.toFixed(2) : Number((ProductInfo?.price) - ProductInfo?.Discount?.value)?.toFixed(2)}
							</p>
							<p className="text-xs line-through text-[#86868b]">${Number(ProductInfo?.price)?.toFixed(2)}</p>
						</div>
					) : (
						<p className="text-sm md:text-base font-semibold text-[#1d1d1f]">
							${Number(ProductInfo?.price)?.toFixed(2)}
						</p>
					)}
				</div>
				<div className="md:w-[17%]">
					<div className="border border-[#d2d2d7] hover:border-[#f97316] gap-2 md:gap-4 h-10 md:h-12 rounded-full flex items-center justify-center px-3 md:px-4 bg-white transition-colors duration-200">
						<button onClick={() => {
							const a = getItemCart(id)?.quantity || quantity;
							setQuantity(a > 1 ? a - 1 : 1);
						}} className="text-[#1d1d1f]">
							<HiMinus className="w-4 h-4" />
						</button>
						<div className="text-sm md:text-lg font-medium text-[#1d1d1f] min-w-[20px] text-center">
							{getItemCart(id)?.quantity || quantity}
						</div>
						<button onClick={() => {
							const a = getItemCart(id)?.quantity || quantity;
							setQuantity(a + 1);
						}} className="text-[#1d1d1f]">
							<HiPlus className="w-4 h-4" />
						</button>
					</div>
				</div>
				<div className="md:w-[15%] w-[100%]">
					{ProductInfo?.Discount?._id ? (
						<div className="flex flex-col items-center md:items-end">
							<p className="text-base md:text-xl font-semibold text-[#1d1d1f] whitespace-nowrap">
								${ProductInfo?.Discount?.DiscountType == 'Percentage' ? Number((ProductInfo?.price - (ProductInfo?.price / 100 * ProductInfo?.Discount?.value)) * quantity)?.toFixed(2) : Number((ProductInfo?.price - ProductInfo?.Discount?.value) * quantity)?.toFixed(2)}
							</p>
							<p className="text-xs line-through text-[#86868b] whitespace-nowrap">${Number(ProductInfo?.price * quantity)?.toFixed(2)}</p>
						</div>
					) : (
						<p className="text-base md:text-xl font-semibold text-[#1d1d1f] text-center md:text-right whitespace-nowrap">
							${Number(ProductInfo?.price * quantity)?.toFixed(2)}
						</p>
					)}
				</div>
				<div className="md:w-[6%] w-[100%] flex justify-end">
					<button onClick={() => {
						if (isItemCart(ProductInfo?._id)) {
							RemoveItemCart(ProductInfo?._id)
						}
					}} className="group/btn p-2 hover:bg-red-50 rounded-full transition-colors duration-200">
						<FaTrash className="w-4 h-4 text-[#86868b] group-hover/btn:text-red-500 transition-colors" />
					</button>
				</div>
			</div>
		</React.Fragment>
	)
}
export default withCartContext(CartCard)