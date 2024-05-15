import React, { useEffect, useState } from "react";
import Dog from "../../assets/AutoPartFallback.svg";
import { useNavigate } from "react-router-dom";
import { withCartContext } from "../../context/Cart";
import { withWishlistContext } from "../../context/Wishlist";
import { ImageCloud } from "../../link";
import { BsFillBasket3Fill } from "react-icons/bs";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { HiMinus, HiPlus } from "react-icons/hi";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const CustomCard = ({ data, AddToCart, isItemCart, RemoveItemCart, UpdateItemCart, getItemCart, isWishlisted, ToggleWishlist }) => {
	const navigate = useNavigate()
	const [quantity, setQuantity] = useState(1)
	useEffect(() => {
		if (isItemCart(data?._id)) {
			UpdateItemCart(data?._id, quantity)
		}

	}, [quantity])

	return (
		<div 
			data-aos="zoom-in-up" 
			data-aos-delay="300" 
			data-aos-duration="3000" 
			className="group relative inline-flex flex-col p-[8px] flex-shrink-0 bg-white rounded-2xl shadow-sm hover:shadow-md w-[100%] h-[100%] transition-shadow duration-300 border border-[#d2d2d7] hover:border-[#f97316] overflow-hidden"
		>
			{/* Discount Badge */}
			{data?.Discount?._id && (
				<div className="absolute top-4 right-4 z-20 bg-[#1d1d1f] text-white px-3 py-1 rounded-full text-xs font-medium">
					SALE
				</div>
			)}

			<div
				onClick={() => {
					navigate(`/ProductDetails/${data?._id}`)
				}}
				className="cursor-pointer"
			>
				<div className={`md:w-[100%] h-[120px] md:h-[220px] flex-shrink-0 flex align-center justify-center items-center relative overflow-hidden rounded-xl bg-[#f5f5f7]`}>
					<img 
						src={data?.images?.[0]?.filename ? `${ImageCloud}/${data?.images?.[0]?.filename}` : Dog} 
						className="rounded-2xl w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
						alt="Product Image" 
					/>
				</div>

				<div className="flex flex-col items-start p-[8px] pb-[10px] md:pb-[20px] gap-0">
					<p className="text-[#1d1d1f] md:text-[16px] text-[10px] font-medium w-full overflow-hidden md:h-[50px] line-clamp-2 group-hover:text-[#f97316] transition-colors duration-200">
						{data?.name}
					</p>

					<div className="flex flex-col md:flex-row justify-start md:justify-between my-[10px] md:mt-[5px] md:gap-1 w-full">
						<div className="flex flex-row justify-start md:justify-center gap-1 items-center">
							<p className="text-[#6e6e73] md:text-[12px] text-[8px] font-medium leading-18">Qty:</p>
							<span className="px-2 py-0.5 bg-[#f5f5f7] rounded-full text-[#1d1d1f] md:text-[12px] text-[8px] font-medium">
								{data?.quantity}
							</span>
						</div>
						{data?.currentMaterial && (
							<div className="flex flex-row justify-start md:justify-center gap-1 items-center">
								<p className="text-[#6e6e73] md:text-[12px] text-[8px] font-medium leading-18">Material:</p>
								<span className="px-2 py-0.5 bg-[#f5f5f7] rounded-full text-[#1d1d1f] md:text-[12px] text-[8px] font-medium">
									{data?.currentMaterial.toUpperCase()}
								</span>
							</div>
						)}
					</div>

					<div className="flex flex-row justify-between w-full items-center">
						{data?.Discount?._id ? (
							<div className="flex flex-col">
								<p className="text-[#86868b] line-through md:text-[14px] text-[10px] font-medium">
									${Number(data?.price)?.toFixed(2)}
								</p>
								<p className="text-[#1d1d1f] md:text-[24px] text-[16px] font-semibold">
									${data?.Discount?.DiscountType == 'Percentage'
										? Number(data?.price - (data?.price / 100 * data?.Discount?.value))?.toFixed(2)
										: Number(data?.price - data?.Discount?.value)?.toFixed(2)}
								</p>
							</div>
						) : (
							<p className="text-[#1d1d1f] md:text-[24px] text-[16px] font-semibold">
								${Number(data?.price)?.toFixed(2)}
							</p>
						)}
					</div>
				</div>
			</div>

			<div className="flex flex-row align-center justify-evenly items-center gap-2 md:gap-4 mb-[10px]">
				<div
					onClick={(e) => {
						e.stopPropagation();
						ToggleWishlist && ToggleWishlist(data?._id);
					}}
					className="flex md:w-[44px] md:h-[44px] w-[40px] h-[40px] items-center justify-center rounded-full border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200 cursor-pointer"
				>
					{isWishlisted && isWishlisted(data?._id) ? (
						<FaHeart className="md:w-[18px] md:h-[18px] w-[13px] h-[13px] text-[#f97316]" />
					) : (
						<FaRegHeart className="md:w-[18px] md:h-[18px] w-[13px] h-[13px] text-[#6e6e73]" />
					)}
				</div>

				<div className="border border-[#d2d2d7] gap-2 md:gap-6 md:h-12 h-10 rounded-full flex flex-row items-center justify-center md:px-[20px] px-[8px] bg-white">
					<HiMinus
						className="md:h-[16px] md:w-[16px] h-[14px] w-[14px] cursor-pointer text-[#1d1d1f]"
						onClick={() => {
							const a = getItemCart(data?._id)?.quantity || quantity;
							setQuantity(a > 1 ? a - 1 : 1);
						}}
					/>
					<div className="md:text-[16px] text-[12px] font-medium text-[#1d1d1f] min-w-[20px] text-center">
						{getItemCart(data?._id)?.quantity || quantity}
					</div>
					<HiPlus
						className="md:h-[16px] md:w-[16px] h-[14px] w-[14px] cursor-pointer text-[#1d1d1f]"
						onClick={() => {
							const a = getItemCart(data?._id)?.quantity || quantity;
							setQuantity(a + 1);
						}}
					/>
				</div>

				<div
					onClick={() => {
						if (isItemCart(data?._id)) {
							RemoveItemCart(data?._id)
						} else {
							AddToCart({
								id: data?._id,
								quantity: quantity,
								price: data?.price,
								discountedPrice:
									data?.Discount?.DiscountType == 'Percentage' ? data?.price - (data?.price / 100 * data?.Discount?.value) : data?.price - data?.Discount?.value
								,
								DiscountID: data?.Discount?._id || null
							})
						}
					}}
					className="md:w-[44px] md:h-[44px] w-[40px] h-[40px] flex items-center justify-center rounded-full bg-[#f97316] hover:bg-[#ea580c] transition-colors duration-200 cursor-pointer"
				>
					{isItemCart(data?._id) ?
						<IoIosRemoveCircleOutline className="md:w-[20px] md:h-[20px] w-[15px] h-[15px] text-white" />
						: <BsFillBasket3Fill className="md:w-[18px] md:h-[18px] w-[13px] h-[13px] text-white" />
					}
				</div>
			</div>
		</div>
	);
};

export default withWishlistContext(withCartContext(CustomCard));
