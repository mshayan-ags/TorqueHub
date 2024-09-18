import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import { withAuthContext } from "../context/Auth";
import { BackendLink } from "../link";
import axios from "axios";
import { useEffect } from "react";
import BreadsCrumbs from "../Components/BreadCrumbs";
import { BiHide } from "react-icons/bi";
import { IoEye } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FaUser, FaMicrosoft } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../msalConfig";
import Img from "../assets/GarageIllustration.svg"
import Logo from "../assets/TorqueHubLogo.svg"

function EmailInput({ value, onChange }) {
  return (
    <div className="mt-5">
      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Email Address</label>
      <div className="rounded-xl flex gap-3 border border-[#d2d2d7] focus-within:border-[#f97316] transition-colors duration-200 items-center bg-white overflow-hidden">
        <div className="px-4 h-14 flex items-center justify-center">
          <MdEmail className="w-4 h-4 text-[#6e6e73]" />
        </div>
        <input value={value} onChange={(e) => onChange(e?.target?.value)} type="email" id="email" placeholder="you@example.com" className="flex-1 text-sm md:text-base outline-none text-[#1d1d1f] placeholder-[#86868b] pr-4" />
      </div>
    </div>
  );
}

function UsernameInput({ value, onChange }) {
  return (
    <div className="mt-5">
      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Full Name</label>
      <div className="rounded-xl flex gap-3 border border-[#d2d2d7] focus-within:border-[#f97316] transition-colors duration-200 items-center bg-white overflow-hidden">
        <div className="px-4 h-14 flex items-center justify-center">
          <FaUser className="w-4 h-4 text-[#6e6e73]" />
        </div>
        <input value={value} onChange={(e) => onChange(e?.target?.value)} type="text" id="username" placeholder="John Doe" className="flex-1 text-sm md:text-base outline-none text-[#1d1d1f] placeholder-[#86868b] pr-4" />
      </div>
    </div>
  );
}

function PasswordInput({ label, id, value, onChange }) {
  const [hide, setHide] = useState(true)
  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements
    };
  };
  return (
    <div className="mt-5">
      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">{label}</label>
      <div className={`rounded-xl flex gap-3 border transition-colors duration-200 items-center bg-white overflow-hidden ${validatePassword(value).isValid || !value ? "border-[#d2d2d7] focus-within:border-[#f97316]" : "border-red-300 focus-within:border-red-400"}`}>
        <div className="px-4 h-14 flex items-center justify-center">
          <RiLockPasswordFill className={`w-4 h-4 ${validatePassword(value).isValid || !value ? "text-[#6e6e73]" : "text-red-500"}`} />
        </div>
        <input value={value} onChange={(e) => onChange(e?.target?.value)} type={hide ? "password" : "text"} id={id} placeholder={`Enter ${label.toLowerCase()}`} className="flex-1 text-sm md:text-base outline-none text-[#1d1d1f] placeholder-[#86868b]" />
        <button type="button" onClick={() => setHide(!hide)} className="px-4 hover:bg-[#f5f5f7] transition-colors">
          {hide ? <BiHide className="w-5 h-5 text-[#6e6e73]" /> : <IoEye className="w-5 h-5 text-[#6e6e73]" />}
        </button>
      </div>
    </div>
  );
}

function SignUp({ setToken, Token, CheckToken }) {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accept: false
  })
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
          navigate("/Checkout");
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

  const handleSubmit = ({ email, password, confirmPassword, name }) => {
    if (email && password && confirmPassword && (password == confirmPassword)) {
      setLoading(true);
      axios
        .post(`${BackendLink}/SignUp`, {
          name,
          email,
          password,
          confirmPassword,
          accept: state?.accept
        })
        .then((res) => {
          setLoading(false);
          if (res?.data?.status == 200) {
            localStorage.setItem("token", res?.data?.token);
            setToken(res?.data?.token);
            navigate("/Checkout");
          }
          swal({
            text: res?.data?.message,
            button: {
              text: "Ok",
              closeModal: true
            },
            icon: res?.data?.status == 200 ? "success" : "error",
            time: 3000
          });
        })
        .catch((err) => {
          setLoading(false);
          swal({
            text: err?.response?.data?.message
              ? err?.response?.data?.message
              : "There was some Error",
            button: {
              text: "Ok",
              closeModal: true
            },
            icon: "error",
            time: 3000
          });
        });
    }
  };
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // This makes the scrolling smooth
    });
    CheckToken()
  }, [])

  useEffect(() => {
    if (Token && Token !== "") {
      swal({
        text: "You're already signed in. Please proceed to purchase.",
        button: {
          text: "Ok",
          closeModal: true
        },
        icon: "warning",
      }).then(() => {
        navigate("/")
      });
    }
  }, [Token])
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="flex min-h-screen relative z-10 gap-0">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#f5f5f7]">
          <img loading="lazy" src={Img} alt="" className="object-cover w-full h-full" />
          <div className="absolute top-10 left-10 z-20 bg-white rounded-xl px-3 py-2">
            <img loading="lazy" src={Logo} alt="TorqueHub" className="h-8 w-auto" />
          </div>
          <div className="absolute bottom-10 left-10 right-10 z-20 text-white p-8 bg-black/40 rounded-2xl">
            <h2 className="text-3xl font-semibold mb-2">Welcome to TorqueHub</h2>
            <p className="text-lg opacity-90">Join thousands of drivers finding the right parts to keep their vehicles running strong</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
          <div className="w-full max-w-md">
            <div className="bg-white border border-[#d2d2d7] rounded-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">Create Account</h1>
              <p className="text-[#6e6e73] text-sm md:text-base">
                Already have an account? <Link to="/SignIn" className="text-[#f97316] font-medium hover:underline transition-all">Sign in</Link>
              </p>
            </div>
            <EmailInput value={state?.email} onChange={(e) => {
              setState({ ...state, email: e })
            }} />
            <UsernameInput value={state?.name} onChange={(e) => {
              setState({ ...state, name: e })
            }} />
            <PasswordInput label="Password" id="password" value={state?.password} onChange={(e) => {
              setState({ ...state, password: e })
            }} />
            <PasswordInput label="Confirm Password" id="confirmPassword" value={state?.confirmPassword} onChange={(e) => {
              setState({ ...state, confirmPassword: e })
            }} />
            <div className="flex items-start gap-3 mt-6 mb-6">
              <input
                value={state?.accept}
                onChange={(e) => setState({ ...state, accept: !state?.accept })}
                type="checkbox"
                className="w-5 h-5 mt-0.5 rounded border border-[#d2d2d7] text-[#f97316] cursor-pointer"
              />
              <p className="text-xs md:text-sm text-[#6e6e73] leading-relaxed">
                I agree to the <a href="/TermsOfUse" target="_blank" className="text-[#f97316] font-medium hover:underline">Terms of Service</a> and <a href="/privacy-policy" target="_blank" className="text-[#f97316] font-medium hover:underline">Privacy Policy</a>
              </p>
            </div>
            <button
                className={`w-full py-3.5 text-base md:text-lg font-medium text-white rounded-full transition-colors duration-200 ${!state?.accept ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#f97316] hover:bg-[#ea580c]'}`}
                disabled={!state?.accept}
                onClick={() => {
                  if (!Loading) {
                    handleSubmit({
                      name: state?.name,
                      email: state?.email,
                      password: state?.password,
                      confirmPassword: state?.confirmPassword,
                      accept: state?.accept
                    });
                  } else {
                    swal({
                      text: "Please Let This Task Complete First",
                      button: {
                        text: "Ok",
                        closeModal: true
                      },
                      icon: "warning",
                      time: 3000
                    });
                  }
                }}
              >
                {Loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : "Create Account"}
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

export default withAuthContext(SignUp);