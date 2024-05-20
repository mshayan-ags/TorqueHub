import React from "react";
import CustomCard from "../Components/Card";
import { FaArrowRight } from "react-icons/fa";
import "./index.css";
import { useNavigate } from "react-router-dom";

function New({ heading, subHeading, ProductsArr }) {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden w-full flex flex-col items-center justify-center md:py-[30px] mb-[5%]">
      {/* Modern Header */}
      <div className="flex flex-row justify-between items-center md:my-[28px] w-full mb-8">
        <div className="relative">
          {subHeading && (
            <p className="text-[#f97316] text-sm font-medium uppercase tracking-wider mb-2">
              {subHeading}
            </p>
          )}
          <h2 className="text-[#1d1d1f] font-semibold text-3xl md:text-4xl tracking-tight capitalize">
            {heading}
          </h2>
        </div>

        <div className="md:flex hidden">
          <button
            onClick={() => navigate("/Category")}
            className="text-[#1d1d1f] font-medium hover:text-[#f97316] transition-colors duration-200 flex items-center gap-2"
          >
            View All
            <FaArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="w-full py-[20px] md:p-[20px] grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
        {ProductsArr?.length
          ? ProductsArr?.map((a, index) => (
              <div
                key={a._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CustomCard data={a} />
              </div>
            ))
          : null}
      </div>
      
      {/* Mobile View More Button */}
      <div className="md:hidden flex w-[90%] items-center justify-center mt-6">
        <button
          className="w-full bg-[#f97316] hover:bg-[#ea580c] rounded-full inline-flex py-3.5 px-6 gap-2 items-center justify-center transition-colors duration-200"
          onClick={() => navigate("/Category")}
        >
          <p className="text-white font-medium text-sm">
            View All Products
          </p>
          <FaArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default New;
