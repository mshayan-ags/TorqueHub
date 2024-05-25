import React, { useEffect } from 'react';
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const TermsOfUse = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // This makes the scrolling smooth
    });
  }, [])
  return (
    <div className="relative min-h-screen bg-white">

      <Header />
      <div className="relative z-10 max-w-3xl mx-auto text-[#1d1d1f] text-[15px] leading-relaxed p-8 md:p-12 my-8">
        <h1 className="text-4xl font-semibold mb-6 tracking-tight">Terms of Use</h1>
        <p className="mb-4 text-[#6e6e73]">Updated January 2025</p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Introduction</h2>
        <p className="mb-4">
          Welcome to <strong>torquehub.com</strong>. By accessing or using our Site, you agree to comply with the following Terms of Use.
          Please read these carefully. If you do not agree, please discontinue use of the Site.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Use of the Site</h2>
        <p className="mb-4">
          torquehub.com is operated by <strong>TorqueHub Inc.</strong> to provide a convenient online shopping experience.
          All transactions are subject to the terms outlined below.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Order Fulfillment and Shipping</h2>
        <p className="mb-4">
          - Orders are processed by TorqueHub Inc. and sourced from trusted suppliers.
          <br />- Shipping times vary based on availability and location.
          <br />- All applicable shipping and handling charges will be shown during checkout.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Payment Processing</h2>
        <p className="mb-4">
          - Payments are securely processed through <strong>Stripe</strong>.
          <br />- TorqueHub Inc. does not store or retain payment details.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Refunds and Returns</h2>
        <p className="mb-4">
          - All sales are final once an order is processed.
          <br />- If you receive a defective or damaged product, contact us at support@torquehub.com.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Limitation of Liability</h2>
        <p className="mb-4">
          The Site and all content and products are provided "as is" without warranties. TorqueHub Inc. is not liable for
          product defects, shipping delays, or third-party supplier issues.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Dispute Resolution</h2>
        <p className="mb-4">
          Any disputes will be resolved through binding arbitration in Chicago, Illinois, under the American Arbitration Association.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Changes to Terms</h2>
        <p className="mb-4">
          TorqueHub Inc. reserves the right to modify these Terms at any time. Updates will be posted on this page.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at <strong>support@torquehub.com</strong>.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfUse;

