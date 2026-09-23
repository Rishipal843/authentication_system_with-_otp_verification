import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api";


const AuthContext =
  createContext();


export const AuthProvider = ({
  children,
}) => {

  const [
    user,
    setUser,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const getMe = async () => {

    try {

      const response =
        await api.get(
          "/auth/me"
        );

      setUser(
        response.data.user
      );

    } catch {

      setUser(null);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    getMe();

  }, []);


  const logout = async () => {

    try {

      await api.post(
        "/auth/logout"
      );

    } finally {

      setUser(null);

    }
  };


  return (

    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        getMe,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
};


export const useAuth = () =>
  useContext(AuthContext);