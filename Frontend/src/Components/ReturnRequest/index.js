import React, { useEffect, useState } from "react";
import axios from "axios";
import swal from "sweetalert";
import { BackendLink } from "../../link";
import { withAuthContext } from "../../context/Auth";
import { MdAssignmentReturn } from "react-icons/md";

// Shown below the order items list on the authenticated OrderTracking page.
// Only ever rendered for Delivered orders (the backend enforces this too,
// via /Create-Return-Request's own status check).
function ReturnRequestPanel({ sale, Token }) {
	const [ExistingByLineItem, setExistingByLineItem] = useState({});
	const [OpenLineItem, setOpenLineItem] = useState(null);
	const [Reason, setReason] = useState("");
	const [Submitting, setSubmitting] = useState(false);

	const authHeader = () => ({
		headers: { Authorization: Token ? `${Token}` : `${localStorage.getItem("token")}` },
	});

	const loadExisting = () => {
		axios
			.get(`${BackendLink}/GetReturnRequestsUser`, authHeader())
			.then((res) => {
				if (res?.data?.status == 200) {
					const map = {};
					(res?.data?.data || []).forEach((r) => {
						map[r?.SaleOfProduct?._id || r?.SaleOfProduct] = r;
					});
					setExistingByLineItem(map);
				}
			})
			.catch(() => { });
	};

	useEffect(() => {
		if (sale?.status === "Delivered") loadExisting();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sale?._id, sale?.status]);

	if (sale?.status !== "Delivered" || !sale?.Product?.length) {
		return null;
	}

	const submitReturn = (sopId) => {
		if (!Reason.trim()) {
			swal({ text: "Please describe the issue", button: { text: "Ok", closeModal: true }, icon: "warning" });
			return;
		}
		setSubmitting(true);
		axios
			.post(`${BackendLink}/Create-Return-Request`, { Sale: sale?._id, SaleOfProduct: sopId, reason: Reason }, authHeader())
			.then((res) => {
				setSubmitting(false);
				swal({
					text: res?.data?.message,
					button: { text: "Ok", closeModal: true },
					icon: res?.data?.status == 200 ? "success" : "error",
					time: 3000,
				});
				if (res?.data?.status == 200) {
					setOpenLineItem(null);
					setReason("");
					loadExisting();
				}
			})
			.catch((err) => {
				setSubmitting(false);
				swal({
					text: err?.response?.data?.message || "There was some Error",
					button: { text: "Ok", closeModal: true },
					icon: "error",
					time: 3000,
				});
			});
	};

	return (
		<div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden mt-6">
			<div className="p-6">
				<div className="flex items-center gap-3 mb-6">
					<MdAssignmentReturn className="w-5 h-5 text-[#1d1d1f]" />
					<h3 className="text-2xl font-semibold text-[#1d1d1f]">Returns</h3>
				</div>

				<div className="space-y-4">
					{sale?.Product?.map((a) => {
						const sopId = a?._id;
						const existing = ExistingByLineItem[sopId];
						return (
							<div key={sopId} className="flex flex-col gap-3 pb-4 border-b border-gray-200 last:border-0">
								<div className="flex items-center justify-between gap-4">
									<p className="font-medium text-gray-800">{a?.product?.name}</p>
									{existing ? (
										<span className="px-3 py-1 bg-[#f5f5f7] text-[#1d1d1f] text-xs font-semibold rounded-full">
											Return {existing?.status}
										</span>
									) : OpenLineItem === sopId ? null : (
										<button
											onClick={() => { setOpenLineItem(sopId); setReason(""); }}
											className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-medium rounded-full transition-colors duration-200"
										>
											Request Return
										</button>
									)}
								</div>

								{OpenLineItem === sopId && !existing && (
									<div className="flex flex-col md:flex-row gap-3">
										<textarea
											value={Reason}
											onChange={(e) => setReason(e.target.value)}
											placeholder="What's the issue with this item?"
											className="flex-1 px-4 py-2.5 rounded-xl border border-[#d2d2d7] outline-none focus:border-[#f97316] text-sm resize-none"
											rows={2}
										/>
										<div className="flex gap-2">
											<button
												disabled={Submitting}
												onClick={() => submitReturn(sopId)}
												className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-medium rounded-full transition-colors duration-200 disabled:opacity-60"
											>
												Submit
											</button>
											<button
												onClick={() => setOpenLineItem(null)}
												className="px-5 py-2.5 border border-[#d2d2d7] text-xs font-medium rounded-full hover:bg-[#f5f5f7] transition-colors duration-200"
											>
												Cancel
											</button>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default withAuthContext(ReturnRequestPanel);
