import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaCarSide, FaCogs, FaWrench, FaTools, FaShieldAlt, FaOilCan } from "react-icons/fa";

const partners = [
    { name: "AutoTech", icon: FaCarSide },
    { name: "GearWorks", icon: FaCogs },
    { name: "TorqueTools", icon: FaWrench },
    { name: "PartsPro", icon: FaTools },
    { name: "TrustAuto", icon: FaShieldAlt },
    { name: "LubeMasters", icon: FaOilCan },
];

const settings = {
    dots: false,
    infinite: true,
    speed: 4000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 4 } },
        { breakpoint: 768, settings: { slidesToShow: 3 } },
        { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
};

function Partners() {
    return (
        <div className="w-full">
            <Slider {...settings}>
                {partners.map((p, i) => {
                    const Icon = p.icon;
                    return (
                        <div key={i} className="px-4">
                            <div className="flex flex-col items-center justify-center gap-3 bg-white border border-[#d2d2d7] hover:border-[#f97316] rounded-2xl py-8 transition-colors duration-200">
                                <Icon className="w-8 h-8 text-[#f97316]" />
                                <p className="text-[#1d1d1f] font-medium text-sm">{p.name}</p>
                            </div>
                        </div>
                    );
                })}
            </Slider>
        </div>
    );
}

export default Partners;
