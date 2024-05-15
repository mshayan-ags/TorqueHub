import React, { useEffect, useState } from "react";
import axios from "axios";
import swal from "sweetalert";
import { withAuthContext } from "../../context/Auth";
import { BackendLink } from "../../link";
import { FaUser, FaEnvelope, FaBell, FaSave } from "react-icons/fa";

function Setting({ currUser, GetCurrentUser, Token }) {
    const [state, setState] = useState({
        name: "",
        email: "",
        subscriber: false,
    });
    const [Loading, setLoading] = useState(false);

    useEffect(() => {
        GetCurrentUser && GetCurrentUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (currUser?._id) {
            setState({
                name: currUser?.name || "",
                email: currUser?.email || "",
                subscriber: !!currUser?.subscriber,
            });
        }
    }, [currUser]);

    const handleSubmit = () => {
        if (!state?.name || !state?.email) {
            swal({
                text: "Name and Email are required",
                button: { text: "Ok", closeModal: true },
                icon: "warning",
            });
            return;
        }
        setLoading(true);
        axios
            .post(
                `${BackendLink}/Update-User`,
                {
                    name: state?.name,
                    email: state?.email,
                    subscriber: state?.subscriber,
                },
                {
                    headers: {
                        Authorization: Token ? `${Token}` : `${localStorage.getItem("token")}`,
                    },
                }
            )
            .then((res) => {
                setLoading(false);
                swal({
                    text: res?.data?.message || "Profile Updated",
                    button: { text: "Ok", closeModal: true },
                    icon: res?.data?.status == 200 ? "success" : "error",
                });
                if (res?.data?.status == 200) {
                    GetCurrentUser && GetCurrentUser();
                }
            })
            .catch((err) => {
                setLoading(false);
                swal({
                    text: err?.response?.data?.message || "There was some Error",
                    button: { text: "Ok", closeModal: true },
                    icon: "error",
                });
            });
    };

    return (
        <div className="relative flex flex-col w-full bg-white border border-[#d2d2d7] md:ml-[5%] py-10 md:py-12 rounded-2xl px-8 md:px-12">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
                    Account Settings
                </h1>
                <p className="text-sm text-[#6e6e73] mt-1">Manage your personal information</p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Full Name</label>
                <div className="flex items-center gap-3 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl overflow-hidden bg-white transition-colors duration-200">
                    <div className="px-4 h-14 flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-[#6e6e73]" />
                    </div>
                    <input
                        value={state?.name}
                        onChange={(e) => setState({ ...state, name: e?.target?.value })}
                        className="flex-1 px-4 py-4 outline-none text-[#1d1d1f]"
                        placeholder="Your Name"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Email Address</label>
                <div className="flex items-center gap-3 border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl overflow-hidden bg-white transition-colors duration-200">
                    <div className="px-4 h-14 flex items-center justify-center">
                        <FaEnvelope className="w-4 h-4 text-[#6e6e73]" />
                    </div>
                    <input
                        value={state?.email}
                        onChange={(e) => setState({ ...state, email: e?.target?.value })}
                        className="flex-1 px-4 py-4 outline-none text-[#1d1d1f]"
                        placeholder="you@example.com"
                        type="email"
                    />
                </div>
            </div>

            <div className="mb-8 flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={state?.subscriber}
                    onChange={(e) => setState({ ...state, subscriber: e?.target?.checked })}
                    className="w-5 h-5 rounded border border-[#d2d2d7] text-[#f97316]"
                    id="subscriber"
                />
                <label htmlFor="subscriber" className="text-sm text-[#1d1d1f] flex items-center gap-2">
                    <FaBell className="w-4 h-4 text-[#6e6e73]" /> Subscribe to newsletter & offers
                </label>
            </div>

            <button
                onClick={handleSubmit}
                disabled={Loading}
                className="w-full md:w-auto self-start px-8 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-full transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
            >
                <FaSave className="w-4 h-4" />
                {Loading ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
}

export default withAuthContext(Setting);
