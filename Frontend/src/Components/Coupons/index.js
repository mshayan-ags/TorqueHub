import moment from 'moment';
import React from 'react';
import { withCartContext } from '../../context/Cart';

const DiscountCoupon = ({ data, coupon_sale, setCoupon, noButton, getTotal, Coupon, GetAllCouponsUser }) => {
  if ((data?._id != Coupon)
    && (!coupon_sale || coupon_sale == "")
    && (data?.minimumPurchase < getTotal())
    && (new Date(data?.expirationDate) > new Date())
    && data?.isActive) return (
      <div data-aos="fade-left" data-aos-duration="3000" data-aos-delay="800" className="w-80 rounded-lg p-2 m-6 text-center bg-[#FFFFFF] shadow-lg flex flex-col justify-center align-center items-center border-[2px] border-dashed border-[#595959]">
        <h1 className="text-[12px] my-[2%] text-[#595959] font-bold">DISCOUNT COUPON</h1>
        <h2 className="text-[50px] text-[#042A53] font-bold">{data?.discountType == "Percentage" ? `${data?.discountValue}% OFF` : `-$${data?.discountValue} OFF`}</h2>
        <h1 className="text-xs text-[#FFFFFF] bg-[#000000] rounded-[25px] px-[5%] py-[2%] font-bold my-[2%]">{data?.code}</h1>
        <p className="text-[#DC143C] mt-1 text-xs font-bold">Valid Until: <span className='text-[#595959] font-bold text-[14px]'>{moment(data?.expirationDate)?.format("DD MMMM YYYY hh:mm")}</span></p>
        <p className="text-[#042A53] mt-2 text-xs">Minimum Spend ${data?.minimumPurchase}</p>
        {!noButton && <div className="mt-[10px] mb-[5px] px-[5%] py-[2%] bg-primary rounded-[5px] box-border flex flex-row items-center justify-center" onClick={() => {
          if (data?._id
            && (!coupon_sale || coupon_sale == "")
            && (data?.minimumPurchase < getTotal())
            && (new Date(data?.expirationDate) > new Date())
            && data?.isActive) {
            setCoupon(data?._id);
            localStorage.setItem("Coupon", data?._id);
            GetAllCouponsUser()
          }
        }}>
          <p className="text-[#FFFFFF] text-[12px] font-bold leading-[24px] font-actorPro  text-left" >
            Use Coupon
          </p>
        </div>}
      </div>
    );
}

export default withCartContext(DiscountCoupon);
