import New from "../Section/New";
import CategoryShowcase from "../Section/CategoryShowcase";
import TrustBar from "../Section/TrustBar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { withProductContext } from "../context/Product";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCogs, FaShoppingBag } from "react-icons/fa";

function Home({ shuffleArr, AllProduct, GetAllProduct, AllCategories }) {
	const navigate = useNavigate()
	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		GetAllProduct();
	}, [])
	
	return (
		<div className="relative min-h-screen bg-white">

			<Header />

			{/* Hero Section */}
			<div className="relative z-10 px-[6%] pt-16 pb-20 text-center max-w-4xl mx-auto">
				<div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[#d2d2d7] text-[#6e6e73] text-sm">
					<FaCogs className="w-3.5 h-3.5" />
					Premium Auto Parts
				</div>

				<h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-[#1d1d1f] leading-[1.05]">
					Everything your<br />vehicle needs.
				</h1>

				<p className="text-lg md:text-xl text-[#6e6e73] leading-relaxed mt-6 max-w-2xl mx-auto">
					Premium parts and accessories built for performance and reliability — from essential replacements to performance upgrades.
				</p>

				<div className="flex flex-wrap items-center justify-center gap-6 mt-9">
					<button
						onClick={() => navigate('/Category')}
						className="px-7 py-3 bg-[#f97316] hover:bg-[#ea580c] rounded-full text-white font-medium transition-colors duration-200 flex items-center gap-2"
					>
						Shop Now
						<FaShoppingBag className="w-4 h-4" />
					</button>

					<button
						onClick={() => navigate('/About')}
						className="text-[#1d1d1f] font-medium hover:text-[#f97316] transition-colors duration-200"
					>
						Learn more &rsaquo;
					</button>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-10 border-t border-[#d2d2d7]">
					<div>
						<div className="text-3xl font-semibold text-[#1d1d1f]">{AllProduct?.length || 0}+</div>
						<div className="text-sm text-[#6e6e73] mt-1">Products</div>
					</div>
					<div>
						<div className="text-3xl font-semibold text-[#1d1d1f]">Free</div>
						<div className="text-sm text-[#6e6e73] mt-1">Shipping</div>
					</div>
					<div>
						<div className="text-3xl font-semibold text-[#1d1d1f]">100%</div>
						<div className="text-sm text-[#6e6e73] mt-1">Genuine</div>
					</div>
					<div>
						<div className="text-3xl font-semibold text-[#1d1d1f]">5.0</div>
						<div className="text-sm text-[#6e6e73] mt-1">Rating</div>
					</div>
				</div>
			</div>
			
			{/* Trust Bar */}
			<div className="relative z-10">
				<TrustBar />
			</div>

			{/* Shop by Category Section */}
			<div className="relative z-10 px-[5%] mt-[5%] mb-[5%]">
				<CategoryShowcase AllCategories={AllCategories} />
			</div>

			{/* Products Section */}
			<div className="relative z-10 px-[5%] mb-[5%]">
				<New
					heading={"New Arrivals"}
					ProductsArr={shuffleArr(AllProduct).sort(() => Math.random() - 0.1).slice(0, 4)}
				/>
			</div>
			
			<Footer />
		</div>
	);
}

export default withProductContext(Home);
