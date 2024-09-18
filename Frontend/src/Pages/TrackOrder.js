import React, { useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BreadCrumbContainer from "../Components/BreadCrumbs";
import OrderSummary from "../Components/OrderSummary";
import axios from "axios";
import { BackendLink } from "../link";
import { FaSearch } from "react-icons/fa";

function TrackOrder() {
	const [orderId, setOrderId] = useState("");
	const [email, setEmail] = useState("");
	const [Loading, setLoading] = useState(false);
	const [Error, setErrorMsg] = useState("");
	const [Order, setOrder] = useState(null);

	const handleSubmit = () => {
		if (!orderId || !email) {
			setErrorMsg("Please enter both your order ID and email");
			return;
		}
		setLoading(true);
		setErrorMsg("");
		setOrder(null);
		axios
			.get(`${BackendLink}/Track-Guest-Order`, { params: { orderId: orderId.trim(), email: email.trim() } })
			.then((res) => {
				setLoading(false);
				if (res?.data?.status == 200) {
					setOrder(res?.data?.data);
				} else {
					setErrorMsg(res?.data?.message || "Order not found");
				}
			})
			.catch((err) => {
				setLoading(false);
				setErrorMsg(err?.response?.data?.message || "Order not found");
			});
	};

	return (
		<div className="relative min-h-screen bg-white">
			<Header />
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<BreadCrumbContainer />

				<div className="max-w-xl mx-auto mt-8 mb-10">
					<h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight text-center mb-2">
						Track Your Order
					</h1>
					<p className="text-[#6e6e73] text-center mb-8">
						Enter your order ID and the email used at checkout — no account needed.
					</p>

					<div className="bg-white border border-[#d2d2d7] rounded-2xl p-6 md:p-8 space-y-4">
						<div>
							<label className="block text-sm font-medium text-[#1d1d1f] mb-2">Order ID</label>
							<input
								value={orderId}
								onChange={(e) => setOrderId(e.target.value)}
								placeholder="e.g. 65f0a1b2c3d4e5f678901234"
								className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] focus:border-[#f97316] outline-none transition-colors"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-[#1d1d1f] mb-2">Email Address</label>
							<input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type="email"
								placeholder="you@example.com"
								className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] focus:border-[#f97316] outline-none transition-colors"
								onKeyDown={(e) => {
									if (e.key === "Enter" && !Loading) handleSubmit();
								}}
							/>
						</div>
						{Error && <p className="text-sm text-red-500">{Error}</p>}
						<button
							onClick={handleSubmit}
							disabled={Loading}
							className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-full transition-colors duration-200 disabled:opacity-60"
						>
							<FaSearch className="w-4 h-4" />
							{Loading ? "Searching..." : "Track Order"}
						</button>
					</div>
				</div>

				{Order && <OrderSummary state={Order} Live={false} />}
			</div>
			<Footer />
		</div>
	);
}

export default TrackOrder;
