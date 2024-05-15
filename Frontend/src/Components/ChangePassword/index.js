import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import { withAuthContext } from "../../context/Auth";
import { BackendLink } from "../../link";
import axios from "axios";
import BreadsCrumbs from "../BreadCrumbs";
import { BiHide } from "react-icons/bi";
import { IoEye } from "react-icons/io5";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function PasswordInput({ label, id, value, onChange, showValidation = false }) {
  const [hide, setHide] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  
  const validatePassword = (newPassword) => {
    const requirements = {
      minLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements
    };
  };

  const validation = validatePassword(value);
  const isValid = validation.isValid || value === "";

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[#1d1d1f] mb-2 ml-1">
        {label}
      </label>
      <div className={`group relative rounded-xl overflow-hidden border transition-colors duration-200 ${
        isFocused
          ? 'border-[#f97316]'
          : isValid ? 'border-[#d2d2d7]' : 'border-red-300'
      }`}>
        <div className="flex items-center bg-white">
          <div className="flex items-center justify-center w-14 h-14">
            <RiLockPasswordFill className={`w-5 h-5 ${isValid ? 'text-[#6e6e73]' : 'text-red-500'}`} />
          </div>

          <input
            value={value}
            onChange={(e) => onChange(e?.target?.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            type={hide ? "password" : "text"}
            id={id}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="flex-1 px-4 py-4 text-base outline-none bg-transparent placeholder-[#86868b]"
          />

          <button
            type="button"
            onClick={() => setHide(!hide)}
            className="px-4 py-4 text-[#6e6e73] hover:text-[#f97316] transition-colors duration-200"
          >
            {hide ? <BiHide className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Password Requirements */}
      {showValidation && value && (
        <div className="mt-3 ml-1 space-y-1">
          <RequirementItem 
            met={validation.requirements.minLength}
            text="At least 8 characters"
          />
          <RequirementItem 
            met={validation.requirements.hasUpperCase}
            text="One uppercase letter"
          />
          <RequirementItem 
            met={validation.requirements.hasLowerCase}
            text="One lowercase letter"
          />
          <RequirementItem 
            met={validation.requirements.hasNumber}
            text="One number"
          />
          <RequirementItem 
            met={validation.requirements.hasSpecialChar}
            text="One special character"
          />
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
      met ? 'text-[#1d1d1f]' : 'text-[#86868b]'
    }`}>
      {met ? (
        <FaCheckCircle className="w-3 h-3" />
      ) : (
        <FaTimesCircle className="w-3 h-3" />
      )}
      <span>{text}</span>
    </div>
  );
}

function ChangePassword({ currUser }) {
  const navigate = useNavigate();

  const [state, setState] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [Loading, setLoading] = useState(false);

  const handleSubmit = ({ password, newPassword, confirmPassword, name }) => {
    if (password && newPassword && confirmPassword && (newPassword == confirmPassword)) {
      setLoading(true);
      axios
        .post(`${BackendLink}/Change-Password`, {
          email: currUser?.email,
          password,
          newPassword,
          confirmPassword,
        })
        .then((res) => {
          setLoading(false);
          swal({
            text: res?.data?.message,
            button: {
              text: "Ok",
              closeModal: true
            },
            icon: res?.data?.status == 200 ? "success" : "error",
            time: 3000
          }).then(() => {
            // The backend doesn't issue a new token on password change, so
            // the existing session token is still valid — no need to touch
            // it. Just clear the form and send the user somewhere sensible.
            if (res?.data?.status == 200) {
              setState({ password: "", newPassword: "", confirmPassword: "" });
              navigate("/AccountSetting");
            }
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

  return (
    <div className="relative flex flex-col w-full bg-white border border-[#d2d2d7] ml-[5%] py-10 md:py-12 rounded-2xl px-8 md:px-12">
      <div className="flex flex-col text-black">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <RiLockPasswordFill className="w-6 h-6 text-[#1d1d1f]" />
            <div>
              <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
                Change Password
              </h1>
              <p className="text-sm text-[#6e6e73] mt-1">Secure your account with a new password</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <PasswordInput 
            label="Current Password" 
            id="password" 
            value={state?.password} 
            onChange={(e) => setState({ ...state, password: e })} 
          />
          
          <PasswordInput 
            label="New Password" 
            id="newPassword" 
            value={state?.newPassword} 
            onChange={(e) => setState({ ...state, newPassword: e })}
            showValidation={true}
          />
          
          <PasswordInput 
            label="Confirm New Password" 
            id="confirmPassword" 
            value={state?.confirmPassword} 
            onChange={(e) => setState({ ...state, confirmPassword: e })} 
          />

          {/* Password Match Indicator */}
          {state?.newPassword && state?.confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ml-1 ${
              state?.newPassword === state?.confirmPassword
                ? 'text-[#1d1d1f]'
                : 'text-red-500'
            }`}>
              {state?.newPassword === state?.confirmPassword ? (
                <>
                  <FaCheckCircle className="w-4 h-4" />
                  <span>Passwords match</span>
                </>
              ) : (
                <>
                  <FaTimesCircle className="w-4 h-4" />
                  <span>Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-full flex justify-center mt-10">
          <button
            className="w-full md:w-auto px-12 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium text-lg rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Loading || !state?.password || !state?.newPassword || !state?.confirmPassword || state?.newPassword !== state?.confirmPassword}
            onClick={() => {
              if (!Loading) {
                handleSubmit({
                  name: state?.name,
                  password: state?.password,
                  newPassword: state?.newPassword,
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
            <span className="flex items-center justify-center gap-3">
              {Loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <RiLockPasswordFill className="w-5 h-5" />
                  <span>Update Password</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Security Tip */}
        <div className="mt-8 p-4 bg-[#f5f5f7] rounded-2xl border border-[#d2d2d7]">
          <p className="text-sm text-[#6e6e73] text-center">
            <span className="font-medium text-[#1d1d1f]">Security Tip:</span> Use a strong password with a mix of letters, numbers, and symbols.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuthContext(ChangePassword);