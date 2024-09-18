import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import { withAuthContext } from "../context/Auth";
import { BackendLink } from "../link";
import BreadsCrumbs from "../Components/BreadCrumbs";
import { BiHide } from "react-icons/bi";
import { IoEye } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaMicrosoft } from "react-icons/fa";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../msalConfig";
import Img from "../assets/GarageIllustration.svg";

function SignIn({ setToken, Token, CheckToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hide, setHide] = useState(true);
  const [Loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const handleMicrosoftSignIn = () => {
    setSsoLoading(true);
    instance
      .loginPopup(loginRequest)
      .then((result) => axios.post(`${BackendLink}/Login/SSO`, { idToken: result?.idToken }))
      .then((res) => {
        setSsoLoading(false);
        if (res?.data?.status == 200) {
          localStorage.setItem("token", res?.data?.token);
          setToken(res?.data?.token);
          const redirectTo = location?.state?.from?.pathname || "/";
          navigate(redirectTo, { replace: true });
        }
        swal({
          text: res?.data?.message,
          button: { text: "Ok", closeModal: true },
          icon: res?.data?.status == 200 ? "success" : "error",
          time: 3000,
        });
      })
      .catch((err) => {
        setSsoLoading(false);
        swal({
          text: err?.response?.data?.message || err?.message || "Microsoft sign-in failed",
          button: { text: "Ok", closeModal: true },
          icon: "error",
          time: 3000,
        });
      });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    CheckToken && CheckToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Token && Token !== "") {
      const redirectTo = location?.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Token]);

  const handleSubmit = () => {
    if (!email || !password) {
      swal({
        text: "Please enter both email and password",
        button: { text: "Ok", closeModal: true },
        icon: "warning",
      });
      return;
    }
    setLoading(true);
    axios
      .post(`${BackendLink}/Login`, { email, password })
      .then((res) => {
        setLoading(false);
        if (res?.data?.status == 200) {
          localStorage.setItem("token", res?.data?.token);
          setToken(res?.data?.token);
          const redirectTo = location?.state?.from?.pathname || "/";
          navigate(redirectTo, { replace: true });
        }
        swal({
          text: res?.data?.message,
          button: { text: "Ok", closeModal: true },
          icon: res?.data?.status == 200 ? "success" : "error",
          time: 3000,
        });
      })
      .catch((err) => {
        setLoading(false);
        swal({
          text: err?.response?.data?.message
            ? err?.response?.data?.message
            : "There was some Error",
          button: { text: "Ok", closeModal: true },
          icon: "error",
          time: 3000,
        });
      });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="flex min-h-screen relative z-10 gap-0">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#f5f5f7]">
          <img loading="lazy" src={Img} alt="" className="object-cover w-full h-full" />
          <div className="absolute bottom-10 left-10 right-10 z-20 text-white p-8 bg-black/40 rounded-2xl">
            <h2 className="text-3xl font-semibold mb-2">Welcome Back</h2>
            <p className="text-lg opacity-90">Sign in to continue shopping for parts and accessories for your vehicle</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <BreadsCrumbs />
            </div>
            <div className="bg-white border border-[#d2d2d7] rounded-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
                  Sign In
                </h1>
                <p className="text-[#6e6e73] text-sm md:text-base">
                  Don't have an account?{" "}
                  <Link to="/SignUp" className="text-[#f97316] font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Email Address</label>
                <div className="rounded-xl flex gap-3 border border-[#d2d2d7] focus-within:border-[#f97316] transition-colors duration-200 items-center bg-white overflow-hidden">
                  <div className="px-4 h-14 flex items-center justify-center">
                    <MdEmail className="w-4 h-4 text-[#6e6e73]" />
                  </div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e?.target?.value)}
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 text-sm md:text-base outline-none text-[#1d1d1f] placeholder-[#86868b] pr-4"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Password</label>
                <div className="rounded-xl flex gap-3 border border-[#d2d2d7] focus-within:border-[#f97316] transition-colors duration-200 items-center bg-white overflow-hidden">
                  <div className="px-4 h-14 flex items-center justify-center">
                    <RiLockPasswordFill className="w-4 h-4 text-[#6e6e73]" />
                  </div>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e?.target?.value)}
                    type={hide ? "password" : "text"}
                    placeholder="Enter your password"
                    className="flex-1 text-sm md:text-base outline-none text-[#1d1d1f] placeholder-[#86868b]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !Loading) handleSubmit();
                    }}
                  />
                  <button type="button" onClick={() => setHide(!hide)} className="px-4 hover:bg-[#f5f5f7] transition-colors">
                    {hide ? <BiHide className="w-5 h-5 text-[#6e6e73]" /> : <IoEye className="w-5 h-5 text-[#6e6e73]" />}
                  </button>
                </div>
              </div>

              <button
                className="w-full mt-8 py-3.5 text-base md:text-lg font-medium text-white rounded-full transition-colors duration-200 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-60"
                disabled={Loading}
                onClick={handleSubmit}
              >
                {Loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex items-center gap-3 mt-6">
                <div className="h-px flex-1 bg-[#d2d2d7]" />
                <p className="text-sm text-[#6e6e73]">or</p>
                <div className="h-px flex-1 bg-[#d2d2d7]" />
              </div>

              <button
                type="button"
                className="w-full mt-6 py-3.5 flex items-center justify-center gap-2 text-base md:text-lg font-medium text-[#1d1d1f] rounded-full border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors duration-200 disabled:opacity-60"
                disabled={ssoLoading}
                onClick={handleMicrosoftSignIn}
              >
                <FaMicrosoft />
                {ssoLoading ? "Signing in..." : "Continue with Microsoft"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthContext(SignIn);
