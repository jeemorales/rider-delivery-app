import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on window resize
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

  return (
    <header className="sticky top-0 z-50 bg-base-100 shadow-md border-b backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="navbar py-2 relative">

          {/* Logo */}
          <div className="flex-1">
            <span className="text-xl font-bold tracking-wide text-primary">
              Rider Delivery App
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-4 font-medium">
            {user ? (
              <>
                <Link className="btn btn-ghost btn-sm" to="/">Dashboard</Link>
                <Link className="btn btn-ghost btn-sm" to="/customers">Customers</Link>
                <Link className="btn btn-ghost btn-sm" to="/delivery">Delivery</Link>
                <button className="btn btn-ghost btn-sm text-error" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost btn-sm text-secondary" to="/login">Login</Link>
                <Link className="btn btn-ghost btn-sm text-primary" to="/signup">Signup</Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden relative">
            {/* Burger Icon */}
            <button
              className="btn btn-square btn-ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Animated Dropdown Menu */}
            <div
              className={`absolute top-full right-0 w-52 bg-base-100 border rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out origin-top-left
                ${mobileMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}
            >
              {user ? (
                <>
                  <button
                    className="block w-full text-left px-4 py-1 hover:bg-base-200 rounded-t-lg"
                    onClick={() => handleNavigate("/")}
                  >
                    Dashboard
                  </button>
                  <button
                    className="block w-full text-left px-4 py-1 hover:bg-base-200"
                    onClick={() => handleNavigate("/customers")}
                  >
                    Customers
                  </button>
                  <button
                    className="block w-full text-left px-4 py-1 hover:bg-base-200"
                    onClick={() => handleNavigate("/delivery")}
                  >
                    Delivery
                  </button>
                  <button
                    className="block w-full text-left px-4 py-1 text-error hover:bg-base-200 rounded-b-lg"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-base-200 rounded-t-lg"
                    onClick={() => handleNavigate("/login")}
                  >
                    Login
                  </button>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-base-200 rounded-b-lg"
                    onClick={() => handleNavigate("/signup")}
                  >
                    Signup
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
