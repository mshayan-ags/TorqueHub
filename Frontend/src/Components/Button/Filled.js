import React from 'react'

function Filled({ text, onClick, width }) {
	return (
		<button data-aos="fade-right" data-aos-duration="1000" data-aos-delay="100" onClick={onClick} style={{
			width: width || "100%"
		}} className="rounded-full bg-primary color-dark-blue flex w-[100%] md:px-[28px] px-[18px] md:py-[10px] py-[5px] items-center justify-center gap-10 text-[white] font-actor md:text-base text-xs font-normal leading-6">
			{text}
		</button>
	);
}

export default Filled
