import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BlogCard from "../Components/Blog Card";
import { BackendLink } from "../link";
import { FaBookOpen } from "react-icons/fa";

function Blog() {
    const [Blogs, setBlogs] = useState([]);
    const [Loading, setLoading] = useState(true);
    const [Error, setError] = useState(null);

    const GetAllBlogs = () => {
        setLoading(true);
        axios
            .get(`${BackendLink}/GetAllBlogs`)
            .then((res) => {
                setLoading(false);
                if (res?.data?.status == 200) {
                    setBlogs(res?.data?.data || []);
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
        GetAllBlogs();
    }, []);

    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">
                <Header />
                <div className="relative z-10 w-full flex flex-col items-center mt-10 mb-10">
                    <div className="w-[90%] max-w-7xl">
                        <div className="text-center mb-12">
                            <FaBookOpen className="text-4xl text-[#f97316] mb-4 inline-block" />
                            <h1 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight">
                                Our Blog
                            </h1>
                            <p className="text-[#6e6e73] mt-2">Tips, guides and news for drivers and car enthusiasts</p>
                        </div>

                        {Loading ? (
                            <p className="text-center text-[#86868b]">Loading articles...</p>
                        ) : Blogs?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Blogs.map((b) => (
                                    <BlogCard
                                        key={b?._id}
                                        id={b?._id}
                                        title={b?.title}
                                        excerpt={b?.excerpt || b?.content?.slice?.(0, 120)}
                                        image={b?.image?.filename}
                                        date={b?.created_at}
                                        category={b?.category}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-[#86868b] py-20">
                                {Error || "No blog posts published yet. Check back soon!"}
                            </p>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </React.Fragment>
    );
}

export default Blog;
