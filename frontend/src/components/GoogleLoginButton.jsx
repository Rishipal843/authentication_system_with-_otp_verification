import {
  useEffect,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api";

import {
  useAuth,
} from "../context/AuthContext";


const GoogleLoginButton = () => {

  const googleButton =
    useRef(null);


  const navigate =
    useNavigate();


  const {
    setUser,
  } = useAuth();


  useEffect(() => {

    if (
      !window.google ||
      !googleButton.current
    ) {
      return;
    }


    window.google.accounts.id.initialize({

      client_id:
        import.meta.env
          .VITE_GOOGLE_CLIENT_ID,

      callback:
        async (response) => {

          try {

            const result =
              await api.post(
                "/auth/google",
                {
                  credential:
                    response.credential,
                }
              );


            setUser(
              result.data.user
            );


            navigate(
              "/dashboard"
            );

          } catch (error) {

            console.error(
              error
            );

            alert(
              error.response?.data
                ?.message ||
                "Google login failed"
            );

          }

        },

    });


    window.google.accounts.id.renderButton(

      googleButton.current,

      {
        theme: "outline",
        size: "large",
        width: 350,
      }

    );

  }, []);


  return (
    <div
      ref={googleButton}
    />
  );
};


export default GoogleLoginButton;