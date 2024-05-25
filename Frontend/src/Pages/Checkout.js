import React, { useEffect, useState } from "react"
import Headers from "../Components/Header/index"
import DogFood from "../assets/ShippingIllustration.svg"
import Footer from "../Components/Footer"
import ListCard from "../Components/Card/Card2"
import { withCartContext } from "../context/Cart"
import { withAuthContext } from "../context/Auth"
import swal from "sweetalert"
import { useNavigate } from "react-router-dom"
import Address from "../Components/Address"
import AddressCard from "../Components/Card/AddressCard"
import { withProductContext } from "../context/Product"
import UsedDiscountCoupon from "../Components/Coupons/used"
import { MdAddBusiness } from "react-icons/md";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

// Phase F7: lightweight guest-details form shown instead of the saved
// address list when there is no logged-in Token.
function GuestCheckoutForm({ setGuestInfo, GuestInfo }) {
    const navigate = useNavigate();
    const [form, setForm] = useState(
        GuestInfo || {
            name: "",
            email: "",
            phone_number: "",
            address_line1: "",
            address_line2: "",
            city: "",
            state: "",
            postal_code: "",
            country: "",
        }
    );

    const set = (field) => (e) => setForm({ ...form, [field]: e?.target?.value });

    const handleContinue = () => {
        const required = ["name", "email", "phone_number", "address_line1", "city", "state", "postal_code", "country"];
        const missing = required.filter((f) => !form?.[f]);
        if (missing.length) {
            swal({
                text: "Please fill in all required delivery details",
                button: { text: "Ok", closeModal: true },
                icon: "warning",
            });
            return;
        }
        setGuestInfo(form);
        navigate("/Payment");
    };

    return (
        <div className="w-full bg-white border border-[#d2d2d7] rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Checkout as Guest</h3>
            <p className="text-sm text-[#6e6e73] mb-6">
                Have an account? <a href="/SignIn" className="text-[#f97316] font-medium hover:underline">Sign in</a> for a faster checkout.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <FaUser className="text-[#86868b]" />
                    <input value={form?.name} onChange={set("name")} placeholder="Full Name*" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <FaEnvelope className="text-[#86868b]" />
                    <input value={form?.email} onChange={set("email")} type="email" placeholder="Email*" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <FaPhone className="text-[#86868b]" />
                    <input value={form?.phone_number} onChange={set("phone_number")} placeholder="Phone Number*" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <FaMapMarkerAlt className="text-[#86868b]" />
                    <input value={form?.address_line1} onChange={set("address_line1")} placeholder="Address Line 1*" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <FaMapMarkerAlt className="text-[#86868b]" />
                    <input value={form?.address_line2} onChange={set("address_line2")} placeholder="Address Line 2" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <input value={form?.city} onChange={set("city")} placeholder="City*" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <input value={form?.state} onChange={set("state")} placeholder="State*" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <input value={form?.postal_code} onChange={set("postal_code")} placeholder="Postal Code*" className="flex-1 outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl px-4 py-3">
                    <input value={form?.country} onChange={set("country")} placeholder="Country*" className="flex-1 outline-none" />
                </div>
            </div>

            <button
                onClick={handleContinue}
                className="mt-8 w-full md:w-auto px-10 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-full transition-colors duration-200"
            >
                Continue to Payment
            </button>
        </div>
    );
}

function Checkout({ Cart, getTotal, GetAllAddress,
    AllAddress, getTotalAfterCoupon, getCouponDiscount,
    getSubTotal, getDiscount, Coupon, Token, GuestInfo, setGuestInfo }) {
    const [New, setNew] = useState(false)
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // This makes the scrolling smooth
        });
        if (Token) GetAllAddress()
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">

                <Headers />
                <div className="relative z-10 w-full flex items-center justify-center my-4 md:my-20">
                <div className="flex justify-between w-[90%] flex-col md:flex-row ">
                    <div className="w-full md:w-[60%]">
                        {!Token ? (
                            <GuestCheckoutForm setGuestInfo={setGuestInfo} GuestInfo={GuestInfo} />
                        ) : AllAddress?.length > 0 ?
                            <div className="w-full">
                                <div className="flex w-full justify-end mb-[20px]">
                                    <button className="bg-[#f97316] hover:bg-[#ea580c] py-3 px-5 text-white mt-[15px] rounded-full text-[12px] md:text-[16px] font-medium transition-colors duration-200" onClick={() => {
                                        setNew(!New)
                                    }}>{New ? "Cancel" : <MdAddBusiness className="w-[20px] h-[20px] text-white" />}</button>
                                </div>
                                {New ?
                                    <Address />
                                    :
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        {AllAddress?.map((a, i) => (
                                            <AddressCard
                                                key={a?._id}
                                                Select={true}
                                                id={a?._id}
                                                address={a?.address_line1 + " " + a?.address_line2}
                                                city={a?.city}
                                                country={a?.country}
                                                name={a?.full_name}
                                                state={a?.state}
                                                phone_number={a?.phone_number}
                                            />
                                        ))}
                                    </div>
                                }
                            </div> : !New ? (
                                <div className="h-[60vh] md:h-[80vh] w-full flex flex-col justify-center align-center items-center gap-2">
                                    <img src={DogFood} className="w-[80%] md:w-[40%] h-[20vh] md:h-[30vh] my-[2%]" />
                                    <h1 className="text-[20px] font-semibold text-center md:text-[30px] text-[#1d1d1f] tracking-tight">Add a delivery address to continue</h1>
                                    <p className="text-[13px] md:text-[15px] text-[#6e6e73] text-center max-w-md">Add the address you'd like your order delivered to so we can get things moving.</p>
                                    <button className="mt-[2%] bg-[#f97316] hover:bg-[#ea580c] py-3 md:py-3.5 w-[80%] md:w-[20%] text-white rounded-full text-[12px] md:text-[16px] font-medium transition-colors duration-200" onClick={() => {
                                        setNew(!New)
                                    }}>{New ? "Cancel" : "Add Address"}</button>
                                </div>
                            ) : <Address />}
                    </div>
                    <div className="w-full md:w-[35%] border border-[#d2d2d7] bg-white p-[24px] rounded-2xl h-fit mt-[30px] md:mt-[0%]">
                        <h2 className="text-[22px] mb-[20px] leading-[30px] font-semibold text-[#1d1d1f]">Order Summary</h2>
                        {Cart?.length > 0 ? Cart?.map(e => (
                            <ListCard key={e?.ProductID} id={e?.ProductID} />
                        ))
                            :
                            <p className="font-medium text-[18px] text-center leading-[21px] text-[#6e6e73]">Your Cart is Empty</p>
                        }
                        <div className="flex py-[15px] border-b border-[#f0f0f2] justify-between">
                            <p className="font-medium leading-[21px] text-[15px] text-[#6e6e73]">SubTotal</p>
                            <p className="font-medium leading-[21px] text-[15px] text-[#1d1d1f]">${getSubTotal()}</p>
                        </div>
                        <div className="flex py-[15px] border-b border-[#f0f0f2] justify-between">
                            <p className="font-medium leading-[21px] text-[15px] text-[#6e6e73]">Discount</p>
                            <p className="font-medium leading-[21px] text-[15px] text-[#1d1d1f]">${getDiscount()}</p>
                        </div>
                        <div className="flex py-[15px] border-b border-[#f0f0f2] justify-between">
                            <p className="font-medium leading-[21px] text-[15px] text-[#6e6e73]">Total (without coupon)</p>
                            <p className="font-medium leading-[21px] text-[15px] text-[#1d1d1f]">${getTotal()}</p>
                        </div>
                        <div className="flex py-[15px] border-b border-[#f0f0f2] justify-between">
                            <p className="font-medium leading-[21px] text-[15px] text-[#6e6e73]">Coupon Discount</p>
                            <p className="font-medium leading-[21px] text-[15px] text-[#1d1d1f]">${getCouponDiscount()}</p>
                        </div>
                        <div className="flex py-[15px] justify-between">
                            <p className="font-semibold text-[22px] text-[#1d1d1f]">Total</p>
                            <p className="font-semibold leading-[31px] text-[22px] text-[#1d1d1f]">
                                ${getTotalAfterCoupon()}
                            </p>
                        </div>
                        <div className="flex justify-center align-center mt-8">
                            {!(Coupon == "" || !Coupon) && (
                                <UsedDiscountCoupon />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            </div>
        </React.Fragment >
    )
}
export default withCartContext(withAuthContext(withProductContext(Checkout)))
