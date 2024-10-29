import React, { useEffect, useState } from "react";
import axios from "axios";
import BreadsCrumbs from "../Components/BreadCrumbs";
import CustomCard from "../Components/Card";
import Filter from "../Components/Filter";
import Footer from "../Components/Footer";
import Headers from "../Components/Header/index";
import { withProductContext } from "../context/Product";
import { withVehicleContext } from "../context/Vehicle";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BackendLink } from "../link";
import { FaFilter, FaTh, FaThList, FaBoxOpen } from "react-icons/fa";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";

const initialValue = {
    Category: null,
    Material: null,
    Brand: null,
    Color: null,
    MinPrice: null,
    MaxPrice: null,
    Weight: null,
    FitsVehicle: false,
}
function Category({ AllProduct, GetAllProduct, productFitsVehicle, Vehicle }) {
    const { name } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const q = searchParams.get("q")
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // This makes the scrolling smooth
        });
        GetAllProduct()
    }, [])

    const [FilterValue, setFilterValue] = useState(initialValue)
    const [Products, setProducts] = useState([]);
    const [SearchResults, setSearchResults] = useState(null);
    const [SearchLoading, setSearchLoading] = useState(false);
    const [From, setFrom] = useState(0);
    const [Open, setOpen] = useState(false);

    // A ?q= search hits the backend for relevance-ranked results (name,
    // code, description, brand, category) instead of the client-side
    // catalog-wide filtering below, which only does a plain name/category
    // substring match.
    useEffect(() => {
        if (!q) { setSearchResults(null); return; }
        setSearchLoading(true);
        axios
            .get(`${BackendLink}/SearchProducts`, { params: { q } })
            .then((res) => {
                setSearchLoading(false);
                if (res?.data?.status == 200) {
                    setSearchResults(res?.data?.data || []);
                }
            })
            .catch(() => {
                setSearchLoading(false);
                setSearchResults([]);
            });
    }, [q]);

    useEffect(() => {
        const baseList = q ? SearchResults : AllProduct;
        if (!baseList || !FilterValue) { setProducts(baseList); return; } // Handle null or undefined values

        let filteredProducts = [...(baseList)]; // Copy the base list initially
        if (name) {
            filteredProducts = filteredProducts.filter(product => {
                if (product.name?.toLowerCase()?.includes(name?.toLowerCase())) {
                    return product
                }

                if (product.category?.name?.toLowerCase() == name?.toLowerCase()) {
                    return product
                }
            });
        }
        if (FilterValue.Category) {
            filteredProducts = filteredProducts.filter(product => product.category?._id == FilterValue.Category);
        }
        if (FilterValue.Brand) {
            filteredProducts = filteredProducts.filter(product => product.brand?._id == FilterValue.Brand);
        }
        if (FilterValue.Material) {
            filteredProducts = filteredProducts.filter(product => product.currentMaterial?.toLowerCase() == FilterValue.Material?.toLowerCase());
        }
        if (FilterValue.Weight) {
            filteredProducts = filteredProducts.filter(product => product.currentSize?.toLowerCase() == FilterValue.Weight?.toLowerCase());
        }
        if (FilterValue.Color) {
            filteredProducts = filteredProducts.filter(product => product.currentColor?.toLowerCase() == FilterValue.Color?.toLowerCase());
        }
        if (FilterValue.MinPrice) {
            filteredProducts = filteredProducts.filter(product => product.price >= FilterValue.MinPrice);
        }
        if (FilterValue.MaxPrice) {
            filteredProducts = filteredProducts.filter(product => product.price <= FilterValue.MaxPrice);
        }
        if (FilterValue.FitsVehicle) {
            filteredProducts = filteredProducts.filter(product => productFitsVehicle(product));
        }

        setProducts(filteredProducts);
        setFrom(0)
    }, [AllProduct, SearchResults, FilterValue, name, q, Vehicle]);

    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">

                <Headers />

                {/* Header Section */}
                <div className="relative z-10 w-full flex justify-center mt-8 md:mt-16 mb-6">
                    <div className="w-[90%] md:w-[83%]">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#d2d2d7]">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight capitalize">
                                    {q ? `Results for "${q}"` : (name || "All Products")}
                                </h1>
                                <p className="text-[#6e6e73] mt-2 text-sm md:text-base">
                                    {SearchLoading ? "Searching..." : `${Products?.length || 0} products available`}
                                </p>
                            </div>

                            {/* Breadcrumbs */}
                            <div className="hidden md:block">
                                <BreadsCrumbs />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex item-center justify-center">
                <div className="md:w-[83%] w-full">
                    <div className="mb-[10px] px-4 gap-2 flex flex-col md:hidden">
                        <BreadsCrumbs />
                   </div>
                    <div className="w-full mt-[28px] mb-[50px] flex md:flex-row flex-col justify-center">
                        {/* Modern Filter Sidebar */}
                        <div className={`${Open ? "fixed top-0 bottom-0 left-0 z-[1000000000000000] overflow-y-scroll bg-white w-[85%] md:w-[400px]" : 'hidden'} md:flex md:w-[25%] w-[100%] h-fit md:sticky md:top-24 transition-all duration-300`}>
                            <div className="w-full rounded-2xl bg-white border border-[#d2d2d7] overflow-hidden">
                                <div className="p-6">
                                    {/* Filter Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <HiAdjustmentsHorizontal className="w-5 h-5 text-[#1d1d1f]" />
                                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Filters</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setFilterValue(initialValue)} className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200 group">
                                                <FaFilterCircleXmark className="text-[#6e6e73] group-hover:text-[#f97316] text-lg transition-colors" />
                                            </button>
                                            <button onClick={() => setOpen(!Open)} className="md:hidden p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200">
                                                <MdClose className="text-[#1d1d1f] text-xl" />
                                            </button>
                                        </div>
                                    </div>

                                    <Filter setFilterValue={(e) => {
                                        setFilterValue(e)
                                        setOpen(false)
                                    }} />
                                </div>
                            </div>
                        </div>
                        {/* Overlay */}
                        <div className={`${Open ? "fixed top-0 bottom-0 left-0 z-[1000] overflow-y-scroll bg-black/50 backdrop-blur-sm w-full" : 'hidden'} md:hidden`} onClick={() => setOpen(!Open)} />
                        
                        {/* Products Section */}
                        <div className="md:w-[70%] md:ml-[2%] mt-[10%] md:mt-0 w-[100%]">
                            {/* Top Bar */}
                            <div className="flex items-center justify-between mb-6 px-4 md:px-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setOpen(!Open)} className="md:hidden p-2 bg-[#f97316] rounded-full">
                                        <FaFilter className="text-white text-base" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-semibold text-[#1d1d1f] capitalize">
                                            {name || "All Products"}
                                        </h2>
                                        <p className="text-sm text-[#6e6e73]">{Products?.length} results found</p>
                                    </div>
                                </div>

                                {Products?.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setFrom(From > 0 ? From - 9 : 0);
                                                window.scrollTo({ top: 299, behavior: 'smooth' });
                                            }}
                                            className="group hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-[#d2d2d7] hover:border-[#f97316] rounded-full transition-colors duration-200"
                                        >
                                            <MdChevronLeft className="w-5 h-5 text-[#1d1d1f]" />
                                            <span className="text-sm font-medium text-[#1d1d1f]">Previous</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFrom(From < Products?.length ? From + 9 : 0);
                                                window.scrollTo({ top: 299, behavior: 'smooth' });
                                            }}
                                            className="group hidden md:flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] rounded-full transition-colors duration-200"
                                        >
                                            <span className="text-sm font-medium text-white">Next</span>
                                            <MdChevronRight className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Products Grid */}
                            <div className="w-full md:p-5 p-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                                {Products?.length > 0 ? Products.map((a, i) => {
                                    if (i >= From && i <= (From + 8)) return (
                                        <div key={a._id} style={{ animationDelay: `${(i - From) * 0.1}s` }} className="animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0">
                                            <CustomCard data={a} />
                                        </div>
                                    )
                                }) : (
                                    <div className="col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-3">
                                        <div className="flex flex-col items-center justify-center py-20 px-6">
                                            <FaBoxOpen className="w-20 h-20 text-[#d2d2d7] mb-6" />
                                            <h1 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] mb-3 text-center">No products found</h1>
                                            <p className="text-sm md:text-base text-[#6e6e73] text-center max-w-md mb-8">
                                                No products match your search criteria. Try adjusting your filters or browse all products to find what you're looking for.
                                            </p>
                                            <button
                                                className="group bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3 rounded-full font-medium transition-colors duration-200 flex items-center gap-2"
                                                onClick={() => {
                                                    setFilterValue(initialValue)
                                                    navigate("/Category")
                                                }}
                                            >
                                                Browse All Products
                                                <MdChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Modern Pagination */}
                            {Products?.length > 0 && (
                                <div className="flex items-center justify-center gap-2 mt-8 px-4">
                                    <button
                                        onClick={() => {
                                            setFrom(From > 0 ? From - 30 : 0);
                                            window.scrollTo({ top: 299, behavior: 'smooth' });
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d2d2d7] hover:border-[#f97316] rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={From === 0}
                                    >
                                        <MdChevronLeft className="w-5 h-5 text-[#1d1d1f]" />
                                        <span className="hidden md:inline text-sm font-medium text-[#1d1d1f]">Previous</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setFrom(From);
                                            window.scrollTo({ top: 299, behavior: 'smooth' });
                                        }}
                                        className="px-4 py-2.5 bg-[#f97316] rounded-full text-white font-medium"
                                    >
                                        {Math.ceil((From / 30) + 1)}
                                    </button>

                                    {Math.ceil((From / 30) + 2) <= Math.ceil(Products.length / 30) && (
                                        <button
                                            onClick={() => {
                                                setFrom(From < Products?.length ? From + 30 : 0);
                                                window.scrollTo({ top: 299, behavior: 'smooth' });
                                            }}
                                            className="hidden md:block px-4 py-2.5 bg-white border border-[#d2d2d7] hover:border-[#f97316] rounded-full transition-colors duration-200 text-[#1d1d1f] font-medium"
                                        >
                                            {Math.ceil((From / 30) + 2)}
                                        </button>
                                    )}

                                    {Math.ceil(Products.length / 30) > Math.ceil((From + 30) / 30) + 1 && (
                                        <div className="px-3 py-2 text-[#6e6e73]">...</div>
                                    )}

                                    {Math.ceil(Products.length / 30) > Math.ceil((From + 30) / 30) && (
                                        <button
                                            onClick={() => {
                                                setFrom(Products?.length - 30);
                                                window.scrollTo({ top: 299, behavior: 'smooth' });
                                            }}
                                            className="hidden md:block px-4 py-2.5 bg-white border border-[#d2d2d7] hover:border-[#f97316] rounded-full transition-colors duration-200 text-[#1d1d1f] font-medium"
                                        >
                                            {Math.ceil(Products.length / 30)}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            setFrom(From < Products?.length ? From + 30 : 0);
                                            window.scrollTo({ top: 299, behavior: 'smooth' });
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#f97316] hover:bg-[#ea580c] rounded-full transition-colors duration-200"
                                    >
                                        <span className="hidden md:inline text-sm font-medium text-white">Next</span>
                                        <MdChevronRight className="w-5 h-5 text-white" />
                                    </button>
                                </div>
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
export default withVehicleContext(withProductContext(Category))
