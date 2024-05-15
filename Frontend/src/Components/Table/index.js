import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { withProductContext } from "../../context/Product";
import { FaBoxOpen, FaEye } from "react-icons/fa";

const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Scheduled: "bg-purple-100 text-purple-700",
    Shipped: "bg-indigo-100 text-indigo-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

function Table({ AllOrders, GetAllOrders }) {
    const navigate = useNavigate();

    useEffect(() => {
        GetAllOrders && GetAllOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="w-full rounded-2xl bg-white border border-[#d2d2d7] overflow-hidden">
            <div className="p-6">
                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Order History</h3>

                {AllOrders?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-medium text-[#6e6e73] uppercase border-b border-[#d2d2d7]">
                                    <th className="py-3 pr-4">Order ID</th>
                                    <th className="py-3 pr-4">Date</th>
                                    <th className="py-3 pr-4">Items</th>
                                    <th className="py-3 pr-4">Status</th>
                                    <th className="py-3 pr-4 text-right">Total</th>
                                    <th className="py-3 pl-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {AllOrders?.map((order) => (
                                    <tr
                                        key={order?._id}
                                        className="border-b border-[#f0f0f2] hover:bg-[#f5f5f7] transition-colors duration-200"
                                    >
                                        <td className="py-4 pr-4 font-mono text-sm text-[#1d1d1f]">
                                            #{order?._id?.slice(-8)}
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-[#6e6e73]">
                                            {moment(order?.created_at).format("DD MMM YYYY")}
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-[#6e6e73]">
                                            {order?.Product?.length || 0} items
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order?.status] || "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {order?.status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 text-right font-semibold text-[#1d1d1f]">
                                            ${Number(order?.totalAmountAfterDiscount ?? order?.totalAmount ?? 0).toFixed(2)}
                                        </td>
                                        <td className="py-4 pl-4 text-right">
                                            <button
                                                onClick={() => navigate(`/OrderTracking/${order?._id}`)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-medium rounded-full transition-colors duration-200"
                                            >
                                                <FaEye className="w-3 h-3" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FaBoxOpen className="w-14 h-14 text-[#d2d2d7] mb-4" />
                        <h4 className="text-xl font-semibold text-[#1d1d1f] mb-2">No orders yet</h4>
                        <p className="text-[#6e6e73] mb-6">Your placed orders will show up here.</p>
                        <button
                            onClick={() => navigate("/Category")}
                            className="px-8 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-full transition-colors duration-200"
                        >
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default withProductContext(Table);
