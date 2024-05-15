import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Dog from "../../assets/AutoPartFallback.svg";
import { ImageCloud } from "../../link";

function BlogCard({ id, title, excerpt, image, date, category }) {
	const navigate = useNavigate();
	return (
		<div
			onClick={() => id && navigate(`/Blog/${id}`)}
			className="inline-flex flex-col p-[8px] flex-shrink-0 bg-white border border-[#d2d2d7] hover:border-[#f97316] rounded-2xl w-[90%] h-[100%] m-[10px] cursor-pointer transition-colors duration-200"
		>
			<img
				src={image ? `${ImageCloud}/${image}` : Dog}
				alt={title || "Blog"}
				className="w-full h-[244px] object-cover rounded-xl flex-shrink-0 bg-[#f5f5f7]"
			/>

			<div className="flex flex-col items-start p-[8px] pb-[20px] gap-0 overflow-hidden">
				<div className="flex p-[2px] px-[10px] items-start rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium leading-6">
					{category || "Auto knowledge"}
				</div>

				{date && (
					<p className="text-[#86868b] text-xs mt-2">
						{moment(date).format("DD MMM YYYY")}
					</p>
				)}

				<p className="text-[#1d1d1f] text-base font-medium leading-6 m-[12px] mr-[0px] ml-[0px] line-clamp-2">
					{title || "Untitled Post"}
				</p>
				<p className="overflow-hidden text-[#6e6e73] w-[90%] text-ellipsis whitespace-normal text-sm font-normal leading-5 line-clamp-3">
					{excerpt || ""}
				</p>
			</div>
		</div>
	);
}

export default BlogCard;
