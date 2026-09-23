import {
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../api";


const ResetPassword = () => {

  const navigate =
    useNavigate();


  const [
    searchParams,
  ] = useSearchParams();


  const email =
    searchParams.get(
      "email"
    );


  const [
    otp,
    setOtp,
  ] = useState("");


  const [
    newPassword,
    setNewPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    otpVerified,
    setOtpVerified,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  // =================================
  // VERIFY OTP
  // =================================

  const verifyOtp =
    async (e) => {

      e.preventDefault();

      setError("");

      setLoading(true);


      try {

        const response =
          await api.post(
            "/auth/verify-reset-otp",
            {
              email,
              otp,
            }
          );


        setOtpVerified(
          true
        );


        setMessage(
          response.data.message
        );


      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
            "Invalid OTP"
        );

      } finally {

        setLoading(false);

      }

    };


  // =================================
  // RESET PASSWORD
  // =================================

  const resetPassword =
    async (e) => {

      e.preventDefault();

      setError("");

      setMessage("");


      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match"
        );

        return;

      }


      setLoading(true);


      try {

        const response =
          await api.post(
            "/auth/reset-password",
            {
              email,
              newPassword,
            }
          );


        setMessage(
          response.data.message
        );


        setTimeout(() => {

          navigate(
            "/login"
          );

        }, 1500);


      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
            "Failed to reset password"
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <div className="auth-container">

      <div className="auth-card">

        <h1>
          Reset Password
        </h1>


        <p>
          {email}
        </p>


        {error && (
          <p className="error">
            {error}
          </p>
        )}


        {message && (
          <p className="success">
            {message}
          </p>
        )}


        {!otpVerified ? (

          <form
            onSubmit={
              verifyOtp
            }
          >

            <input
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                )
              }
              placeholder="Enter OTP"
              maxLength={6}
              required
            />


            <button
              disabled={loading}
            >

              {loading
                ? "Verifying..."
                : "Verify OTP"}

            </button>

          </form>

        ) : (

          <form
            onSubmit={
              resetPassword
            }
          >

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              minLength={6}
              required
            />


            <input
              type="password"
              placeholder="Confirm password"
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              minLength={6}
              required
            />


            <button
              disabled={loading}
            >

              {loading
                ? "Resetting..."
                : "Reset Password"}

            </button>

          </form>

        )}

      </div>

    </div>

  );
};


export default ResetPassword;