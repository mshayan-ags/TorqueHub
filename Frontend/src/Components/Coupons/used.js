import React, { useEffect, useState } from 'react';
import { withAuthContext } from '../../context/Auth';
import { withCartContext } from '../../context/Cart';
import { BackendLink } from '../../link';
import axios from 'axios';
import moment from 'moment';

const UsedDiscountCoupon = ({ Coupon, setCoupon, GetUsedCouponsUser, UsedCoupon }) => {

  useEffect(() => {
    GetUsedCouponsUser()
  }, [Coupon]);
  if (UsedCoupon?._id)
    return (
      <div data-aos="fade-left" data-aos-duration="3000" data-aos-delay="1000" className="w-80 border-2 border-dashed border-black rounded-lg p-2 my-1 text-center bg-white shadow-lg">
        <h2 className="text-xl text-[#002A48] font-bold">{UsedCoupon?.discountType == "Percentage" ? `${UsedCoupon?.discountValue}% OFF` : `-$${UsedCoupon?.discountValue} OFF`}</h2>
        <p className="text-[#002A48] text-xs">Minimum Spend ${UsedCoupon?.minimumPurchase}</p>
        <p className="text-gray-600 text-xs">Valid Until {moment(UsedCoupon?.expirationDate)?.format("DD,MMMM,YYYY hh:mm")}</p>
        <div className="mt-[10px] mb-[5px] bg-[#002A48] h-[35px] w-[100%] rounded-[25px] box-border flex flex-row items-center justify-center pt-3.5 pb-2.5 pr-6 pl-5 gap-[0px_10px] min-w-[114px] border-[2px] border-solid border-[#9a3412ff]">
          <div className="text-white text-[16px] font-bold leading-[24px] font-actorPro  text-left" onClick={() => {
            setCoupon("");
            localStorage.removeItem("Coupon");
            window.location.reload();
          }}>
            Remove Coupon
          </div>
        </div>
      </div>
    );
  else {
    return <p>There is Some Error in Coupon</p>
  }
}

export default withAuthContext(withCartContext(UsedDiscountCoupon));
