import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCompactDisc, FaFilter, FaBolt, FaCogs, FaArrowRight } from "react-icons/fa";

// Best-effort icon per category name — falls back to a generic gear icon
// for any category that doesn't match a known automotive keyword.
function iconFor(name) {
  const key = (name || "").toLowerCase();
  if (key.includes("brake")) return FaCompactDisc;
  if (key.includes("filter")) return FaFilter;
  if (key.includes("electrical") || key.includes("battery") || key.includes("ignition")) return FaBolt;
  return FaCogs;
}

function CategoryShowcase({ AllCategories }) {
  const navigate = useNavigate();
  const categories = AllCategories?.slice(0, 8) || [];

  if (!categories.length) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center mb-[5%]">
      <div className="flex flex-row justify-between items-center w-full mb-8">
        <div>
          <p className="text-[#f97316] text-sm font-medium uppercase tracking-wider mb-2">
            Browse By
          </p>
          <h2 className="text-[#1d1d1f] font-semibold text-3xl md:text-4xl tracking-tight">
            Shop by Category
          </h2>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((c) => {
          const Icon = iconFor(c?.name);
          return (
            <div
              key={c?._id}
              onClick={() => navigate(`/Category/${c?.name?.toLowerCase()}`)}
              className="group cursor-pointer bg-white rounded-2xl border border-[#d2d2d7] hover:border-[#f97316] p-6 flex flex-col items-center gap-4 transition-colors duration-200"
            >
              <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center group-hover:bg-[#f97316] transition-colors duration-200">
                <Icon className="w-6 h-6 text-[#1d1d1f] group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="text-center">
                <div className="font-medium text-[#1d1d1f] capitalize text-sm md:text-base">{c?.name}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-[#f97316] font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Shop now <FaArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryShowcase;
