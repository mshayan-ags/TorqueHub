import React, { useEffect, useState } from "react";
import { withProductContext } from "../../context/Product";

function capitalizeWords(str) {
	return str
		.split(/\s+/) // Split string into words by whitespace
		.map(word =>
			word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter and lowercase the rest
		)
		.join(' '); // Join words back into a single string
}

function Filter({ AllCategories, GetAllCategories, AllBrand, GetAllBrand, setFilterValue, Materials, AllColors, AllSizes }) {

	useEffect(() => {
		GetAllBrand()
	}, [])

	useEffect(() => {
		GetAllCategories()
	}, [])

	const [Category, setCategory] = useState(null)
	const [Material, setMaterial] = useState(null)
	const [Brand, setBrand] = useState(null)
	const [Color, setColor] = useState(null)
	const [MinPrice, setMinPrice] = useState(null)
	const [MaxPrice, setMaxPrice] = useState(null)
	const [Weight, setWeight] = useState(null)


	useEffect(() => {
		setFilterValue({
			Category: Category,
			Material: Material,
			Brand: Brand,
			Color: Color,
			MinPrice: MinPrice,
			MaxPrice: MaxPrice,
			Weight: Weight,
		})
	}, [Category, Material, Brand, Color, MinPrice, MaxPrice, Weight])

	const [visibleCount, setVisibleCount] = useState({
		Category: 5,
		Material: 5,
		Brand: 5,
		Color: 5,
		Weight: 5,
	});

	const handleShowMore = (arr, prevCount, name) => {
		setVisibleCount({ ...visibleCount, [name]: Math.min(prevCount + 5, arr.length) }); // Show 5 more items or the total length if less
	};
	return (
		<div className="flex flex-col items-start justify-start pt-[7px] px-0 pb-0 box-border">
			<div className="flex flex-col items-start justify-start">
				{AllCategories?.length > 0 && <div className="flex flex-col items-start justify-start pt-0 px-0 pb-[28px] gap-[10px_0px] border-b-[1px] border-solid border-neutral-color-10">
					<div className="relative text-[15px] md:text-[20px] font-[600] leading-[24px] flex items-end box-border pr-5">
						Categories
					</div>
					<div className="flex flex-col items-start justify-start py-0 pr-5 pl-0 gap-[8px_0px] text-sm">
						<div className="flex flex-row items-center justify-start gap-[0px_10px]">
							<div className={`h-4 w-4 relative rounded ${Category == ("" || null) ? "bg-[#f97316]" : "bg-white"} box-border overflow-hidden shrink-0 border-[1px] border-solid border-neutral-color-20`} onClick={() => {
								setCategory(null)
							}} />
							<div className="relative text-[12px] md:text-[15px]">{capitalizeWords("All")}</div>
						</div>
						{AllCategories?.length ? AllCategories?.slice(0, visibleCount?.Category)?.map((a) => {
							return <div className="flex flex-row items-center justify-start gap-[0px_10px]">
								<div className={`h-4 w-4 relative rounded ${Category == a?._id ? "bg-[#f97316]" : "bg-white"} box-border overflow-hidden shrink-0 border-[1px] border-solid border-neutral-color-20`} onClick={() => {
									setCategory(a?._id)
								}} />
								<div className="relative text-[12px] md:text-[15px]">{capitalizeWords(a?.name)}</div>
							</div>
						}) : null}
						{visibleCount?.Category < AllCategories?.length && (
							<button onClick={() => handleShowMore(AllCategories, visibleCount?.Category, "Category")} className="mt-4 p-2 text-[12px] md:text-[15px] px-4 bg-primary text-white rounded-full">
								Show More ({AllCategories?.length - visibleCount?.Category})
							</button>
						)}
					</div>
				</div>}
				{AllBrand?.length > 0 && <div className="flex flex-col items-start justify-start py-4 px-0 gap-[10px_0px] border-b-[1px] border-solid border-neutral-color-10">
					<div className="relative text-[15px] md:text-[20px] font-[600] leading-[24px] flex items-end box-border pr-5">
						Brands
					</div>
					<div className="flex flex-col items-start justify-start py-0 pr-5 pl-0 gap-[8px_0px] text-sm">
						<div className="flex flex-row items-start justify-start gap-[0px_10px]">
							<div onClick={() => {
								setBrand(null)
							}} className={`h-5 w-5 relative rounded-[100%] ${Brand == ("" || null) ? "bg-[#f97316]" : "bg-neutral-color-00"} box-border overflow-hidden shrink-0 border-[6px] border-solid border-primary-color-dark-blue`} />
							<div className="relative text-[12px] md:text-[15px]">All</div>
						</div>
						{AllBrand?.length ? AllBrand?.slice(0, visibleCount?.Brand)?.map((a) => (
							<div className="flex flex-row items-start justify-start gap-[0px_10px]">
								<div onClick={() => {
									setBrand(a?._id)
								}} className={`h-5 w-5 relative rounded-[100%] ${Brand == a?._id ? "bg-[#f97316]" : "bg-neutral-color-00"} box-border overflow-hidden shrink-0 border-[6px] border-solid border-primary-color-dark-blue`} />
								<div className="relative text-[12px] md:text-[15px]">{capitalizeWords(a?.name)}</div>
							</div>
						)) : null}
						{visibleCount?.Brand < AllBrand?.length && (
							<button onClick={() => handleShowMore(AllCategories, visibleCount?.Brand, "Brand")} className="mt-4 p-2 text-[12px] md:text-[15px] px-4 bg-primary text-white rounded-full">
								Show More ({AllBrand?.length - visibleCount?.Brand})
							</button>
						)}
					</div>
				</div>}
				{Materials?.length > 0 && <div className="flex flex-col items-start justify-start py-4 px-0 gap-[10px_0px] border-b-[1px] border-solid border-neutral-color-10">
					<div className="relative text-[15px] md:text-[20px] font-[600] leading-[24px] flex items-end box-border pr-5">
						Material
					</div>
					<div className="flex flex-col items-start justify-start py-0 pr-5 pl-0 gap-[8px_0px] text-sm">
						<div className="flex flex-row items-center justify-start gap-[0px_10px]">
							<div className={`h-4 w-4 relative rounded-[100%] ${Material == ("" || null) ? "bg-[#f97316]" : "bg-white"} box-border overflow-hidden shrink-0 border-[1px] border-solid border-neutral-color-20`} onClick={() => {
								setMaterial(null)
							}} />
							<div className="relative text-[12px] md:text-[15px]">All</div>
						</div>
						{Materials?.slice(0, visibleCount?.Material).map((a) => {
							return <div className="flex flex-row items-center justify-start gap-[0px_10px]">
								<div className={`h-4 w-4 relative rounded-[100%] ${Material == a ? "bg-[#f97316]" : "bg-white"} box-border overflow-hidden shrink-0 border-[1px] border-solid border-neutral-color-20`} onClick={() => {
									setMaterial(a)
								}} />
								<div className="relative text-[12px] md:text-[15px]">{a}</div>
							</div>
						})}
						{visibleCount?.Material < Materials?.length && (
							<button onClick={() => handleShowMore(AllCategories, visibleCount?.Material, "Material")} className="mt-4 p-2 text-[12px] md:text-[15px] px-4 bg-primary text-white rounded-full">
								Show More ({Materials?.length - visibleCount?.Material})
							</button>
						)}
					</div>
				</div>}
				{AllColors?.length > 0 && <div className="flex flex-col items-start justify-start py-4 px-0 gap-[10px_0px] border-b-[1px] border-solid border-neutral-color-10">
					<div className="relative text-[15px] md:text-[20px] font-[600] leading-[24px] flex items-end box-border pr-5">
						Color
					</div>
					<div className="flex flex-col items-start justify-start py-0 pr-5 pl-0 gap-[8px_0px] text-sm">
						{AllColors.map((a) => {
							return <div className="flex flex-row items-center justify-start gap-[0px_10px]">
								<div className={`h-4 w-4 relative rounded ${Color == a ? "bg-[#f97316]" : "bg-white"} box-border overflow-hidden shrink-0 border-[1px] border-solid border-neutral-color-20`} onClick={() => {
									setColor(a)
								}} />
								<div className={`h-[15px] w-[15px] relative rounded-[10px] bg-[${a || "#000"}] overflow-hidden shrink-0`} style={{ background: a || "#000" }} />
								<div className="relative text-[12px] md:text-[15px]">{a}</div>
							</div>
						})}
					</div>
				</div>}
				<div className="flex flex-col items-start justify-start py-4 px-0 gap-[10px_0px]">
					<div className="relative text-[15px] md:text-[20px] font-[600] leading-[24px] flex items-end box-border pr-5">
						Price
					</div>
					<div className="flex flex-row items-start justify-between gap-[10px] text-sm text-neutral-color-80">
						<input type="number" value={MinPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-[135px] box-border p-2.5 border-b-[1px] border-solid border-neutral-color-10 text-[12px] md:text-[15px] outline-none" />
						<input type="number" value={MaxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-[135px] box-border p-2.5 border-b-[1px] border-solid border-neutral-color-10 text-[12px] md:text-[15px] outline-none" />
					</div>
				</div>
				{AllSizes?.length > 0 && <div className="flex flex-col items-start justify-start py-4 px-0 gap-[10px_0px] border-b-[1px] border-solid border-neutral-color-10">
					<div className=" relative leading-[24px] text-[15px] md:text-[20px] font-[600] flex items-end box-border pr-5">
						Size
					</div>
					<div className="flex flex-col items-start justify-start py-0 pr-5 pl-0 gap-[8px_0px] text-sm">
						<div className="flex flex-row items-center justify-start gap-[0px_10px]">
							<div className={`h-4 w-4 relative rounded ${Weight == ("" || null) ? "bg-[#f97316]" : "bg-white"} box-border overflow-hidden shrink-0 border-[1px] border-solid border-neutral-color-20`} onClick={() => {
								setWeight(null)
							}} />
							<div className="relative text-[12px] md:text-[15px]">All</div>
						</div>
						{AllSizes?.slice(0, visibleCount?.Weight).map((a) => {
							return <div className="flex flex-row items-center justify-start gap-[0px_10px]">
								<div className={`h-4 w-4 relative rounded ${Weight == a ? "bg-[#f97316]" : "bg-white"} box-border overflow-hidden shrink-0 border-[1px] border-solid border-neutral-color-20`} onClick={() => {
									setWeight(a)
								}} />
								<div className="relative text-[12px] md:text-[15px]">{a}</div>
							</div>
						})}
						{visibleCount?.Weight < AllSizes?.length && (
							<button onClick={() => handleShowMore(AllCategories, visibleCount?.Weight, "Weight")} className="mt-4 p-2 text-[12px] md:text-[15px] px-4 bg-primary text-white rounded-full">
								Show More ({AllSizes?.length - visibleCount?.Weight})
							</button>
						)}
					</div>
				</div>}
			</div>
		</div >
	);
}

export default withProductContext(Filter);
