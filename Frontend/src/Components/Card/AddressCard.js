import React from 'react';
import { withCartContext } from '../../context/Cart';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdPhone, MdLocationOn, MdCheckCircle } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";

const Card = ({ id, address, country, city, state, phone_number, name, setAddress, Select }) => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
      <div className="p-6">
        {/* Header with icon */}
        <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#f5f5f7] rounded-full flex items-center justify-center">
              <MdHome className="w-5 h-5 text-[#1d1d1f]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#1d1d1f]">{name}</h3>
              <div className="flex items-center gap-1 text-sm text-[#6e6e73]">
                <FaMapMarkerAlt className="w-3 h-3" />
                <span>Primary Address</span>
              </div>
            </div>
          </div>
          {Select && (
            <button
              onClick={() => {
                setAddress(id);
                navigate("/Payment");
              }}
              className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] rounded-full text-white text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <MdCheckCircle className="w-4 h-4" />
              Select
            </button>
          )}
        </div>

        {/* Phone Number */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#f5f5f7] rounded-lg">
          <MdPhone className="w-4 h-4 text-[#f97316]" />
          <span className="text-sm font-medium text-[#1d1d1f]">{phone_number}</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 px-3 py-3 bg-[#f5f5f7] rounded-lg">
          <MdLocationOn className="w-5 h-5 text-[#f97316] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#6e6e73] leading-relaxed">
            {address}, {city}, {state}, {country}
          </p>
        </div>
      </div>
    </div>
  );
};

export default withCartContext(Card);
