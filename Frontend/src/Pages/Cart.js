import React, { useState } from "react"
import Footer from "../Components/Footer"
import Headers from "../Components/Header/index"
import CartCard from "../Components/Card/CartCard"
import { withCartContext } from "../context/Cart"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { withAuthContext } from "../context/Auth"
import swal from "sweetalert"
import DiscountCoupon from "../Components/Coupons"
import UsedDiscountCoupon from "../Components/Coupons/used"
import Swal from "sweetalert2"
import moment from "moment"
import { FaShoppingCart, FaTag, FaArrowRight, FaCalendarAlt, FaCheckCircle } from "react-icons/fa"
import { MdDiscount } from "react-icons/md"

function CartPage({ Cart, getTotal, Token, CheckToken, getSubTotal, getDiscount, ReedeemCoupon, AllCoupon, Coupon, GetAllCouponsUser, getCouponDiscount, getTotalAfterCoupon,
    ScheduleOrder,
    setScheduleOrder }) {
    const [CouponCode, setCouponCode] = useState("")
    const navigate = useNavigate()
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // This makes the scrolling smooth
        });
        CheckToken()
        GetAllCouponsUser()
    }, [])
    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">

                <Headers />
                <div className="relative z-10 w-full flex flex-col justify-center items-center mt-[7%]">

                {/* Header Section */}
                <div className="w-[90%] mt-8 mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#d2d2d7]">
                        <div className="flex items-center gap-4">
                            <FaShoppingCart className="w-8 h-8 text-[#1d1d1f]" />
                            <div>
                                <h1 className="text-3xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight">Shopping Cart</h1>
                                <p className="text-[#6e6e73] mt-1 text-sm md:text-base">Review your items and checkout</p>
                            </div>
                        </div>

                        <div className="px-6 py-3 rounded-2xl border border-[#d2d2d7]">
                            <p className="text-xs text-[#6e6e73] mb-1">Items</p>
                            <p className="text-2xl font-semibold text-[#1d1d1f]">{Cart?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="w-[90%] h-[100%]">
                    <div className="flex md:flex-row flex-col gap-10 justify-between">
                        <div className="md:w-[68%] w-[100%] rounded-2xl bg-white overflow-hidden border border-[#d2d2d7]">
                            <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#d2d2d7]">
                                <p className="w-[38%] text-[10px] md:text-[13px] font-medium tracking-wider uppercase text-[#6e6e73]">Product</p>
                                <p className="text-center w-[10%] text-[10px] md:text-[13px] font-medium tracking-wider uppercase text-[#6e6e73]">Price</p>
                                <p className="w-[17%] text-[10px] md:text-[13px] font-medium tracking-wider uppercase text-[#6e6e73] text-center">Quantity</p>
                                <p className="text-center w-[15%] text-[10px] md:text-[13px] font-medium tracking-wider uppercase text-[#6e6e73]">Subtotal</p>
                                <p className="w-[6%] text-[10px] md:text-[13px] font-medium tracking-wider uppercase text-[#6e6e73] opacity-0">Remove</p>
                            </div>
                            {Cart?.length > 0 ? Cart?.map((e, index) => (
                                <div key={e?.ProductID}>
                                    <CartCard id={e?.ProductID} />
                                </div>
                            ))
                                :
                                <div className="py-20 px-6 flex flex-col items-center justify-center">
                                    <FaShoppingCart className="w-16 h-16 text-[#d2d2d7] mb-6" />
                                    <h3 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] mb-3">Your Cart is Empty</h3>
                                    <p className="text-[#6e6e73] mb-8 text-center max-w-md">Looks like you haven't added any items yet. Start shopping to fill your cart!</p>
                                    <button onClick={() => navigate("/")} className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3 rounded-full font-medium transition-colors duration-200 flex items-center gap-3">
                                        Start Shopping
                                        <FaArrowRight />
                                    </button>
                                </div>
                            }
                            {Cart?.length > 0 && (
                                <div className="flex justify-between p-5 md:p-6 bg-[#f5f5f7] border-t border-[#d2d2d7]">
                                    <button onClick={() => navigate("/")} className="group py-3 px-6 md:py-4 md:px-8 bg-white border border-[#d2d2d7] hover:border-[#f97316] rounded-full text-sm md:text-base font-medium text-[#1d1d1f] cursor-pointer transition-colors duration-200 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Continue Shopping
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="md:w-[30%] w-[100%] h-fit rounded-2xl bg-white overflow-hidden border border-[#d2d2d7]">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <MdDiscount className="w-6 h-6 text-[#1d1d1f]" />
                                    <h3 className="text-2xl font-semibold text-[#1d1d1f]">Order Summary</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 px-4 bg-[#f5f5f7] rounded-xl">
                                        <p className="text-sm font-medium text-[#6e6e73]">Subtotal</p>
                                        <p className="text-base font-semibold text-[#1d1d1f]">${getSubTotal()}</p>
                                    </div>
                                    <div className="flex justify-between items-center py-3 px-4 bg-[#f5f5f7] rounded-xl">
                                        <p className="text-sm font-medium text-[#6e6e73]">Discount</p>
                                        <p className="text-base font-semibold text-[#1d1d1f]">-${getDiscount()}</p>
                                    </div>
                                    <div className="flex justify-between items-center py-3 px-4 bg-[#f5f5f7] rounded-xl">
                                        <p className="text-sm font-medium text-[#6e6e73]">Total (before coupon)</p>
                                        <p className="text-base font-semibold text-[#1d1d1f]">${getTotal()}</p>
                                    </div>
                                    {getCouponDiscount() > 0 && (
                                        <div className="flex justify-between items-center py-3 px-4 bg-[#f5f5f7] rounded-xl border border-[#d2d2d7]">
                                            <div className="flex items-center gap-2">
                                                <FaTag className="text-[#f97316]" />
                                                <p className="text-sm font-medium text-[#1d1d1f]">Coupon Savings</p>
                                            </div>
                                            <p className="text-base font-semibold text-[#1d1d1f]">-${getCouponDiscount()}</p>
                                        </div>
                                    )}

                                    {/* Final Total */}
                                    <div className="mt-6 pt-6 border-t border-[#d2d2d7]">
                                        <div className="bg-[#f5f5f7] p-5 rounded-2xl">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <FaCheckCircle className="text-[#f97316] w-5 h-5" />
                                                    <p className="text-lg font-medium text-[#1d1d1f]">Final Total</p>
                                                </div>
                                                <p className="text-3xl font-semibold text-[#1d1d1f]">
                                                    ${getTotalAfterCoupon().toFixed(2) || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full bg-[#f97316] hover:bg-[#ea580c] py-4 rounded-full text-white text-base cursor-pointer font-medium mt-6 transition-colors duration-200 flex items-center justify-center gap-3" onClick={() => {
                                if (getTotalAfterCoupon() > 0) {
                                    navigate("/Checkout")
                                } else {
                                    swal({
                                        text: "Please Add Some Items To Your Cart",
                                        button: {
                                            text: "Ok",
                                            closeModal: true
                                        },
                                        icon: "warning",
                                    }).then(() => {
                                        navigate("/")
                                    });
                                }
                            }}>
                                Proceed to Checkout
                                <FaArrowRight />
                            </button>
                            <button className="w-full flex justify-center cursor-pointer items-center gap-3 px-6 border border-[#d2d2d7] hover:border-[#f97316] py-4 rounded-full text-[#1d1d1f] text-base font-medium mt-4 transition-colors duration-200"
                                onClick={async () => {
                                    if (getTotalAfterCoupon() > 0) {
                                        if (Token) {
                                            const { value: date } = await Swal.fire({
                                                title: "Enter your Preferred Date Time For Order Delivery",
                                                input: "datetime-local",
                                                inputLabel: "Your Preferred Date Time For Order Delivery",
                                                inputValue: moment(ScheduleOrder)?.format("YYYY-MM-DDTHH:MM"),
                                                showCancelButton: true,
                                                inputValidator: (value) => {
                                                    if (!value) {
                                                        return "You need to write something!";
                                                    }
                                                }
                                            });
                                            if (date) {
                                                setScheduleOrder(date)
                                                Swal.fire(`Your Order is Being Scheduled for ${moment(date)?.format("YYYY-MM-DDTHH:MM")}`);
                                            }
                                            navigate("/Checkout")
                                        } else {
                                            navigate("/SignIn")
                                        }
                                    } else {
                                        swal({
                                            text: "Please Add Some Items To Your Cart",
                                            button: {
                                                text: "Ok",
                                                closeModal: true
                                            },
                                            icon: "warning",
                                        }).then(() => {
                                            navigate("/")
                                        });
                                    }
                                }}>
                                <FaCalendarAlt className="w-5 h-5" />
                                Schedule Order
                            </button>
                                {!(Coupon == "" || !Coupon) && (
                                    <div className="mt-6 p-4 bg-[#f5f5f7] rounded-2xl border border-[#d2d2d7]">
                                        <UsedDiscountCoupon />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {(Coupon == "" || !Coupon) && Cart?.length > 0 && (
                        <div className="md:w-[68%] w-[100%] mt-8 rounded-2xl bg-white overflow-hidden border border-[#d2d2d7]">
                            <div className="p-6 md:p-8">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <FaTag className="w-5 h-5 text-[#1d1d1f]" />
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-semibold text-[#1d1d1f]">Apply Coupon</h3>
                                        <p className="text-sm text-[#6e6e73]">Save more with discount codes</p>
                                    </div>
                                </div>

                                {/* Coupon Input */}
                                <div className="mb-6">
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                value={CouponCode}
                                                onChange={(e) => setCouponCode(e?.target?.value)}
                                                placeholder="Enter coupon code"
                                                type="text"
                                                className="w-full px-5 py-3.5 rounded-full outline-none border border-[#d2d2d7] focus:border-[#f97316] text-[#1d1d1f] text-base font-medium transition-colors duration-200 bg-white"
                                            />
                                        </div>
                                        <button
                                            className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 md:px-8 py-3.5 rounded-full text-sm md:text-base font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
                                            onClick={() => {
                                                ReedeemCoupon(CouponCode)
                                                GetAllCouponsUser()
                                            }}
                                        >
                                            <FaTag />
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                {/* Available Coupons */}
                                <div>
                                    <h4 className="text-sm font-medium text-[#6e6e73] mb-4 uppercase tracking-wider">Available Coupons</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {AllCoupon?.length > 0 ? (
                                            AllCoupon?.map((a, index) => (
                                                <div key={index}>
                                                    <DiscountCoupon data={a?.Coupon} coupon_sale={a?.coupon_sale} />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-full text-center py-8">
                                                <p className="text-[#86868b] font-medium">No coupons available at the moment</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-20">
                <Footer />
            </div>
            </div>
        </React.Fragment >
    )
}
export default withAuthContext(withCartContext(CartPage))
