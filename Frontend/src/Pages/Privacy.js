import React, { useEffect } from 'react';
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative min-h-screen bg-white">

      <Header />
      <div className="relative z-10 max-w-3xl mx-auto text-[#1d1d1f] text-[15px] leading-relaxed p-8 md:p-12 my-8">
        <h1 className="text-4xl font-semibold mb-6 tracking-tight">Privacy Policy</h1>
        <p className="mb-4 text-[#6e6e73]">Last Updated: March 2025</p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Introduction</h2>
        <p className="mb-4">
          TorqueHub Inc. ("we," "us," or "our") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and protect your personal
          information when you visit <a href="https://www.torquehub.com" className="text-[#f97316] underline">www.torquehub.com</a> (the "Site").
          By using our services, you agree to the terms outlined in this policy.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Information We Collect</h2>
        <p className="mb-4">We collect the following types of information:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Personal Information:</strong> Name, email, shipping address, phone number, and payment details.</li>
          <li><strong>Google OAuth Data:</strong> If you sign in with Google, we collect your Google profile name, email, and unique ID for authentication purposes.</li>
          <li><strong>Device & Usage Data:</strong> Browser type, IP address, and interactions with our Site (collected via cookies and analytics tools).</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4 mt-8">How We Use Your Information</h2>
        <p className="mb-4">We use your information for the following purposes:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Authentication:</strong> To verify your identity using Google OAuth.</li>
          <li><strong>Order Processing:</strong> To process transactions, deliver products, and provide customer support.</li>
          <li><strong>Marketing Communications:</strong> To send promotional offers if you opt-in (you may unsubscribe anytime).</li>
          <li><strong>Analytics & Website Optimization:</strong> To track Site performance and improve user experience.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4 mt-8">Third-Party Services</h2>
        <p className="mb-4">We use third-party services to process payments, authenticate users, and analyze website traffic:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Google Authentication:</strong> Your Google profile information is used strictly for authentication.</li>
          <li><strong>Stripe Payments:</strong> Payments are securely processed via Stripe. We do not store your payment details.</li>
          <li><strong>Google Analytics:</strong> We use Google Analytics to track website activity (<a href="https://tools.google.com/dlpage/gaoptout" className="text-[#f97316] underline">opt-out here</a>).</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4 mt-8">Google OAuth & User Control</h2>
        <p className="mb-4">You can manage and revoke Google OAuth access anytime via <a href="https://myaccount.google.com/permissions" className="text-[#f97316] underline">Google Account Permissions</a>.</p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Data Storage & Security</h2>
        <p className="mb-4">
          - Google OAuth data is never stored on our servers.
          - Personal data is securely stored using encryption and access controls.
          - We retain data only as long as necessary for order processing and legal compliance.
        </p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Your Privacy Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Request access to your personal data.</li>
          <li>Request corrections or deletion of your information.</li>
          <li>Opt-out of marketing emails.</li>
          <li>Delete your account & data by contacting <a href="mailto:support@torquehub.com" className="text-[#f97316] underline">support@torquehub.com</a>.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4 mt-8">Changes to This Privacy Policy</h2>
        <p className="mb-4">We may update this Privacy Policy periodically. Any changes will be posted on this page.</p>

        <h2 className="text-xl font-semibold mb-4 mt-8">Contact Us</h2>
        <p className="mb-4">
          If you have any questions, contact us at <a href="mailto:support@torquehub.com" className="text-[#f97316] underline">support@torquehub.com</a>.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
