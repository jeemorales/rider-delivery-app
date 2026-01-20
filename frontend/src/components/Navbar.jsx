import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import {
  Home,
  Users,
  Truck,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ================= TOP NAVBAR (DESKTOP) ================= */}
      <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md shadow-sm border-b hidden md:block">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="navbar py-2">

            {/* Logo */}
            <div className="flex-1">
              <span className="text-xl font-bold tracking-wide text-primary">
                Rider Delivery App
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="flex gap-4 font-medium">
              {user ? (
                <>
                  <Link className="btn btn-ghost btn-sm" to="/">Dashboard</Link>
                  <Link className="btn btn-ghost btn-sm" to="/customers">Customers</Link>
                  <Link className="btn btn-ghost btn-sm" to="/delivery">Delivery</Link>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-ghost btn-sm" to="/login">Login</Link>
                  <Link className="btn btn-ghost btn-sm" to="/signup">Signup</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE TOP BAR ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-base-100/80 backdrop-blur-md border-b">
        <div className="px-4 py-2 flex justify-between items-center">
          <span className="font-semibold text-primary">
            Rider Delivery App
          </span>

          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* ================= MOBILE DROPDOWN MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-14 right-4 w-48 bg-base-100 rounded-lg shadow-lg p-2">
            <button className="w-full text-left px-3 py-2" onClick={() => handleNavigate("/")}>
              Dashboard
            </button>
            <button className="w-full text-left px-3 py-2" onClick={() => handleNavigate("/customers")}>
              Customers
            </button>
            <button className="w-full text-left px-3 py-2" onClick={() => handleNavigate("/delivery")}>
              Delivery
            </button>
            <button className="w-full text-left px-3 py-2 text-error" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-md border-t">
          <div className="flex justify-around items-center h-14">
            <button
              onClick={() => navigate("/")}
              className={`flex flex-col items-center text-xs ${
                isActive("/") ? "text-primary" : "text-base-content/60"
              }`}
            >
              <Home size={20} />
              Home
            </button>

            <button
              onClick={() => navigate("/customers")}
              className={`flex flex-col items-center text-xs ${
                isActive("/customers") ? "text-primary" : "text-base-content/60"
              }`}
            >
              <Users size={20} />
              Customers
            </button>

            <button
              onClick={() => navigate("/delivery")}
              className={`flex flex-col items-center text-xs ${
                isActive("/delivery") ? "text-primary" : "text-base-content/60"
              }`}
            >
              <Truck size={20} />
              Delivery
            </button>

            {/* <button
              onClick={handleLogout}
              className="flex flex-col items-center text-xs text-error"
            >
              <LogOut size={20} />
              Logout
            </button> */}
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
