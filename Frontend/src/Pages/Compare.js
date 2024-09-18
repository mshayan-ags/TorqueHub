import React, { useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BreadCrumbContainer from "../Components/BreadCrumbs";
import { withProductContext } from "../context/Product";
import { withCompareContext } from "../context/Compare";
import { withCartContext } from "../context/Cart";
import { useNavigate } from "react-router-dom";
import { ImageCloud } from "../link";
import Placeholder from "../assets/AutoPartFallback.svg";
import { FaTrash, FaBalanceScale } from "react-icons/fa";
import { BsFillBasket3Fill } from "react-icons/bs";
import { IoIosRemoveCircleOutline } from "react-icons/io";

const ROWS = [
  { label: "Price", render: (p) => `$${Number(p?.price || 0).toFixed(2)}` },
  { label: "Brand", render: (p) => p?.brand?.name || "-" },
  { label: "Category", render: (p) => p?.category?.name || "-" },
  { label: "Condition", render: (p) => p?.condition || "-" },
  { label: "Color", render: (p) => p?.currentColor || "-" },
  { label: "Size", render: (p) => p?.currentSize || "-" },
  { label: "Material", render: (p) => p?.currentMaterial || "-" },
  { label: "Weight", render: (p) => p?.technical_specs?.weight || "-" },
  { label: "Warranty", render: (p) => p?.technical_specs?.warranty || "-" },
];

function Compare({ AllProduct, Compare, RemoveFromCompare, ClearCompare, AddToCart, isItemCart, RemoveItemCart }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const products = (Compare || [])
    .map((id) => AllProduct?.find((p) => p?._id === id))
    .filter(Boolean);

  return (
    <div className="relative min-h-screen bg-white">
      <Header />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <BreadCrumbContainer />
        <div className="flex items-center justify-between mt-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight">Compare Products</h1>
          {products.length > 0 && (
            <button onClick={ClearCompare} className="text-sm text-[#6e6e73] hover:text-[#f97316] font-medium">
              Clear all
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-[#d2d2d7] rounded-2xl">
            <FaBalanceScale className="w-16 h-16 text-[#d2d2d7] mb-6" />
            <p className="text-lg text-[#6e6e73] mb-6">No products added to compare yet</p>
            <button
              onClick={() => navigate("/Category")}
              className="px-8 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full font-medium transition-colors duration-200"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm text-[#6e6e73] w-40"></th>
                  {products.map((p) => (
                    <th key={p._id} className="p-4 align-top border-b border-[#d2d2d7] min-w-[220px]">
                      <div className="relative bg-[#f5f5f7] rounded-xl aspect-square flex items-center justify-center p-4 mb-3">
                        <button
                          onClick={() => RemoveFromCompare(p._id)}
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200"
                        >
                          <FaTrash className="w-3 h-3 text-[#6e6e73]" />
                        </button>
                        <img
                          src={p?.images?.[0]?.filename ? `${ImageCloud}/${p.images[0].filename}` : Placeholder}
                          className="max-h-full max-w-full object-contain cursor-pointer"
                          alt={p?.name}
                          onClick={() => navigate(`/ProductDetails/${p._id}`)}
                        />
                      </div>
                      <p
                        className="font-medium text-[#1d1d1f] text-sm cursor-pointer hover:text-[#f97316] line-clamp-2"
                        onClick={() => navigate(`/ProductDetails/${p._id}`)}
                      >
                        {p?.name}
                      </p>
                      <button
                        onClick={() =>
                          isItemCart(p._id)
                            ? RemoveItemCart(p._id)
                            : AddToCart({ id: p._id, quantity: 1, price: p.price, discountedPrice: p.price, DiscountID: null })
                        }
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-medium rounded-full transition-colors duration-200"
                      >
                        {isItemCart(p._id) ? <IoIosRemoveCircleOutline /> : <BsFillBasket3Fill />}
                        {isItemCart(p._id) ? "Remove From Cart" : "Add To Cart"}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-[#f0f0f2]">
                    <td className="p-4 text-sm font-medium text-[#6e6e73]">{row.label}</td>
                    {products.map((p) => (
                      <td key={p._id} className="p-4 text-sm text-[#1d1d1f] text-center">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default withCompareContext(withCartContext(withProductContext(Compare)));
