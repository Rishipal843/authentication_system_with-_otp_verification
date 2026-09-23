import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Register
  from "./pages/Register";

import Login
  from "./pages/Login";

import VerifyEmail
  from "./pages/VerifyEmail";

import ForgotPassword
  from "./pages/ForgotPassword";

import ResetPassword
  from "./pages/ResetPassword";

import Dashboard
  from "./pages/Dashboard";

import ProtectedRoute
  from "./components/ProtectedRoute";


const App = () => {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <Login />
          }
        />


        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/register"
          element={
            <Register />
          }
        />


        <Route
          path="/verify-email"
          element={
            <VerifyEmail />
          }
        />


        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />


        <Route
          path="/reset-password"
          element={
            <ResetPassword />
          }
        />


        <Route
          path="/dashboard"
          element={

            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>

          }
        />

      </Routes>

    </BrowserRouter>

  );
};


export default App;