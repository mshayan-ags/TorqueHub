import React from "react";
import Border from "../Components/Button/Border";
import { FaChevronRight as Arrow } from "react-icons/fa";
import BlogCard from "../Components/Blog Card";

function Blog({ heading, subHeading, posts }) {
	return (
		<div className="overflow-hidden w-full flex flex-col items-center justify-center pt-[30px] pb-[30px]">
			<div className="flex flex-row justify-between mt-[28px] mb-[28px] w-full">
				<div>
					<p className="text-black font-actor text-base font-normal leading-24">{subHeading}</p>
					<h2 className="text-primary font-bold font-abril-fatface text-2xl font-normal leading-36 capitalize">
						{heading}
					</h2>
				</div>
				<Border
					text={"View more"}
					Component={() => (
						<div className="w-5 h-5 flex items-center justify-center">
							<Arrow />
						</div>
					)}
				/>
			</div>
			<div className="w-full p-[20px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-0">
				{posts?.length
					? posts.slice(0, 3).map((p) => (
						<BlogCard
							key={p?._id}
							id={p?._id}
							title={p?.title}
							excerpt={p?.excerpt || p?.content?.slice?.(0, 120)}
							image={p?.image?.filename}
							date={p?.created_at}
							category={p?.category}
						/>
					))
					: null}
			</div>
		</div>
	);
}

export default Blog;
