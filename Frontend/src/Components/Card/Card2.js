import React, { useEffect, useState } from "react";
import Dog from "../../assets/AutoPartFallback.svg";
import { useNavigate } from "react-router-dom";
import { withCartContext } from "../../context/Cart";
import { BackendLink, ImageCloud } from "../../link";
import axios from "axios";

const ListCard = ({ id, getItemCart }) => {
	const navigate = useNavigate()

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

	const quantity = getItemCart(id)?.quantity
	return (
		<div className="flex items-center justify-between mb-[20px]">
			<div className="flex items-center max-w-[80%]">
				<img onClick={() => {
					navigate(`/ProductDetails/${ProductInfo?._id}`)
				}} src={ProductInfo?.images?.[0]?.filename ? `${ImageCloud}/${ProductInfo?.images?.[0]?.filename}` : Dog} alt="" className="w-[60px] h-[60px] mr-[10px] rounded-lg object-cover bg-[#f5f5f7] cursor-pointer" />
				<p className="text-[13px] md:text-[15px] leading-[21px] font-medium text-[#1d1d1f]">{ProductInfo?.name} x {quantity}</p>
			</div>
			<div className="flex flex-row gap-4 items-center">
				{ProductInfo?.Discount?._id ? (
					<p className="text-center text-[16px] leading-[24px] font-semibold text-[#1d1d1f]">
						<del className="text-[#86868b] text-[13px] mr-[5px] truncate">${Number(ProductInfo?.price * quantity)?.toFixed(2)}</del>
						${ProductInfo?.Discount?.DiscountType == 'Percentage' ? Number((ProductInfo?.price - (ProductInfo?.price / 100 * ProductInfo?.Discount?.value)) * quantity)?.toFixed(2) : Number((ProductInfo?.price - ProductInfo?.Discount?.value) * quantity)?.toFixed(2)}
					</p>
				) : (
					<p className="text-center text-[16px] leading-[24px] font-semibold text-[#1d1d1f]">
						${Number(ProductInfo?.price * quantity)?.toFixed(2)}
					</p>
				)}
			</div>
		</div>
	);
};

export default withCartContext(ListCard);
