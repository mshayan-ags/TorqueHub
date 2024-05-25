import React, { useEffect } from "react"
import Footer from "../Components/Footer"
import Header from "../Components/Header/index"
import New from "../Section/New"
import { withWishlistContext } from "../context/Wishlist"
import { withCartContext } from "../context/Cart"
import { withProductContext } from "../context/Product"
import { useNavigate } from "react-router-dom"
import { ImageCloud } from "../link"
import { FaHeart, FaShoppingCart, FaTrash, FaCheck, FaFacebook, FaTwitter, FaPinterest, FaInstagram } from "react-icons/fa"
import { MdOutlineInventory2 } from "react-icons/md"

function Wishlist({ Wishlist, GetWishlist, RemoveFromWishlist, AddToCart, isItemCart, AllProduct, shuffleArr }) {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        GetWishlist && GetWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const items = Wishlist || [];
    const totalValue = items?.reduce((sum, w) => sum + (Number(w?.price) || 0), 0);

    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">

            <Header />
            <div className="relative z-10 w-full flex flex-col justify-center items-center">
               <div className="w-[90%] max-w-7xl">
                    {/* Header */}
                    <div className="text-center mt-10 mb-12">
                        <FaHeart className="text-4xl text-[#f97316] mb-4 inline-block" />
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                            Your Wishlist
                        </h2>
                        <p className="text-[#6e6e73] text-lg">Save your favorite items for later</p>
                    </div>

                    {/* Product Table */}
                    <div className="w-full rounded-2xl bg-white border border-[#d2d2d7] overflow-hidden">
                        {items?.length > 0 && (
                            <div className="flex items-center justify-between p-6 bg-[#f5f5f7] border-b border-[#d2d2d7]">
                                <p className="w-[50%] text-sm font-medium uppercase tracking-wider text-[#6e6e73]">Product</p>
                                <p className="w-[15%] text-sm font-medium uppercase tracking-wider text-[#6e6e73] text-center">Price</p>
                                <p className="w-[15%] text-sm font-medium uppercase tracking-wider text-[#6e6e73] text-center">Status</p>
                                <p className="w-[15%] text-sm font-medium uppercase tracking-wider text-[#6e6e73] opacity-0">Action</p>
                                <p className="w-[5%] text-sm font-medium uppercase tracking-wider text-[#6e6e73] opacity-0">Remove</p>
                            </div>
                        )}

                        {items?.length > 0 ? items.map((w, index) => {
                            const product = w || {};
                            return (
                                <div key={product?._id || index} className="group flex flex-col md:flex-row items-center justify-between p-6 border-b border-[#f0f0f2] hover:bg-[#f5f5f7] transition-colors duration-200 gap-4">
                                    {/* Product Info */}
                                    <div
                                        className="w-full md:w-[50%] flex items-center gap-4 cursor-pointer"
                                        onClick={() => navigate(`/ProductDetails/${product?._id}`)}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={product?.images?.[0]?.filename ? `${ImageCloud}/${product?.images?.[0]?.filename}` : undefined}
                                                alt={product?.name || "Product"}
                                                className="w-24 h-24 object-cover rounded-xl bg-[#f5f5f7]"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-[#1d1d1f]">
                                                {product?.name || "Product"}
                                            </h3>
                                            <p className="text-sm text-[#86868b] mt-1">{product?.ProductCode}</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="w-full md:w-[15%] text-center">
                                        <p className="text-xl font-semibold text-[#1d1d1f]">
                                            ${Number(product?.price || 0)?.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="w-full md:w-[15%] flex justify-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f5f7] rounded-full">
                                            <FaCheck className="text-[#1d1d1f] text-sm" />
                                            <span className="text-sm font-medium text-[#1d1d1f]">In Stock</span>
                                        </div>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <div className="w-full md:w-[15%] flex justify-center">
                                        <button
                                            onClick={() => AddToCart && AddToCart({ id: product?._id, quantity: 1, price: product?.price })}
                                            className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-full transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <FaShoppingCart className="text-sm" />
                                            <span className="text-sm">{isItemCart && isItemCart(product?._id) ? "In Cart" : "Add"}</span>
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <div className="w-full md:w-[5%] flex justify-center">
                                        <button
                                            onClick={() => RemoveFromWishlist && RemoveFromWishlist(product?._id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors duration-200 group/remove"
                                        >
                                            <FaTrash className="text-[#86868b] group-hover/remove:text-red-500 text-sm transition-colors duration-200" />
                                        </button>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                <FaHeart className="text-5xl text-[#d2d2d7] mb-4" />
                                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Your wishlist is empty</h3>
                                <p className="text-[#6e6e73] mb-6 max-w-md">Browse products and tap the heart icon to save your favorites here.</p>
                                <button onClick={() => navigate("/Category")} className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3 rounded-full font-medium transition-colors duration-200">
                                    Browse Products
                                </button>
                            </div>
                        )}

                        {/* Share Section */}
                        {items?.length > 0 && (
                            <div className="flex items-center gap-4 p-6 bg-[#f5f5f7]">
                                <p className="font-medium text-[#1d1d1f]">Share Your Wishlist:</p>
                                <div className="flex gap-3">
                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
                                        <FaFacebook className="w-4 h-4 text-[#6e6e73]" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
                                        <FaTwitter className="w-4 h-4 text-[#6e6e73]" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
                                        <FaPinterest className="w-4 h-4 text-[#6e6e73]" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
                                        <FaInstagram className="w-4 h-4 text-[#6e6e73]" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Section */}
                    {items?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-12">
                            <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7] text-center">
                                <FaHeart className="text-2xl text-[#1d1d1f] mx-auto mb-3" />
                                <h3 className="text-3xl font-semibold text-[#1d1d1f]">{items?.length}</h3>
                                <p className="text-[#6e6e73] mt-1">Items Saved</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7] text-center">
                                <MdOutlineInventory2 className="text-2xl text-[#1d1d1f] mx-auto mb-3" />
                                <h3 className="text-3xl font-semibold text-[#1d1d1f]">{items?.length}</h3>
                                <p className="text-[#6e6e73] mt-1">In Stock</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7] text-center">
                                <FaShoppingCart className="text-2xl text-[#1d1d1f] mx-auto mb-3" />
                                <h3 className="text-3xl font-semibold text-[#1d1d1f]">${totalValue?.toFixed(2)}</h3>
                                <p className="text-[#6e6e73] mt-1">Total Value</p>
                            </div>
                        </div>
                    )}

                    <New
                        ProductsArr={shuffleArr ? shuffleArr(AllProduct || []).slice(0, 4) : []}
                        heading={"View Related Product"}
                        subHeading={"Not sure which part fits your vehicle?"}
                    />
                </div>

            </div>
            <div className="mt-20">
                <Footer />
            </div>
            </div>
        </React.Fragment>
    )
}
export default withProductContext(withCartContext(withWishlistContext(Wishlist)))
