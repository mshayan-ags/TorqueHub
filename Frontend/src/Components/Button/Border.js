import React from "react";

function Border({ text, Component, onClick,style }) {
	return (
		<button data-aos="fade-right" data-aos-duration="1000" data-aos-delay="100" onClick={onClick} style={style} className="rounded-full border-2 border-primary inline-flex md:py-[10px] py-[5px] md:px-[28px] px-[15px] gap-2 items-center justify-center mr-[25px]">
			<p className="text-primary font-actorPro  font-normal leading-6 md:text-[14px] text-[10px]">{text}</p>
			{Component && <Component />}
		</button>
	);
}

export default Border;
