import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../api";
import "./VerifyEmail.css"

import {
  useAuth,
} from "../context/AuthContext";



const VerifyEmail = () => {

  const navigate =
    useNavigate();


  const [
    searchParams,
  ] = useSearchParams();


  const email =
    searchParams.get(
      "email"
    );


  const {
    setUser,
  } = useAuth();


  const [
    otp,
    setOtp,
  ] = useState("");


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


  const [
    resending,
    setResending,
  ] = useState(false);


  const [
    cooldown,
    setCooldown,
  ] = useState(60);


  // =================================
  // COUNTDOWN
  // =================================

  useEffect(() => {

    if (cooldown <= 0) {
      return;
    }


    const timer =
      setInterval(() => {

        setCooldown(
          (prev) =>
            prev - 1
        );

      }, 1000);


    return () =>
      clearInterval(
        timer
      );

  }, [cooldown]);


  // =================================
  // VERIFY
  // =================================

  const handleVerify =
    async (e) => {

      e.preventDefault();

      setError("");

      setMessage("");

      setLoading(true);


      try {

        const response =
          await api.post(
            "/auth/verify-email",
            {
              email,
              otp,
            }
          );


        setUser(
          response.data.user
        );


        navigate(
          "/dashboard"
        );

      } catch (error) {

        setError(
          error.response
            ?.data?.message ||
            "Invalid OTP"
        );

      } finally {

        setLoading(false);

      }
    };


  // =================================
  // RESEND
  // =================================

  const handleResend =
    async () => {

      if (
        cooldown > 0
      ) {
        return;
      }


      setError("");

      setMessage("");

      setResending(true);


      try {

        const response =
          await api.post(
            "/auth/resend-otp",
            {
              email,
            }
          );


        setMessage(
          response.data.message
        );


        setCooldown(
          60
        );

      } catch (error) {

        setError(
          error.response
            ?.data?.message ||
            "Failed to resend OTP"
        );

      } finally {

        setResending(false);

      }
    };


  return (

    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={
          handleVerify
        }
      >

        <h1>
          Verify Email
        </h1>


        <p>
          We sent a 6-digit
          verification code to:
        </p>


        <strong>
          {email}
        </strong>


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


        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => {

            const value =
              e.target.value.replace(
                /\D/g,
                ""
              );

            setOtp(value);

          }}
        />


        <button
          type="submit"
          disabled={
            loading ||
            otp.length !== 6
          }
        >
          {loading
            ? "Verifying..."
            : "Verify Email"}
        </button>


        <button
          type="button"
          disabled={
            cooldown > 0 ||
            resending
          }
          onClick={
            handleResend
          }
        >
          {resending
            ? "Sending..."
            : cooldown > 0
            ? `Resend OTP in ${cooldown}s`
            : "Resend OTP"}
        </button>

      </form>

    </div>
  );
};


export default VerifyEmail;