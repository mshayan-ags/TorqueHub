import React, { useEffect, useState } from "react";
import MainImage from "../../assets/AutoPartFallback.svg";
import BreadsCrumbs from "../BreadCrumbs";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BackendLink, ImageCloud } from "../../link";
import { withCartContext } from "../../context/Cart";
import { withWishlistContext } from "../../context/Wishlist";

import { BsFillBasket3Fill } from "react-icons/bs";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { HiMinus, HiPlus } from "react-icons/hi";
import { FaHeart, FaRegHeart, FaCheckCircle, FaShieldAlt, FaTruck } from "react-icons/fa";

function SpecRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between py-3 border-b border-[#f0f0f2] last:border-b-0">
            <span className="text-sm font-medium text-[#6e6e73]">{label}</span>
            <span className="text-sm font-medium text-[#1d1d1f] text-right">{value}</span>
        </div>
    );
}

function VariantPills({ current, options, field, onSelect }) {
    if (!options?.length) return null;
    const others = options.filter((a) => a?.[field] !== current);
    if (!others.length) return null;
    return (
        <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full bg-[#1d1d1f] text-white text-xs font-medium">
                {current || "-"}
            </span>
            {others.map((a) => (
                <button
                    key={a?._id}
                    onClick={() => onSelect(a?._id)}
                    className="px-4 py-2 rounded-full border border-[#d2d2d7] text-[#1d1d1f] text-xs font-medium hover:border-[#f97316] transition-colors duration-200"
                >
                    {a?.[field] || "-"}
                </button>
            ))}
        </div>
    );
}

function Details({ Cart, AddToCart, isItemCart, RemoveItemCart, UpdateItemCart, getItemCart, isWishlisted, ToggleWishlist }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)

    const [ProductInfo, setProductInfo] = useState({});
    const [ProductError, setProductError] = useState(null);
    const GetProductInfo = () => {
        axios
            .get(`${BackendLink}/ProductInfo/${id}`)
            .then((res) => {
                if (res?.data?.status == 200) {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth' // This makes the scrolling smooth
                    });
                    setProductInfo(res?.data?.data);
                    setActiveImage(0);
                } else {
                    setProductError(res?.data?.message);
                }
            })
            .catch((err) => {
                setProductError(err?.message);
            });
    };

    useEffect(() => {
        GetProductInfo()
    }, [id])


    useEffect(() => {
        if (isItemCart(ProductInfo?._id)) {
            UpdateItemCart(ProductInfo?._id, quantity)
        }
    }, [quantity])

    const discountedPrice = ProductInfo?.Discount?._id
        ? (ProductInfo?.Discount?.DiscountType === 'Percentage'
            ? ProductInfo?.price - (ProductInfo?.price / 100 * ProductInfo?.Discount?.value)
            : ProductInfo?.price - ProductInfo?.Discount?.value)
        : null;

    const galleryImages = ProductInfo?.images?.length ? ProductInfo.images : [];
    const mainImageSrc = galleryImages?.[activeImage]?.filename
        ? `${ImageCloud}/${galleryImages[activeImage].filename}`
        : MainImage;

    return (
        <React.Fragment>
            <div className="w-full grid md:grid-cols-2 gap-10 items-start">
                {/* Image Gallery */}
                <div className="flex flex-col gap-4">
                    <div className="relative bg-[#f5f5f7] rounded-2xl border border-[#d2d2d7] overflow-hidden aspect-square flex items-center justify-center p-8">
                        <img
                            alt={ProductInfo?.name}
                            className="max-h-full max-w-full object-contain"
                            src={mainImageSrc}
                        />
                        {ProductInfo?.Discount?._id && (
                            <span className="absolute top-4 left-4 px-4 py-1.5 bg-[#1d1d1f] text-white text-xs font-medium rounded-full">
                                On Sale
                            </span>
                        )}
                    </div>

                    {galleryImages?.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {galleryImages.map((img, i) => (
                                <button
                                    key={img?._id || i}
                                    onClick={() => setActiveImage(i)}
                                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border flex items-center justify-center bg-white p-2 transition-colors duration-200 ${activeImage === i ? "border-[#f97316]" : "border-[#d2d2d7] hover:border-[#f97316]/50"
                                        }`}
                                >
                                    <img
                                        className="max-h-full max-w-full object-contain"
                                        loading="eager"
                                        alt=""
                                        src={img?.filename ? `${ImageCloud}/${img?.filename}` : MainImage}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-5">
                    <div className="hidden md:flex">
                        <BreadsCrumbs Brand={ProductInfo?.brand?.name} />
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-[#86868b] mb-1">
                            {ProductInfo?.ProductCode}
                        </p>
                        <h1 className="text-2xl md:text-4xl font-semibold text-[#1d1d1f] leading-tight tracking-tight">
                            {ProductInfo?.name}
                        </h1>
                    </div>

                    <div className="flex items-baseline gap-3">
                        {discountedPrice !== null ? (
                            <>
                                <p className="text-2xl md:text-3xl font-semibold text-[#1d1d1f]">
                                    ${Number(discountedPrice).toFixed(2)}
                                </p>
                                <p className="text-lg text-[#86868b] line-through">
                                    ${Number(ProductInfo?.price).toFixed(2)}
                                </p>
                            </>
                        ) : (
                            <p className="text-2xl md:text-3xl font-semibold text-[#1d1d1f]">
                                ${Number(ProductInfo?.price || 0).toFixed(2)}
                            </p>
                        )}
                    </div>

                    <p className="text-[#6e6e73] leading-relaxed">{ProductInfo?.description}</p>

                    {/* Add to cart row */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-4 border border-[#d2d2d7] rounded-full px-5 py-2">
                            <HiMinus className="w-4 h-4 cursor-pointer text-[#1d1d1f]" onClick={() => {
                                const a = getItemCart(id)?.quantity || quantity;
                                setQuantity(a > 1 ? a - 1 : 1);
                            }} />
                            <span className="text-base font-medium text-[#1d1d1f] w-6 text-center">
                                {getItemCart(id)?.quantity || quantity}
                            </span>
                            <HiPlus className="w-4 h-4 cursor-pointer text-[#1d1d1f]" onClick={() => {
                                const a = getItemCart(id)?.quantity || quantity;
                                setQuantity(a + 1);
                            }} />
                        </div>

                        <button
                            onClick={() => {
                                if (isItemCart(ProductInfo?._id)) {
                                    RemoveItemCart(ProductInfo?._id)
                                } else {
                                    AddToCart({
                                        id: ProductInfo?._id,
                                        quantity: 1,
                                        price: ProductInfo?.price,
                                        discountedPrice: discountedPrice !== null ? discountedPrice : ProductInfo?.price,
                                        DiscountID: ProductInfo?.Discount?._id || null
                                    })
                                }
                            }}
                            className="flex-1 min-w-[180px] flex items-center justify-center gap-3 px-8 py-4 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-full transition-colors duration-200"
                        >
                            {isItemCart(ProductInfo?._id) ?
                                <IoIosRemoveCircleOutline className="w-5 h-5" />
                                : <BsFillBasket3Fill className="w-5 h-5" />
                            }
                            {isItemCart(ProductInfo?._id) ? "Remove From Cart" : "Add To Cart"}
                        </button>

                        <button
                            onClick={() => ToggleWishlist && ToggleWishlist(ProductInfo?._id)}
                            className="w-14 h-14 flex items-center justify-center rounded-full border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200"
                        >
                            {isWishlisted && isWishlisted(ProductInfo?._id) ? (
                                <FaHeart className="w-5 h-5 text-[#f97316]" />
                            ) : (
                                <FaRegHeart className="w-5 h-5 text-[#6e6e73]" />
                            )}
                        </button>
                    </div>

                    {/* Trust row */}
                    <div className="flex flex-wrap gap-6 pt-2 pb-2 text-sm text-[#6e6e73]">
                        <div className="flex items-center gap-2">
                            <FaShieldAlt className="text-[#f97316]" /> Genuine parts
                        </div>
                        <div className="flex items-center gap-2">
                            <FaTruck className="text-[#f97316]" /> Fast shipping
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-[#f97316]" /> In stock
                        </div>
                    </div>

                    {/* Variant selectors */}
                    {ProductInfo?.color?.length > 1 && (
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-2">Color</p>
                            <div className="flex flex-wrap gap-3">
                                <span className="w-9 h-9 rounded-full border-2 border-[#f97316] shadow-md" style={{ background: ProductInfo?.currentColor }}></span>
                                {ProductInfo?.color?.map((a) => {
                                    if (a?.currentColor === ProductInfo?.currentColor) return null;
                                    return (
                                        <button key={a?._id} onClick={() => navigate(`/ProductDetails/${a?._id}`)}>
                                            <span className="w-9 h-9 block rounded-full border-2 border-gray-200 hover:border-[#f97316] transition-all duration-300" style={{ background: a?.currentColor }}></span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {ProductInfo?.material?.length > 1 && (
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-2">Material</p>
                            <VariantPills
                                current={ProductInfo?.currentMaterial}
                                options={ProductInfo?.material}
                                field="currentMaterial"
                                onSelect={(pid) => navigate(`/ProductDetails/${pid}`)}
                            />
                        </div>
                    )}

                    {ProductInfo?.size?.length > 1 && (
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-2">Size</p>
                            <VariantPills
                                current={ProductInfo?.currentSize}
                                options={ProductInfo?.size}
                                field="currentSize"
                                onSelect={(pid) => navigate(`/ProductDetails/${pid}`)}
                            />
                        </div>
                    )}

                    {/* Spec sheet */}
                    <div className="mt-2 bg-white rounded-2xl border border-[#d2d2d7] p-6">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-[#6e6e73] mb-3">Specifications</h3>
                        <SpecRow label="Category" value={ProductInfo?.category?.name} />
                        <SpecRow label="Condition" value={ProductInfo?.condition} />
                        <SpecRow label="Weight" value={ProductInfo?.technical_specs?.weight} />
                        <SpecRow label="Dimensions" value={ProductInfo?.technical_specs?.dimensions} />
                        <SpecRow label="Warranty" value={ProductInfo?.technical_specs?.warranty} />
                        {ProductInfo?.specifications && (
                            <p className="text-sm text-[#6e6e73] mt-4 leading-relaxed">{ProductInfo?.specifications}</p>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
export default withWishlistContext(withCartContext(Details))
