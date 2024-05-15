import React, { useEffect, useState } from "react"
import Dropdown from "../Dropdown"
import { withCartContext } from "../../context/Cart"
import { withAuthContext } from "../../context/Auth"
import { BackendLink } from "../../link"
import axios from "axios"
import swal from "sweetalert"
import { useNavigate } from "react-router-dom"
import { countries } from "./data"
import { FaUser, FaPhone, FaMapMarkerAlt, FaSave } from "react-icons/fa"
import { MdLocationCity, MdHome } from "react-icons/md"
function Address({ Token, CheckToken, setAddress, Notes, setNotes }) {
    const navigate = useNavigate();

    const [state, setState] = useState({
        full_name: "",
        phone_number: "",
        address_line1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        address_line2: "",
        is_default: false,
    })
    const [Loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (Token) {
            setLoading(true);
            axios
                .post(`${BackendLink}/Create-Address`, state, {
                    headers: {
                        Authorization: Token
                            ? `${Token}`
                            : `${localStorage.getItem("token")}`,
                    },
                })
                .then((res) => {
                    setLoading(false);
                    if (res?.data?.status == 200) {
                        setAddress(res?.data?.id);
                        navigate("/Payment");
                    }
                    swal({
                        text: res?.data?.message,
                        button: {
                            text: "Ok",
                            closeModal: true
                        },
                        icon: res?.data?.status == 200 ? "success" : "error",
                        time: 3000
                    });
                })
                .catch((err) => {
                    setLoading(false);
                    swal({
                        text: err?.response?.data?.message
                            ? err?.response?.data?.message
                            : "There was some Error",
                        button: {
                            text: "Ok",
                            closeModal: true
                        },
                        icon: "error",
                        time: 3000
                    });
                });
        }
    };

    useEffect(() => {
        CheckToken()
    }, [])


    return (
        <React.Fragment>
            <div className="mb-8 pb-6 border-b border-[#d2d2d7]">
                <div className="flex items-center gap-3">
                    <MdHome className="w-6 h-6 text-[#1d1d1f]" />
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] tracking-tight">Billing Information</h2>
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-6">
                <div className="w-full md:w-[50%]">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] mb-2">
                        <FaUser className="w-4 h-4 text-[#f97316]" />
                        Full Name
                    </label>
                    <input
                        value={state?.full_name}
                        onChange={(e) => {
                            setState({ ...state, full_name: e?.target?.value })
                        }}
                        placeholder="Enter your full name" 
                        type="text" 
                        className="w-full h-12 px-4 text-sm md:text-base font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white" 
                    />
                </div>
                <div className="w-full md:w-[50%]">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] mb-2">
                        <FaPhone className="w-4 h-4 text-[#f97316]" />
                        Phone Number
                    </label>
                    <input 
                        value={state?.phone_number}
                        onChange={(e) => {
                            setState({ ...state, phone_number: e?.target?.value })
                        }} 
                        placeholder="Enter your phone number" 
                        type="text" 
                        className="w-full h-12 px-4 text-sm md:text-base font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white" 
                    />
                </div>
            </div>
            <div className="w-full mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] mb-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-[#f97316]" />
                    Address Line 1
                </label>
                <input 
                    value={state?.address_line1}
                    onChange={(e) => {
                        setState({ ...state, address_line1: e?.target?.value })
                    }} 
                    placeholder="Street address, P.O. box" 
                    type="text" 
                    className="w-full h-12 px-4 text-sm md:text-base font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white" 
                />
            </div>
            <div className="w-full mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] mb-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-[#f97316]" />
                    Address Line 2 <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input 
                    value={state?.address_line2}
                    onChange={(e) => {
                        setState({ ...state, address_line2: e?.target?.value })
                    }} 
                    placeholder="Apartment, suite, unit, building, floor" 
                    type="text" 
                    className="w-full h-12 px-4 text-sm md:text-base font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white" 
                />
            </div>
            <div className="w-full mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                    <MdLocationCity className="w-4 h-4 text-[#f97316]" />
                    Location Details
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-medium text-[#6e6e73] mb-2 block">Country / Region</label>
                        <Dropdown 
                            width={"100%"} 
                            activeItem={state?.country}
                            setActiveItem={(e) => {
                                setState({ ...state, country: e })
                            }} 
                            Array={countries} 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-[#6e6e73] mb-2 block">State</label>
                        <input 
                            type="text" 
                            placeholder="State" 
                            className="w-full h-12 px-3 text-sm font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white" 
                            value={state?.state}
                            onChange={(e) => {
                                setState({ ...state, state: e?.target?.value })
                            }} 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-[#6e6e73] mb-2 block">City</label>
                        <input 
                            type="text" 
                            placeholder="City" 
                            className="w-full h-12 px-3 text-sm font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white" 
                            value={state?.city}
                            onChange={(e) => {
                                setState({ ...state, city: e?.target?.value })
                            }} 
                        />
                    </div>
                    <div className="col-span-2 md:col-span-4">
                        <label className="text-xs font-medium text-[#6e6e73] mb-2 block">Zip Code</label>
                        <input 
                            value={state?.postal_code}
                            onChange={(e) => {
                                setState({ ...state, postal_code: e?.target?.value })
                            }}
                            placeholder="Enter postal/zip code" 
                            type="text" 
                            className="w-full h-12 px-4 text-sm md:text-base font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white" 
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 mb-8 p-4 bg-[#f5f5f7] rounded-xl">
                <input
                    type="checkbox"
                    className="w-5 h-5 rounded border border-[#d2d2d7] text-[#f97316] cursor-pointer"
                    value={state?.is_default}
                    onChange={(e) => {
                        setState({ ...state, is_default: e?.target?.value })
                    }}
                />
                <label className="text-sm font-medium text-[#1d1d1f] cursor-pointer">Set as default delivery address</label>
            </div>

            <div className="border-t border-[#d2d2d7] my-8"></div>

            <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Additional Info</h3>
                <label className="text-sm font-medium text-[#1d1d1f] mb-2 block">Order Notes <span className="text-xs text-[#86868b]">(Optional)</span></label>
                <textarea
                    placeholder="Special instructions for delivery (e.g., gate code, preferred time, etc.)"
                    value={Notes}
                    onChange={(e) => {
                        setNotes(e?.target?.value)
                    }}
                    rows="4"
                    className="w-full px-4 py-3 text-sm md:text-base font-medium text-[#1d1d1f] placeholder-[#86868b] rounded-xl border border-[#d2d2d7] focus:border-[#f97316] transition-colors duration-200 bg-white resize-none"
                />
            </div>

            <button
                onClick={() => {
                    handleSubmit()
                }}
                disabled={Loading}
                className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] rounded-full text-white font-medium text-base transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {Loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                ) : (
                    <>
                        <FaSave className="w-5 h-5" />
                        Save Address
                    </>
                )}
            </button>

        </React.Fragment>
    )
}
export default withCartContext(withAuthContext(Address))