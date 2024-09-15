import axios from "axios";
import InputField from "components/fields/InputField";
import { withAuthContext } from "context/Auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "msalConfig";
import { FaMicrosoft } from "react-icons/fa";

function SignIn({ setToken }) {
  const navigate = useNavigate()
  const { instance } = useMsal();
  const [state, setState] = useState({
    email: "",
    password: ""
  })
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [pendingToken, setPendingToken] = useState("");
  const [otp, setOtp] = useState("");
  const [ssoLoading, setSsoLoading] = useState(false);

  const handleMicrosoftSignIn = () => {
    setSsoLoading(true);
    instance
      .loginPopup(loginRequest)
      .then((result) =>
        axios.post(`${process.env.REACT_APP_PUBLIC_PATH}/Login-Admin/SSO`, {
          idToken: result?.idToken,
        })
      )
      .then((res) => {
        setSsoLoading(false);
        if (res?.data?.status == 200 && res?.data?.token) {
          localStorage.setItem("token", res?.data?.token);
          setToken(res?.data?.token);
          navigate("/admin/default");
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

  function handleChange(name, value) {
    setState({ ...state, [name]: value })
  }

  const handleSubmit = () => {
    if (state?.email && state?.password) {
      axios
        .post(`${process.env.REACT_APP_PUBLIC_PATH}/Login-Admin`, state)
        .then((res) => {
          if (res?.data?.twoFactorRequired && res?.data?.pendingToken) {
            setPendingToken(res?.data?.pendingToken);
            setTwoFactorStep(true);
            swal({
              text: res?.data?.message || "Enter your 2FA code",
              button: {
                text: "Ok",
                closeModal: true,
              },
              icon: "info",
              time: 3000,
            });
            return;
          }
          if (res?.data?.status == 200) {
            localStorage.setItem("token", res?.data?.token);
            setToken(res?.data?.token);
            navigate("/admin/default");
          }
          swal({
            text: res?.data?.message,
            button: {
              text: "Ok",
              closeModal: true,
            },
            icon: res?.data?.status == 200 ? "success" : "error",
            time: 3000,
          });
        })
        .catch((err) => {
          swal({
            text: err?.response?.data?.message
              ? err?.response?.data?.message
              : "There was some Error",
            button: {
              text: "Ok",
              closeModal: true,
            },
            icon: "error",
            time: 3000,
          });
        });
    }
  };

  const handleVerify2FA = () => {
    if (!otp) {
      swal({
        text: "Enter the 6-digit code from your authenticator app",
        button: {
          text: "Ok",
          closeModal: true,
        },
        icon: "error",
        time: 3000,
      });
      return;
    }
    axios
      .post(`${process.env.REACT_APP_PUBLIC_PATH}/Login-Admin/Verify-2FA`, {
        pendingToken,
        otp,
      })
      .then((res) => {
        if (res?.data?.status == 200 && res?.data?.token) {
          localStorage.setItem("token", res?.data?.token);
          setToken(res?.data?.token);
          navigate("/admin/default");
        }
        swal({
          text: res?.data?.message,
          button: {
            text: "Ok",
            closeModal: true,
          },
          icon: res?.data?.status == 200 ? "success" : "error",
          time: 3000,
        });
      })
      .catch((err) => {
        swal({
          text: err?.response?.data?.message
            ? err?.response?.data?.message
            : "There was some Error",
          button: {
            text: "Ok",
            closeModal: true,
          },
          icon: "error",
          time: 3000,
        });
      });
  };

  if (twoFactorStep) {
    return (
      <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
        <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
          <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
            Two-Factor Authentication
          </h4>
          <p className="mb-9 ml-1 text-base text-gray-600">
            Enter the 6-digit code from your authenticator app.
          </p>
          <InputField
            variant="auth"
            extra="mb-3"
            label="Code*"
            placeholder="123456"
            id="otp"
            type="text"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={() => handleVerify2FA()}
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Verify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      {/* Sign in section */}
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Sign In
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your email and password to sign in!
        </p>
        {/* Email */}
        <InputField
          variant="auth"
          extra="mb-3"
          label="Email*"
          placeholder="mail@simmmple.com"
          id="email"
          type="text"
          name="email"
          value={state?.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        {/* Password */}
        <InputField
          variant="auth"
          extra="mb-3"
          label="Password*"
          placeholder="Min. 8 characters"
          id="password"
          type="password"
          name="password"
          value={state?.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />
        <button onClick={() => handleSubmit()} className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
          Sign In
        </button>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-navy-700" />
          <p className="text-sm text-gray-500">or</p>
          <div className="h-px flex-1 bg-gray-200 dark:bg-navy-700" />
        </div>

        <button
          onClick={() => !ssoLoading && handleMicrosoftSignIn()}
          disabled={ssoLoading}
          className="linear mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-[12px] text-base font-medium text-navy-700 transition duration-200 hover:bg-gray-100 disabled:opacity-60 dark:border-navy-600 dark:text-white dark:hover:bg-navy-700"
        >
          <FaMicrosoft />
          {ssoLoading ? "Signing in..." : "Sign in with Microsoft"}
        </button>
      </div>
    </div>
  );
}

export default withAuthContext(SignIn)
