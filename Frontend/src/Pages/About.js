import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { FaCogs, FaHeart, FaShieldAlt, FaTruck, FaLeaf } from "react-icons/fa";

function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      <Header />

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <FaCogs className="text-5xl text-[#f97316] mb-6 inline-block" />
          <h1 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
            About TorqueHub
          </h1>
          <p className="text-xl text-[#6e6e73] max-w-3xl mx-auto leading-relaxed">
            Your trusted source for premium automotive parts and accessories.
            We believe every vehicle deserves quality parts, and we're here to make that happen.
          </p>
        </div>

        {/* Our Story Section */}
        <div className="mb-20 bg-white rounded-2xl p-12 border border-[#d2d2d7]">
          <h2 className="text-3xl font-semibold mb-6 text-[#1d1d1f] tracking-tight">
            Our Story
          </h2>
          <div className="text-[#6e6e73] space-y-4 text-lg leading-relaxed">
            <p>
              Founded with a passion for the open road, <strong className="text-[#1d1d1f]">TorqueHub</strong> began as a small initiative
              by automotive enthusiasts who noticed a gap in the market for truly premium, trustworthy auto parts. What started in a small
              garage with just a handful of products has grown into a comprehensive automotive parts destination trusted by thousands of
              drivers and mechanics across the country.
            </p>
            <p>
              We understand that your vehicle depends on quality components. That's why every product we offer is carefully curated and tested to ensure it
              meets the highest standards of quality, performance, and safety. From OEM-grade replacements to performance upgrades,
              we source only from trusted suppliers who share our commitment to automotive excellence.
            </p>
            <p>
              Today, we're proud to serve a vibrant community of drivers and mechanics who trust us to keep their vehicles running longer,
              safer, and stronger. Our journey continues with one simple mission: <em className="text-[#1d1d1f] font-medium">
              to keep every vehicle performing at its best, one part at a time.</em>
            </p>
          </div>
        </div>

        {/* Our Values Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold text-center mb-12 text-[#1d1d1f] tracking-tight">
            Why Choose TorqueHub?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Quality Card */}
            <div className="bg-white rounded-2xl p-8 border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
              <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-6">
                <FaShieldAlt className="text-2xl text-[#f97316]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1d1d1f]">Premium Quality</h3>
              <p className="text-[#6e6e73] leading-relaxed">
                Every product is rigorously tested and certified to ensure your vehicle gets only the best parts and performance.
              </p>
            </div>

            {/* Craftsmanship Card */}
            <div className="bg-white rounded-2xl p-8 border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
              <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-6">
                <FaHeart className="text-2xl text-[#f97316]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1d1d1f]">Built by Enthusiasts</h3>
              <p className="text-[#6e6e73] leading-relaxed">
                We're gearheads too! Our team hand-picks each product with the same care we'd use on our own vehicles.
              </p>
            </div>

            {/* Delivery Card */}
            <div className="bg-white rounded-2xl p-8 border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
              <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-6">
                <FaTruck className="text-2xl text-[#f97316]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1d1d1f]">Fast Delivery</h3>
              <p className="text-[#6e6e73] leading-relaxed">
                Lightning-fast shipping means your parts arrive quickly and ready to install. Schedule orders for ultimate convenience!
              </p>
            </div>

            {/* Sustainable Card */}
            <div className="bg-white rounded-2xl p-8 border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200">
              <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-6">
                <FaLeaf className="text-2xl text-[#f97316]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1d1d1f]">Sustainably Sourced</h3>
              <p className="text-[#6e6e73] leading-relaxed">
                We prioritize responsibly sourced and remanufactured materials that are safe, durable, and environmentally responsible.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-[#1d1d1f] rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto text-white/80">
            "To keep vehicles on the road longer by providing exceptional parts, expert guidance,
            and a community built on trust, quality, and craftsmanship. We're not just selling auto parts—we're powering
            the journeys of the drivers and mechanics who count on us."
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-semibold mb-6 text-[#1d1d1f]">
            Join the TorqueHub Family Today
          </h3>
          <p className="text-lg text-[#6e6e73] mb-8 max-w-2xl mx-auto">
            Experience the difference premium parts can make in your vehicle's performance.
            Thousands of happy drivers and mechanics already trust us—will you be next?
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full font-medium text-lg transition-colors duration-200">
            <span className="flex items-center gap-3">
              Start Shopping
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;
