import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { Signup } from "./pages/Signup";
import CustomersPage from "./pages/CustomersPage"
import DeliveredPage from "./pages/DeliveredPage"
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";


export default function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <LoadingSpinner />;
  
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element = { user ? <Dashboard /> : <Navigate to='/login' />}/>
          <Route path="/customers" element = { user ? <CustomersPage />  : <Navigate to='/login' />}/>
          <Route path="/delivery" element = { user ? <DeliveredPage />  : <Navigate to='/login' />}/>
          <Route path="/login" element = { !user ? <Login /> : <Navigate to = "/" /> }/>
          <Route path="/signup" element = { !user ? <Signup /> : <Navigate to = "/" /> }/>
        </Routes>
      </div>
    </div>
  );
}
