import React from "react";
import { FaShippingFast, FaCertificate, FaHeadset, FaUndo } from "react-icons/fa";

const FEATURES = [
  { icon: FaShippingFast, title: "Fast Shipping", subtitle: "On orders over $50" },
  { icon: FaCertificate, title: "Genuine Parts", subtitle: "OE-quality guaranteed" },
  { icon: FaHeadset, title: "Expert Support", subtitle: "Real mechanics, real answers" },
  { icon: FaUndo, title: "Easy Returns", subtitle: "30-day money back" },
];

function TrustBar() {
  return (
    <div className="relative w-full bg-[#f5f5f7] py-10 border-y border-[#d2d2d7]">
      <div className="max-w-7xl mx-auto px-[5%] grid grid-cols-2 md:grid-cols-4 gap-6">
        {FEATURES.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3 md:gap-4">
            <div className="shrink-0 w-11 h-11 rounded-full bg-white border border-[#d2d2d7] flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#f97316]" />
            </div>
            <div>
              <div className="text-[#1d1d1f] font-medium text-sm md:text-base">{title}</div>
              <div className="text-[#6e6e73] text-xs md:text-sm">{subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrustBar;
