import { useState } from "react";
import axios from "axios";
import swal from "sweetalert";
import Banner from "../../../components/banner";
import InputField from "components/fields/InputField";
import { withAuthContext } from "context/Auth";

const Settings = ({ Token, CheckToken, currAdmin, GetCurrentAdmin }) => {
  const [enrolling, setEnrolling] = useState(false);
  const [qr, setQr] = useState(null);
  const [otpauth, setOtpauth] = useState(null);
  const [otp, setOtp] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  const authHeader = () => ({
    headers: {
      Authorization: `${Token || localStorage.getItem("token")}`,
    },
  });

  const showResult = (res, onSuccess) => {
    swal({
      text: res?.data?.message,
      button: { text: "Ok", closeModal: true },
      icon: res?.data?.status == 200 ? "success" : "error",
      time: 3000,
    });
    if (res?.data?.status == 200 && onSuccess) onSuccess();
  };

  const showError = (err) => {
    swal({
      text: err?.response?.data?.message
        ? err?.response?.data?.message
        : "There was some Error",
      button: { text: "Ok", closeModal: true },
      icon: "error",
      time: 3000,
    });
  };

  const startEnroll = () => {
    if (!Token) {
      CheckToken();
      return;
    }
    axios
      .post(`${process.env.REACT_APP_PUBLIC_PATH}/2FA/Setup`, {}, authHeader())
      .then((res) => {
        if (res?.data?.status == 200) {
          setQr(res?.data?.data?.qr);
          setOtpauth(res?.data?.data?.otpauth);
          setEnrolling(true);
        } else {
          showResult(res);
        }
      })
      .catch(showError);
  };

  const verifyEnable = () => {
    if (!otp) {
      swal({
        text: "Enter the 6-digit code from your authenticator app",
        button: { text: "Ok", closeModal: true },
        icon: "error",
        time: 3000,
      });
      return;
    }
    axios
      .post(`${process.env.REACT_APP_PUBLIC_PATH}/2FA/Verify-Enable`, { otp }, authHeader())
      .then((res) =>
        showResult(res, () => {
          setEnrolling(false);
          setQr(null);
          setOtpauth(null);
          setOtp("");
          GetCurrentAdmin();
        })
      )
      .catch(showError);
  };

  const disable2FA = () => {
    if (!disablePassword) {
      swal({
        text: "Enter your password to disable 2FA",
        button: { text: "Ok", closeModal: true },
        icon: "error",
        time: 3000,
      });
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_PUBLIC_PATH}/2FA/Disable`,
        { password: disablePassword },
        authHeader()
      )
      .then((res) =>
        showResult(res, () => {
          setDisablePassword("");
          GetCurrentAdmin();
        })
      )
      .catch(showError);
  };

  return (
    <div className="mt-3 grid h-full grid-cols-1">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        <Banner
          Heading={" Settings"}
          SubHeading={" Manage your admin account security."}
        />
        <div class="grid grid-cols-1 gap-4 my-10 bg-white rounded-[50px] py-20 px-10">
          <h4 className="mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Two-Factor Authentication
          </h4>

          {currAdmin?.twoFactorEnabled ? (
            <>
              <p className="mb-3 text-base text-gray-600">
                Two-factor authentication is currently <b>enabled</b> on your account.
              </p>
              <InputField
                variant="auth"
                extra="mb-3 max-w-xs"
                label="Password*"
                id="disablePassword"
                type="password"
                name="disablePassword"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
              <button
                onClick={disable2FA}
                className="linear w-full max-w-xs rounded-xl bg-red-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700"
              >
                Disable 2FA
              </button>
            </>
          ) : enrolling ? (
            <>
              <p className="mb-3 text-base text-gray-600">
                Scan this QR code with an authenticator app (Google Authenticator, Authy,
                etc.), then enter the 6-digit code it shows you below.
              </p>
              {qr && (
                <img
                  src={qr}
                  alt="2FA enrollment QR code"
                  style={{ width: 200, height: 200 }}
                />
              )}
              {otpauth && (
                <p className="mt-2 break-all text-xs text-gray-500">{otpauth}</p>
              )}
              <InputField
                variant="auth"
                extra="mb-3 mt-3 max-w-xs"
                label="6-digit code*"
                id="otp"
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={verifyEnable}
                className="linear w-full max-w-xs rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Verify &amp; Enable
              </button>
            </>
          ) : (
            <>
              <p className="mb-3 text-base text-gray-600">
                Two-factor authentication is currently <b>disabled</b>. Enable it to
                require a one-time code at every login.
              </p>
              <button
                onClick={startEnroll}
                className="linear w-full max-w-xs rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Enable 2FA
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuthContext(Settings);
