import React, { useEffect, useState } from "react"
import Header from "../Components/Header"
import BreadCrumbContainer from "../Components/BreadCrumbs"
import FoodImage from "../assets/AutoPartFallback.svg"
import Footer from "../Components/Footer"
import { useNavigate, useParams } from "react-router-dom"
import { BackendLink, ImageCloud, SocketUrl } from "../link"
import axios from "axios"
import swal from "sweetalert"
import { withAuthContext } from "../context/Auth"
import moment from "moment"
import { io } from "socket.io-client"
import DiscountCoupon from "../Components/Coupons"
import { MdCheckCircle, MdLocalShipping, MdInventory, MdArrowBack, MdEmail, MdPhone, MdLocationOn } from "react-icons/md"
import { FaBoxOpen, FaTruck, FaCheckCircle, FaReceipt } from "react-icons/fa"
import { HiCheckCircle } from "react-icons/hi"

const statusToStep = {
    Pending: 1,
    Processing: 2,
    Shipped: 3,
    Delivered: 4,
};

function OrderTracking({ Token, CheckToken }) {
    const navigate = useNavigate();
    const { id } = useParams()
    const [state, setState] = useState({
    })
    const [Loading, setLoading] = useState(false);
    const [Checked, setChecked] = useState(0);
    const [Live, setLive] = useState(false);

    const applyOrderData = (data) => {
        setState(data)
        setChecked(statusToStep[data?.status] || 0)
    };

    const getData = () => {
        if (Token && id) {
            setLoading(true);
            axios
                .get(`${BackendLink}/SaleInfo/${id}`, {
                    headers: {
                        Authorization: Token
                            ? `${Token}`
                            : `${localStorage.getItem("token")}`,
                    },
                })
                .then((res) => {
                    setLoading(false);
                    if (res?.data?.status == 200) {
                        applyOrderData(res?.data?.data)
                    }
                })
                .catch((err) => {
                    setLoading(false);
                    console.log(err)
                });
        }
    };
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // This makes the scrolling smooth
        });
         CheckToken()
    }, [])

    useEffect(() => {
        getData();
    }, [id, Token])

    // Phase F6: layer live order-tracking updates on top of the one-shot
    // REST fetch above, so the page still paints fast on first load.
    useEffect(() => {
        if (!Token || !id) return undefined;

        const socket = io(SocketUrl, {
            auth: {
                token: Token || localStorage.getItem("token"),
            },
        });

        socket.on("connect", () => {
            socket.emit("join-order", id);
        });

        socket.on("order-update", (payload) => {
            if (!payload) return;
            if (payload?._id && payload?._id !== id) return;
            setLive(true);
            setState((prev) => ({ ...prev, ...payload }));
            if (payload?.status) {
                setChecked(statusToStep[payload.status] || 0);
            }
        });

        socket.on("join-order-error", (err) => {
            swal({
                text: err?.message || "Unable to subscribe to live order updates",
                button: { text: "Ok", closeModal: true },
                icon: "warning",
            });
        });

        socket.on("connect_error", () => {
            // Live tracking is a progressive enhancement; the REST fetch above
            // already has the data, so a socket failure is silent here.
        });

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, Token])

    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">
                
                <Header />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <BreadCrumbContainer />
                    
                    {/* Header Section */}
                    <div className="mt-8 mb-8">
                        <div className="bg-white rounded-2xl border border-[#d2d2d7] p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <FaReceipt className="w-6 h-6 text-[#1d1d1f]" />
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
                                                Order Details
                                            </h1>
                                            {Live && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    Live
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-[#6e6e73]">
                                            <span>{moment(state?.created_at).format("DD MMMM YYYY")}</span>
                                            <span className="text-[#d2d2d7]">•</span>
                                            <span>{state?.Product?.length} Products</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate("/")}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full transition-colors duration-200"
                                >
                                    <MdArrowBack />
                                    <span className="font-medium">Back to Shop</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Customer & Shipping Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Details */}
                            <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <MdLocationOn className="w-5 h-5 text-[#1d1d1f]" />
                                        <h3 className="text-xl font-semibold text-[#1d1d1f]">Customer & Shipping Details</h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Basic Details */}
                                        <div className="space-y-4">
                                            <div className="pb-4 border-b border-[#f0f0f2]">
                                                <h4 className="text-sm font-medium text-[#6e6e73] uppercase mb-3">Basic Details</h4>
                                                <p className="text-lg font-medium text-[#1d1d1f]">{state?.User?.name}</p>
                                                <p className="text-sm text-[#6e6e73] mt-2 whitespace-pre-line">{state?.Address?.address_line1 + "\n" + state?.Address?.address_line2}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <MdEmail className="w-4 h-4 text-[#6e6e73]" />
                                                    <div>
                                                        <p className="text-xs text-[#86868b] uppercase">Email</p>
                                                        <p className="text-sm font-medium text-[#1d1d1f]">{state?.User?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MdPhone className="w-4 h-4 text-[#6e6e73]" />
                                                    <div>
                                                        <p className="text-xs text-[#86868b] uppercase">Phone</p>
                                                        <p className="text-sm font-medium text-[#1d1d1f]">{state?.Address?.phone_number}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        <div className="space-y-4">
                                            <div className="pb-4 border-b border-[#f0f0f2]">
                                                <h4 className="text-sm font-medium text-[#6e6e73] uppercase mb-3">Shipping Address</h4>
                                                <p className="text-lg font-medium text-[#1d1d1f]">{state?.Address?.full_name}</p>
                                                <p className="text-sm text-[#6e6e73] mt-2 whitespace-pre-line">{state?.Address?.address_line1 + "\n" + state?.Address?.address_line2}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <MdEmail className="w-4 h-4 text-[#6e6e73]" />
                                                    <div>
                                                        <p className="text-xs text-[#86868b] uppercase">Email</p>
                                                        <p className="text-sm font-medium text-[#1d1d1f]">{state?.User?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MdPhone className="w-4 h-4 text-[#6e6e73]" />
                                                    <div>
                                                        <p className="text-xs text-[#86868b] uppercase">Phone</p>
                                                        <p className="text-sm font-medium text-[#1d1d1f]">{state?.Address?.phone_number}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden sticky top-24">                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Order Summary</h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center pb-3 border-b border-[#f0f0f2]">
                                            <span className="text-sm text-[#6e6e73]">Order ID</span>
                                            <span className="text-sm font-mono font-medium text-[#1d1d1f]">#{state?._id?.slice(-8)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-[#f0f0f2]">
                                            <span className="text-sm text-[#6e6e73]">Payment Method</span>
                                            <span className="text-sm font-medium text-[#1d1d1f]">{state?.paymentMethod}</span>
                                        </div>
                                    </div>

                                    {!(state?.CouponRedeem?._id == "" || !state?.CouponRedeem?._id) && (
                                        <div className="mb-6">
                                            <DiscountCoupon data={state?.CouponRedeem?.Coupon} noButton />
                                        </div>
                                    )}

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#6e6e73]">Subtotal</span>
                                            <span className="font-medium text-[#1d1d1f]">${state?.totalAmount?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#6e6e73]">Discount</span>
                                            <span className="font-medium text-[#1d1d1f]">-${Number(state?.totalAmount - state?.totalAmountAfterDiscount)?.toFixed(2)}</span>
                                        </div>
                                        {state?.couponvalue > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6e6e73]">Coupon Discount</span>
                                                <span className="font-medium text-[#1d1d1f]">-${Number(state?.couponvalue)?.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-[#d2d2d7]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-semibold text-[#1d1d1f]">Total</span>
                                            <span className="text-2xl font-semibold text-[#1d1d1f]">
                                                ${state?.totalAmountAfterDiscount?.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Timeline */}
                    <div className="mb-8">
                        <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">
                            <div className="p-8 md:p-12">
                                {Checked > 0 ? (
                                    <div className="relative">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Order Progress</h3>
                                        
                                        {/* Progress Line */}
                                        <div className="absolute top-[76px] left-0 right-0 h-2 bg-gray-200 rounded-full hidden md:block">
                                            <div 
                                                className="h-full bg-[#f97316] rounded-full transition-all duration-1000"
                                                style={{ width: `${((Checked - 1) / 3) * 100}%` }}
                                            ></div>
                                        </div>

                                        {/* Steps */}
                                        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
                                            {/* Step 1: Order Received */}
                                            <div className="flex flex-col items-center">
                                                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                                                    Checked >= 1 
                                                    ? 'bg-[#1d1d1f]' 
                                                    : 'bg-gray-200'
                                                }`}>
                                                    <FaBoxOpen className={`w-7 h-7 ${Checked >= 1 ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <p className={`mt-4 text-sm font-semibold text-center ${Checked >= 1 ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                                                    Order Received
                                                </p>
                                                {Checked >= 1 && (
                                                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        Completed
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step 2: Processing */}
                                            <div className="flex flex-col items-center">
                                                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                                                    Checked >= 2 
                                                    ? 'bg-[#1d1d1f]' 
                                                    : 'bg-gray-200'
                                                }`}>
                                                    <MdInventory className={`w-7 h-7 ${Checked >= 2 ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <p className={`mt-4 text-sm font-semibold text-center ${Checked >= 2 ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                                                    Processing
                                                </p>
                                                {Checked >= 2 && (
                                                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        Completed
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step 3: Shipped */}
                                            <div className="flex flex-col items-center">
                                                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                                                    Checked >= 3 
                                                    ? 'bg-[#1d1d1f]' 
                                                    : 'bg-gray-200'
                                                }`}>
                                                    <FaTruck className={`w-7 h-7 ${Checked >= 3 ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <p className={`mt-4 text-sm font-semibold text-center ${Checked >= 3 ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                                                    On the Way
                                                </p>
                                                {Checked >= 3 && (
                                                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        In Transit
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step 4: Delivered */}
                                            <div className="flex flex-col items-center">
                                                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                                                    Checked >= 4 
                                                    ? 'bg-[#1d1d1f]' 
                                                    : 'bg-gray-200'
                                                }`}>
                                                    <FaCheckCircle className={`w-7 h-7 ${Checked >= 4 ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <p className={`mt-4 text-sm font-semibold text-center ${Checked >= 4 ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                                                    Delivered
                                                </p>
                                                {Checked >= 4 && (
                                                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        Completed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                                            <MdCheckCircle className="w-10 h-10 text-red-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">Order Status: {state?.status}</p>
                                        <p className="text-gray-600 mt-2">There may be an issue with this order</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products List */}
                    <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Order Items</h3>
                            
                            {/* Table Header */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 mb-4 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase">
                                <div className="col-span-5">Product</div>
                                <div className="col-span-2 text-center">Price</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-3 text-right">Subtotal</div>
                            </div>

                            {/* Products */}
                            <div className="space-y-4">
                                {state?.Product?.length > 0 && state?.Product?.map((a, index) => (
                                    <div key={index} className="grid md:grid-cols-12 gap-4 pb-4 border-b border-gray-200 last:border-0">
                                        <div className="md:col-span-5 flex items-center gap-4">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img 
                                                    src={a?.product?.images?.[0]?.filename ? `${ImageCloud}/${a?.product?.images?.[0]?.filename}` : FoodImage} 
                                                    className="w-full h-full object-cover"
                                                    alt={a?.product?.name}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{a?.product?.name}</p>
                                                <p className="text-sm text-gray-500 mt-1">SKU: {a?.product?.ProductCode}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2 flex md:justify-center items-center">
                                            <div>
                                                <span className="md:hidden text-sm text-gray-500 mr-2">Price:</span>
                                                {a?.totalPriceAfterDiscount < a?.totalPrice ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 line-through text-sm">${Number(a?.totalPrice)?.toFixed(2)}</span>
                                                        <span className="font-semibold text-[#f97316]">${Number(a?.totalPriceAfterDiscount)?.toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-semibold text-gray-800">${Number(a?.totalPrice)?.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2 flex md:justify-center items-center">
                                            <div>
                                                <span className="md:hidden text-sm text-gray-500 mr-2">Quantity:</span>
                                                <span className="font-semibold text-gray-800">×{a?.quantity}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-3 flex md:justify-end items-center">
                                            <div>
                                                <span className="md:hidden text-sm text-gray-500 mr-2">Subtotal:</span>
                                                {a?.totalPriceAfterDiscount < a?.totalPrice ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 line-through text-sm">${Number(a?.totalPrice * a?.quantity)?.toFixed(2)}</span>
                                                        <span className="font-bold text-[#f97316] text-lg">${Number(a?.totalPriceAfterDiscount * a?.quantity)?.toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-gray-800 text-lg">${Number(a?.totalPrice * a?.quantity)?.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </React.Fragment>
    )
}
export default withAuthContext(OrderTracking)