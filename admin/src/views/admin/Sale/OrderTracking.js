import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import swal from "sweetalert"
import { withAuthContext } from "../../../context/Auth"
import moment from "moment"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import InputField from "components/fields/InputField"
import ImageCloud from "../../../link"

function OrderTracking({ Token, CheckToken }) {
    const navigate = useNavigate();
    const { id } = useParams()
    const [state, setState] = useState({
        status: "Pending",
        trackingDetails: {
            carrier: "",
            trackingNumber: "",
            estimatedDeliveryDate: new Date(),
            currentLocation: "",
            lastUpdated: new Date(),
            deliveryAttempts: 0,
            comments: "",
        }
    })

    function handleChange(name, value) {
        setState({ ...state, [name]: value })
    }

    const [Loading, setLoading] = useState(false);
    const [Checked, setChecked] = useState(0);

    const getData = () => {
        if (Token && id) {
            setLoading(true);
            axios
                .get(`${process.env.REACT_APP_PUBLIC_PATH}/SaleInfoAdmin/${id}`, {
                    headers: {
                        Authorization: Token
                            ? `${Token}`
                            : `${localStorage.getItem("token")}`,
                    },
                })
                .then((res) => {
                    setLoading(false);
                    if (res?.data?.status == 200) {
                        setState(res?.data?.data)
                        // ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
                        if (res?.data?.data?.status == "Pending") {
                            setChecked(1)
                        } else if (res?.data?.data?.status == "Processing") {
                            setChecked(2)
                        } else if (res?.data?.data?.status == "Shipped") {
                            setChecked(3)
                        } else if (res?.data?.data?.status == "Delivered") {
                            setChecked(4)
                        }
                    }
                })
                .catch((err) => {
                    setLoading(false);
                    console.log(err)
                });
        }
    };
    useEffect(() => {
        CheckToken()
    }, [])

    useEffect(() => {
        getData();
    }, [id, Token])
    useEffect(() => {
        console.log(state)
    }, [state])


    const handleSubmit = () => {
        if (state && Token) {
            axios
                .post(`${process.env.REACT_APP_PUBLIC_PATH}/Update-Sale/${id}`, state, {
                    headers: {
                        Authorization: Token
                            ? `${Token}`
                            : `${localStorage.getItem("token")}`,
                    },
                })
                .then((res) => {
                    if (res?.data?.status == 200) {
                        getData()
                    }
                    swal({
                        text: res?.data?.message,
                        button: {
                            text: "Ok",
                            closeModal: true,
                        },
                        icon: res?.data?.status == 200 ? "success" : "error",
                        time: 3000,
                    });
                })
                .catch((err) => {
                    swal({
                        text: err?.response?.data?.message
                            ? err?.response?.data?.message
                            : "There was some Error",
                        button: {
                            text: "Ok",
                            closeModal: true,
                        },
                        icon: "error",
                        time: 3000,
                    });
                });
        } else {
            swal({
                text: "Please Check All Fields As There was some Error",
                button: {
                    text: "Ok",
                    closeModal: true,
                },
                icon: "error",
                time: 3000,
            });
            CheckToken();
        }
    };

    return (
        <div>
            <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
                <div className="w-[99%] border-2 mt-20 rounded-[8px]">
                    <section className="p-[20px] flex items-center justify-between">
                        <div className=" flex items-center gap-[10px]">
                            <h2 className="font-poppins font-[500] text-[20px] leading-[30px] text-[#1A1A1A]">Order Details</h2>
                            <span className="font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A]">.</span>
                            <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A]">{moment(state?.created_at).format("DD MMMM YYYY")}</p>
                            <span className="font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A]">.</span>
                            <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A]">{state?.Product?.length} Products</p>
                        </div>
                        <div>
                            <span className="font-poppins font-[500] text-[16px] leading-[24px] text-[#103559]" onClick={() => {
                                navigate("/admin/Sale")
                            }}>Back to List</span>
                        </div>
                    </section>
                    <div className="border-[2px] rounded-[20px] w-[90%] grid grid-cols-4 gap-4 my-10 py-4 px-4 mx-auto">
                        <p className="font-[500] text-[14px] leading-[14px] font-poppins col-span-4 p-[20px] border-b-2 w-[100%]">Basic Details</p>
                        <hr className="col-span-4" />
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="statusLabel">status</InputLabel>
                            <Select
                                label="status"
                                labelId="statusLabel"
                                id="status"
                                name="status"
                                value={state?.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]?.map((a) => (
                                    <MenuItem value={a}>{a}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="carrier*"
                            id="carrier"
                            type="text"
                            name="carrier"
                            value={state?.trackingDetails?.carrier}
                            onChange={(e) => {
                                const Obj = { ...state?.trackingDetails, carrier: e.target.value }
                                handleChange("trackingDetails", Obj)
                            }}
                        />
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="trackingNumber*"
                            id="trackingNumber"
                            type="text"
                            name="trackingNumber"
                            value={state?.trackingDetails?.trackingNumber}
                            onChange={(e) => {
                                const Obj = { ...state?.trackingDetails, trackingNumber: e.target.value }
                                handleChange("trackingDetails", Obj)
                            }}
                        />
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="estimatedDeliveryDate*"
                            id="estimatedDeliveryDate"
                            type="datetime-local"
                            name="estimatedDeliveryDate"
                            value={moment(state?.estimatedDeliveryDate).format("YYYY-MM-DDTHH:MM")}
                            onChange={(e) => {
                                const Obj = { ...state?.trackingDetails, estimatedDeliveryDate: e.target.value }
                                handleChange("trackingDetails", Obj)
                            }}
                        />
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="currentLocation*"
                            id="currentLocation"
                            type="text"
                            name="currentLocation"
                            value={state?.trackingDetails?.currentLocation}
                            onChange={(e) => {
                                const Obj = { ...state?.trackingDetails, currentLocation: e.target.value }
                                handleChange("trackingDetails", Obj)
                            }}
                        />
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="lastUpdated*"
                            id="lastUpdated"
                            type="datetime-local"
                            name="lastUpdated"
                            value={moment(state?.lastUpdated).format("YYYY-MM-DDTHH:MM")}
                            onChange={(e) => {
                                const Obj = { ...state?.trackingDetails, lastUpdated: e.target.value }
                                handleChange("trackingDetails", Obj)
                            }}
                        />
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="deliveryAttempts*"
                            id="deliveryAttempts"
                            type="number"
                            name="deliveryAttempts"
                            value={state?.trackingDetails?.deliveryAttempts}
                            onChange={(e) => {
                                const Obj = { ...state?.trackingDetails, deliveryAttempts: e.target.value }
                                handleChange("trackingDetails", Obj)
                            }}
                        />
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="comments*"
                            id="comments"
                            type="text"
                            name="comments"
                            value={state?.trackingDetails?.comments}
                            onChange={(e) => {
                                const Obj = { ...state?.trackingDetails, comments: e.target.value }
                                handleChange("trackingDetails", Obj)
                            }}
                        />
                        <button
                            onClick={() => {
                                handleSubmit()
                            }}
                            className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
                        >
                            Save Details
                        </button>
                    </div>
                    <section className="flex justify-between p-[20px]">
                        <div className="border-2 flex items-center rounded-[8px] w-[66%]">
                            <div className="border-r-[2px] w-[50%] ">
                                <p className="font-[500] text-[14px] leading-[14px] font-poppins  p-[20px] border-b-2 w-[100%]">Basic Details</p>
                                <hr />
                                <div className="p-[20px]">
                                    <p className="font-poppins font-[400] text-[16px] leading-[24px] text-[#1A1A1A] ">{state?.User?.name}</p>
                                    <p className="font-poppins font-[400] text-[14px] leading-[16px] text-[#666666] mt-[10px]">{state?.Address?.address_line1 + "\n" + state?.Address?.address_line2}</p>
                                </div>
                                <div className="p-[20px]">
                                    <p className="font-poppins font-[500] text-[12px] leading-[12px] text-[#999999]">Email</p>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A] ">{state?.User?.email}</p>
                                    <p className="font-poppins font-[500] text-[12px] leading-[12px] text-[#999999] mt-[10px]">Phone</p>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#666666] ">{state?.Address?.phone_number}</p>
                                </div>
                            </div>
                            <div className="border-r-[2px] w-[50%] ">
                                <p className="font-[500] text-[14px] leading-[14px] font-poppins  p-[20px] border-b-2 w-[100%]">Shipping Address</p>
                                <hr />
                                <div className="p-[20px]">
                                    <p className="font-poppins font-[400] text-[16px] leading-[24px] text-[#1A1A1A] ">{state?.Address?.full_name}</p>
                                    <p className="font-poppins font-[400] text-[14px] leading-[16px] text-[#666666] mt-[10px]">{state?.Address?.address_line1 + "\n" + state?.Address?.address_line2}</p>
                                </div>
                                <div className="p-[20px]">
                                    <p className="font-poppins font-[500] text-[12px] leading-[12px] text-[#999999]">Email</p>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A] ">{state?.User?.email}</p>
                                    <p className="font-poppins font-[500] text-[12px] leading-[12px] text-[#999999] mt-[10px]">Phone</p>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#666666] ">{state?.Address?.phone_number}</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-2 rounded-[8px] w-[32%]">
                            <div className="flex justify-between w-full p-[20px]">
                                <div>
                                    <h2 className="font-poppins font-[500] text-[12px] leading-[12px] text-[#999999]">ORDER ID:</h2>
                                    <h2 className="mt-[5px] font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A]">#{state?._id}</h2>
                                </div>
                                {/* <hr className="w-[10px]"/> */}
                                <div className="h-[40px] w-[2px] text-[#1A1A1A]"></div>
                                <div>
                                    <h2 className="font-poppins font-[500] text-[12px] leading-[12px] text-[#999999]">Payment Method:</h2>
                                    <h2 className="mt-[5px] font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A]">{state?.paymentMethod}</h2>
                                </div>

                            </div>
                            <hr />
                            <div className="p-[20px]">
                                <div className="flex items-center justify-between border-b-2 pb-[10px] mb-[10px]">
                                    <p className="font-[400] text-[14px] leading-[21px] text-[#666666]">Subtotal</p>
                                    <p className="font-[500] text-[14px] leading-[21px] text-[#1A1A1A]">${state?.totalAmount?.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center justify-between border-b-2 pb-[10px] mb-[10px]">
                                    <p className="font-[400] text-[14px] leading-[21px] text-[#666666]">Discount</p>
                                    <p className="font-[500] text-[14px] leading-[21px] text-[#1A1A1A]">${Number(state?.totalAmount - state?.totalAmountAfterDiscount)?.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center justify-between ">
                                    <p className="font-[400] text-[28px] leading-[27px] text-[#1A1A1A]">Total</p>
                                    <p className="font-[600] text-[18px] leading-[27px] text-[#003459]">${state?.totalAmountAfterDiscount?.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="relative  flex items-center justify-center">
                        {Checked > 0 ? (
                            <div className="relative w-[90%]  flex items-center">
                                <div className="relative flex flex-col justify-center items-center">
                                    <div className={`w-[40px] h-[40px] flex items-center justify-center ${Checked >= 1 ? "bg-[#103559]" : "bg-[#F2F2F2]"} rounded-full`}>
                                        <p className={`font-[500] leading-[40px] text-[14px] ${Checked >= 1 ? 'text-[#fff]' : 'text-[#000]'} `}>01</p>
                                    </div>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#103559]">Order received</p>
                                </div>
                                <div className={`absolute left-[65px] bottom-[35px]  w-[200px] h-[8px] ${Checked >= 1 ? "bg-[#103559]" : "bg-[#F2F2F2]"} `}></div>
                                <div className="absolute left-[220px] flex flex-col justify-center items-center">
                                    <div className={`w-[40px] h-[40px] flex items-center justify-center ${Checked >= 2 ? "bg-[#103559]" : "bg-[#F2F2F2]"} rounded-full`}>
                                        <p className={`font-[500] leading-[40px] text-[14px] ${Checked >= 2 ? 'text-[#fff]' : 'text-[#000]'} `}>02</p>
                                    </div>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#103559]">Processing</p>
                                </div>
                                <div className={`absolute left-[270px] bottom-[35px]  w-[200px] h-[8px] ${Checked >= 2 ? "bg-[#103559]" : "bg-[#F2F2F2]"} `}></div>
                                <div className="absolute left-[455px] flex flex-col justify-center items-center">
                                    <div className={`w-[40px] h-[40px] flex items-center justify-center ${Checked >= 3 ? "bg-[#103559]" : "bg-[#F2F2F2]"} rounded-full`}>
                                        <p className={`font-[500] leading-[40px] text-[14px] ${Checked >= 3 ? 'text-[#fff]' : 'text-[#000]'} `}>03</p>
                                    </div>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#103559]">On the way</p>
                                </div>
                                <div className={`absolute left-[510px] bottom-[35px]  w-[200px] h-[8px] ${Checked >= 3 ? "bg-[#103559]" : "bg-[#F2F2F2]"} `}></div>
                                <div className="absolute left-[695px] flex flex-col justify-center items-center">
                                    <div className={`w-[40px] h-[40px] flex items-center justify-center ${Checked >= 4 ? " bg-[#103559]" : "bg-[#F2F2F2]"} rounded-full`}>
                                        <p className={`font-[500] leading-[40px] text-[14px] ${Checked >= 4 ? 'text-[#fff]' : 'text-[#000]'} `}>04</p>
                                    </div>
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#103559]">Delivery</p>
                                </div>
                            </div>
                        ) : (
                            <p className="font-[400] text-[28px] leading-[27px] text-[#1A1A1A]">The Order Was {state?.status} Or There Must Be Some Issue</p>
                        )}
                    </section>
                    <section>
                        <div className="w-full flex items-center justify-between p-[10px] mt-[15px] bg-[#F2F2F2]">
                            <p className="font-[500] text-[12px] leading-[12px] font-poppins text-[#4D4D4D] w-[40%]">Product</p>
                            <p className="font-[500] text-[12px] leading-[12px] font-poppins text-[#4D4D4D] w-[10%]">PRICE</p>
                            <p className="font-[500] text-[12px] leading-[12px] font-poppins text-[#4D4D4D] w-[10%]">QUANTIY</p>
                            <p className="font-[500] text-[12px] leading-[12px] font-poppins text-[#4D4D4D] w-[20%]">SUBTOTAL</p>
                        </div>{state?.Product?.length > 0 && state?.Product?.map((a) =>
                            <div className="flex items-center justify-between w-full border-b-2 p-[10px] border-b-[#E6E6E6]">
                                <div className="flex items-center gap-[5px] w-[40%]">
                                    <img src={a?.product?.images?.[0]?.filename ? `${ImageCloud}/${a?.product?.images?.[0]?.filename}` : null} className="w-[70px] h-[70px]" />
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#00171F]">{a?.product?.ProductCode}-{a?.product?.name}</p>
                                </div >
                                <div className="w-[10%]">
                                    {a?.totalPriceAfterDiscount < a?.totalPrice ? (
                                        <p className="text-center text-[16px] leading-[24px] font-Poppins font-400 text-[#103559]">
                                            <del className="text-[#00171F] text-[13px] mr-[5px] truncate">${Number(a?.totalPrice)?.toFixed(2)}</del>
                                            ${Number(a?.totalPriceAfterDiscount)?.toFixed(2)}
                                        </p>
                                    ) : (
                                        <p className="text-center text-[16px] leading-[24px] font-Poppins font-400 text-[#103559]">
                                            ${Number(a?.totalPrice)?.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                                <div className="w-[10%]">
                                    <p className="font-poppins font-[400] text-[14px] leading-[21px] text-[#1A1A1A] ">x{a?.quantity}</p>
                                </div>
                                <div className="w-[20%]">
                                    {a?.totalPriceAfterDiscount < a?.totalPrice ? (
                                        <p className="text-center text-[16px] leading-[24px] font-Poppins font-400 text-[#103559]">
                                            <del className="text-[#00171F] text-[13px] mr-[5px] truncate">${Number(a?.totalPrice * a?.quantity)?.toFixed(2)}</del>
                                            ${Number(a?.totalPriceAfterDiscount * a?.quantity)?.toFixed(2)}
                                        </p>
                                    ) : (
                                        <p className="text-center text-[16px] leading-[24px] font-Poppins font-400 text-[#103559]">
                                            ${Number(a?.totalPrice * a?.quantity)?.toFixed(2)}
                                        </p>
                                    )}</div>
                            </div >)
                        }
                    </section >
                </div >
            </div >
        </div >
    )
}
export default withAuthContext(OrderTracking)