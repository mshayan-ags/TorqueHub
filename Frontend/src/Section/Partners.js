import React from "react";
import Border from "../Components/Button/Border";
import { FaChevronRight as Arrow } from "react-icons/fa";
import PatnersCrausoul from "../Components/Partners";
import { useNavigate } from "react-router-dom";

function Partners({ heading, subHeading }) {
	const navigate = useNavigate()

	return (
		<div className="overflow-hidden w-full flex flex-col items-center justify-center pb-[30px]">
			<div className="flex flex-row justify-between mb-[28px] w-full px-[5%]">
				<div className="flex flex-col md:flex-row align-center items-center justify-center">
					<p className="text-black font-actorPro hidden md:block text-xs md:text-md font-normal mr-[5px]">
						{subHeading}
					</p>
					<h2 className="text-primary font-[700] font-actorPro text-2xl md:text-3xl font-bold md:font-normal capitalize">
						{heading}
					</h2>
				</div>
				<Border
					onClick={() => navigate("/Category")}
					text={"View more"}
					Component={() => (
						<div className="w-5 h-5 flex items-center justify-center">
							<Arrow />
						</div>
					)}
				/>
			</div>
			<div className="p-[20px] w-full">
				<PatnersCrausoul />
			</div>
		</div>
	);
}

export default Partners;
