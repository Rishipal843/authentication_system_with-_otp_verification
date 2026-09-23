import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api";


const ForgotPassword = () => {

  const navigate =
    useNavigate();


  const [
    email,
    setEmail,
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


  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      setMessage("");

      setLoading(true);


      try {

        const response =
          await api.post(
            "/auth/forgot-password",
            {
              email,
            }
          );


        setMessage(
          response.data.message
        );


        navigate(
          `/reset-password?email=${encodeURIComponent(
            email
          )}`
        );


      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
            "Something went wrong"
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <div className="auth-container">

      <div className="auth-card">

        <h1>
          Forgot Password
        </h1>

        <p>
          Enter your email address
          and we'll send you an OTP.
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


        <form
          onSubmit={
            handleSubmit
          }
        >

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            required
          />


          <button
            disabled={loading}
          >

            {loading
              ? "Sending..."
              : "Send OTP"}

          </button>

        </form>

      </div>

    </div>

  );
};


export default ForgotPassword;