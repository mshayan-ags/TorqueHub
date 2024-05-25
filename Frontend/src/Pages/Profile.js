import React, { useEffect } from "react";
import Header from "../Components/Header";
import BreadsCrumbs from "../Components/BreadCrumbs";
import Navigation from "../Components/Navigation";
import Footer from "../Components/Footer";
import Table from "../Components/Table";
import { withProductContext } from "../context/Product";
import { withAuthContext } from "../context/Auth";
import { withCartContext } from "../context/Cart";
import { withWishlistContext } from "../context/Wishlist";
import { useNavigate } from "react-router-dom";
import { MdOutlineMail } from "react-icons/md";
import { FaHouseUser } from "react-icons/fa";
import { FaUserCog } from "react-icons/fa";
import { FaPhoneAlt, FaShoppingCart, FaHeart, FaStar } from "react-icons/fa";
import { MdShoppingBag } from "react-icons/md";

function Profile({ currUser, GetCurrentUser, GetAllAddress, AllAddress, AllOrders, Cart, Wishlist }) {
  const navigate = useNavigate()
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    GetCurrentUser()
    GetAllAddress()
  }, [])
  
  return (
    <React.Fragment>
      <Header />
      
      {/* Main Content */}
      <main className="relative flex items-center justify-center mt-10 mb-24 overflow-x-hidden bg-white">
        <div className="w-[90%] max-w-7xl mx-auto px-6 relative z-10">
          <BreadsCrumbs />

          <section className="flex md:flex-row flex-col gap-10 justify-between mt-[20px]">
            <Navigation active={"Dashboard"} />

            <section className="md:w-[78%] w-[100%]">
              {/* Hero Section - Welcome Card */}
              <main className="w-full flex md:flex-row gap-8 flex-col mb-[20px] justify-between">
                {/* Welcome Card */}
                <div className="w-full md:w-[55%] rounded-2xl p-10 flex flex-col items-center justify-center bg-[#f5f5f7] border border-[#d2d2d7]">
                  <div className="inline-block bg-white text-[#1d1d1f] px-5 py-2 rounded-full text-xs font-medium mb-4 border border-[#d2d2d7]">
                    PREMIUM MEMBER
                  </div>

                  <h1 className="font-semibold text-3xl md:text-4xl tracking-tight text-[#1d1d1f] mb-3 text-center">
                    Welcome back, {currUser?.name}!
                  </h1>

                  <p className="text-base text-[#6e6e73] mb-6 text-center">
                    We're glad to see you again.
                  </p>

                  <div className="flex flex-wrap gap-8 justify-center">
                    <div className="flex items-center gap-2 text-[#1d1d1f] text-sm bg-white px-4 py-2 rounded-full border border-[#d2d2d7]">
                      <MdOutlineMail className="w-4 h-4 text-[#6e6e73]" />
                      <span className="font-medium">{currUser?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Address Card */}
                <div className="w-full md:w-[43%] bg-white rounded-2xl p-8 border border-[#d2d2d7]">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <FaHouseUser className="w-5 h-5 text-[#1d1d1f]" />
                    <h2 className="text-xl font-semibold text-[#1d1d1f]">
                      Billing Address
                    </h2>
                  </div>

                  {/* Address Details */}
                  {AllAddress?.[0] ? (
                    <div className="space-y-5">
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <FaUserCog className="w-4 h-4 text-[#6e6e73]" />
                        <span className="font-medium text-base text-[#1d1d1f]">{AllAddress?.[0]?.full_name}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <FaHouseUser className="w-4 h-4 text-[#6e6e73] mt-1" />
                        <span className="font-normal text-sm text-[#6e6e73] leading-relaxed">
                          {AllAddress?.[0]?.address_line1} {AllAddress?.[0]?.address_line2}
                        </span>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-3">
                        <FaPhoneAlt className="w-4 h-4 text-[#6e6e73]" />
                        <span className="font-medium text-base text-[#1d1d1f]">{AllAddress?.[0]?.phone_number}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                      <p className="text-sm text-[#6e6e73] mb-4">No billing address on file yet.</p>
                      <button
                        onClick={() => navigate("/AccountSetting")}
                        className="px-5 py-2.5 rounded-full text-sm font-medium text-white bg-[#f97316] hover:bg-[#ea580c] transition-colors duration-200"
                      >
                        Add an Address
                      </button>
                    </div>
                  )}
                </div>
              </main>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]">
                  <MdShoppingBag className="w-6 h-6 text-[#1d1d1f] mb-4" />
                  <div className="text-3xl font-semibold text-[#1d1d1f] mb-1">
                    {AllOrders?.length || 0}
                  </div>
                  <div className="text-sm text-[#6e6e73] font-medium">Total Orders</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]">
                  <FaShoppingCart className="w-6 h-6 text-[#1d1d1f] mb-4" />
                  <div className="text-3xl font-semibold text-[#1d1d1f] mb-1">
                    {Cart?.length || 0}
                  </div>
                  <div className="text-sm text-[#6e6e73] font-medium">In Cart</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]">
                  <FaHeart className="w-6 h-6 text-[#1d1d1f] mb-4" />
                  <div className="text-3xl font-semibold text-[#1d1d1f] mb-1">
                    {Wishlist?.length || 0}
                  </div>
                  <div className="text-sm text-[#6e6e73] font-medium">Wishlist</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]">
                  <FaStar className="w-6 h-6 text-[#1d1d1f] mb-4" />
                  <div className="text-3xl font-semibold text-[#1d1d1f] mb-1">
                    {AllAddress?.length || 0}
                  </div>
                  <div className="text-sm text-[#6e6e73] font-medium">Addresses</div>
                </div>
              </div>

              {/* Orders Table Section */}
              <div className="relative">
                <Table />
              </div>
            </section>
          </section>
        </div>
      </main>

      <Footer />
    </React.Fragment>
  );
}
export default withAuthContext(withProductContext(withCartContext(withWishlistContext(Profile))));
