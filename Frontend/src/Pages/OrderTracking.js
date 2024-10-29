import React, { useEffect, useState } from "react"
import Header from "../Components/Header"
import BreadCrumbContainer from "../Components/BreadCrumbs"
import Footer from "../Components/Footer"
import { useParams } from "react-router-dom"
import { BackendLink, SocketUrl } from "../link"
import axios from "axios"
import swal from "sweetalert"
import { withAuthContext } from "../context/Auth"
import { io } from "socket.io-client"
import OrderSummary from "../Components/OrderSummary"
import ReturnRequestPanel from "../Components/ReturnRequest"

function OrderTracking({ Token, CheckToken }) {
    const { id } = useParams()
    const [state, setState] = useState({})
    const [Loading, setLoading] = useState(false);
    const [Live, setLive] = useState(false);

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
                        setState(res?.data?.data)
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
                    <OrderSummary state={state} Live={Live} />
                    <ReturnRequestPanel sale={state} />
                </div>
                <Footer />
            </div>
        </React.Fragment>
    )
}
export default withAuthContext(OrderTracking)
