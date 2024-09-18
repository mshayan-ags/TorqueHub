import React from "react";
import { FaFacebook, FaYoutube, FaTwitter, FaInstagram } from "react-icons/fa";
import Logo from "../../assets/TorqueHubLogo.svg";
import "./index.css"
import { useNavigate } from "react-router-dom";

const socialIcons = [FaFacebook, FaYoutube, FaTwitter, FaInstagram];

function Footer({ }) {
	const navigate = useNavigate()
	return (
		<footer className="bg-[#f5f5f7] text-[#1d1d1f] pt-14 pb-8 px-6 border-t border-[#d2d2d7]">
			<div className="max-w-7xl mx-auto">
				<div className="border border-[#d2d2d7] rounded-2xl bg-white p-10 text-center mb-14">
					<h3 className="text-2xl font-semibold mb-2 tracking-tight">
						Stay in the loop
					</h3>
					<p className="text-[#6e6e73] mb-7 text-sm">Join our community and get exclusive updates.</p>

					<div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
						<input
							className="flex-1 rounded-full px-5 py-3 text-sm text-[#1d1d1f] placeholder-[#86868b] bg-white border border-[#d2d2d7] outline-none focus:border-[#f97316] transition-colors duration-200"
							placeholder="Enter your email"
							type="email"
						/>
						<button className="bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded-full px-7 py-3 transition-colors duration-200">
							Subscribe
						</button>
					</div>
				</div>

				<div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 pb-10 border-b border-[#d2d2d7]">
					<div className="flex items-center gap-2">
						<img src={Logo} className="w-8 h-8 cursor-pointer" onClick={() => navigate("/")} alt="TorqueHub" />
						<span className="font-semibold text-sm">TorqueHub</span>
					</div>

					<div className="flex flex-wrap justify-center gap-8 text-sm text-[#1d1d1f]">
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/")}>Home</span>
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/Category")}>Shop</span>
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/About")}>About</span>
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/Blog")}>Blog</span>
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/Profile")}>My Profile</span>
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/Track-Order")}>Track an Order</span>
					</div>

					<div className="flex gap-4">
						{socialIcons.map((Icon, i) => (
							<div key={i} className="w-9 h-9 rounded-full border border-[#d2d2d7] flex items-center justify-center cursor-pointer text-[#6e6e73] hover:text-[#f97316] hover:border-[#f97316] transition-colors duration-200">
								<Icon width={"15px"} height={"15px"} />
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col md:flex-row items-center justify-between w-full pt-6 gap-4 text-sm text-[#6e6e73]">
					<p>© {new Date().getFullYear()} TorqueHub. All rights reserved.</p>
					<div className="flex gap-6">
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/TermsOfUse")}>
							Terms of Service
						</span>
						<span className="cursor-pointer hover:text-[#f97316] transition-colors" onClick={() => navigate("/privacy-policy")}>
							Privacy Policy
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
