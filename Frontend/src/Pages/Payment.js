import React, { useEffect } from "react"

import Headers from "../Components/Header/index"
import Footer from "../Components/Footer"
import ListCard from "../Components/Card/Card2"
import { withCartContext } from "../context/Cart"
import Payment from "../Components/Payment"
import swal from "sweetalert"
import { useNavigate } from "react-router-dom"
import UsedDiscountCoupon from "../Components/Coupons/used"
import { FaReceipt, FaTag, FaShoppingBag } from "react-icons/fa"

function PaymentScreen({ Cart, getTotal, getDiscount, getSubTotal, getTotalAfterCoupon, getCouponDiscount, Coupon }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (getTotalAfterCoupon() <= 0) {
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
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // This makes the scrolling smooth
        });
    }, [])
    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">

                <Headers />

                <div className="relative z-10 w-full flex flex-col items-center mt-[7%] mb-16">
                    {/* Header */}
                    <div className="w-[90%] max-w-6xl mb-10 pb-6 border-b border-[#d2d2d7]">
                        <div className="flex items-center gap-4">
                            <FaReceipt className="w-7 h-7 text-[#1d1d1f]" />
                            <div>
                                <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight">
                                    Secure Checkout
                                </h1>
                                <p className="text-[#6e6e73] mt-1 text-sm md:text-base">Review your order and complete payment</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-[90%] max-w-6xl flex md:flex-row flex-col-reverse gap-10 justify-between">
                        {/* Payment Form */}
                        <div className="md:w-[62%] w-[100%]">
                            <Payment />
                        </div>

                        {/* Order Summary */}
                        <div className="md:w-[35%] w-[100%] h-fit rounded-2xl bg-white border border-[#d2d2d7] overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <FaShoppingBag className="w-5 h-5 text-[#1d1d1f]" />
                                    <h2 className="text-xl font-semibold text-[#1d1d1f]">Order Summary</h2>
                                </div>

                                {Cart?.length > 0 ? (
                                    <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                                        {Cart?.map(e => (
                                            <ListCard key={e?.ProductID} id={e?.ProductID} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-[#86868b] py-8">Your cart is empty</p>
                                )}

                                <div className="space-y-3">
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
                                </div>

                                <div className="mt-6 pt-6 border-t border-[#d2d2d7]">
                                    <div className="bg-[#f5f5f7] p-5 rounded-2xl">
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-medium text-[#1d1d1f]">Total</p>
                                            <p className="text-3xl font-semibold text-[#1d1d1f]">
                                                ${Number(getTotalAfterCoupon() || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {!(Coupon == "" || !Coupon) && (
                                    <div className="mt-6 p-4 bg-[#f5f5f7] rounded-2xl border border-[#d2d2d7]">
                                        <UsedDiscountCoupon />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </React.Fragment>
    )
}
export default withCartContext(PaymentScreen)
