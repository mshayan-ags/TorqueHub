import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { BackendLink, ImageCloud } from "../link";
import Dog from "../assets/AutoPartFallback.svg";
import { FaArrowLeft } from "react-icons/fa";

function BlogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [Blog, setBlog] = useState(null);
    const [Loading, setLoading] = useState(true);
    const [Error, setError] = useState(null);

    const GetBlogInfo = () => {
        setLoading(true);
        axios
            .get(`${BackendLink}/BlogInfo/${id}`)
            .then((res) => {
                setLoading(false);
                if (res?.data?.status == 200) {
                    setBlog(res?.data?.data);
                } else {
                    setError(res?.data?.message);
                }
            })
            .catch((err) => {
                setLoading(false);
                setError(err?.message);
            });
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        GetBlogInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">
                <Header />
                <div className="relative z-10 w-full flex flex-col items-center mt-10 mb-16">
                    <div className="w-[90%] max-w-4xl">
                        <button
                            onClick={() => navigate("/Blog")}
                            className="flex items-center gap-2 text-[#f97316] font-medium mb-6 hover:underline"
                        >
                            <FaArrowLeft /> Back to Blog
                        </button>

                        {Loading ? (
                            <p className="text-center text-[#86868b]">Loading article...</p>
                        ) : Blog?._id ? (
                            <article className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">
                                <img
                                    src={Blog?.image?.filename ? `${ImageCloud}/${Blog?.image?.filename}` : Dog}
                                    alt={Blog?.title}
                                    className="w-full h-[320px] object-cover bg-[#f5f5f7]"
                                />
                                <div className="p-8 md:p-10">
                                    <p className="text-sm text-[#86868b] mb-2">
                                        {moment(Blog?.created_at).format("DD MMMM YYYY")}
                                    </p>
                                    <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
                                        {Blog?.title}
                                    </h1>
                                    <div className="text-[#6e6e73] leading-relaxed whitespace-pre-line">
                                        {Blog?.content}
                                    </div>
                                </div>
                            </article>
                        ) : (
                            <p className="text-center text-[#86868b] py-20">
                                {Error || "This blog post could not be found."}
                            </p>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </React.Fragment>
    );
}

export default BlogDetail;
