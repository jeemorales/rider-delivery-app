import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import {
  Home,
  UserPlus,
  History,
  LogOut,
  PackageCheck,
  Menu,
  X,
  LogIn
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
      <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-200/80 shadow-xs hidden md:block transition-all">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="navbar py-2.5 flex justify-between items-center">

            {/* Logo */}
            <div className="flex-1 flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold shadow-2xs">
                <PackageCheck size={20} />
              </div>
              <span className="text-lg font-black tracking-tight text-base-content">
                Angelyn's <span className="text-primary font-bold">Ukay Delivery</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="flex items-center gap-1.5 font-medium">
              {user ? (
                <>
                  <Link 
                    to="/" 
                    className={`btn btn-sm rounded-xl px-4 gap-2 normal-case font-semibold transition-all ${
                      isActive("/") 
                        ? "btn-primary text-white shadow-md shadow-primary/20" 
                        : "btn-ghost text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <Home size={16} />
                    Dashboard
                  </Link>

                  <Link 
                    to="/customers" 
                    className={`btn btn-sm rounded-xl px-4 gap-2 normal-case font-semibold transition-all ${
                      isActive("/customers") 
                        ? "btn-primary text-white shadow-md shadow-primary/20" 
                        : "btn-ghost text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <UserPlus size={16} />
                    Customers
                  </Link>

                  <Link 
                    to="/delivery" 
                    className={`btn btn-sm rounded-xl px-4 gap-2 normal-case font-semibold transition-all ${
                      isActive("/delivery") 
                        ? "btn-primary text-white shadow-md shadow-primary/20" 
                        : "btn-ghost text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <History size={16} />
                    History
                  </Link>

                  <button
                    className="btn btn-ghost btn-sm text-error/90 hover:bg-error/10 hover:text-error rounded-xl gap-2 normal-case font-semibold ml-2 transition-all"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`btn btn-sm rounded-xl px-4 gap-2 normal-case font-semibold transition-all ${
                      isActive("/login") 
                        ? "btn-primary text-white shadow-md shadow-primary/20" 
                        : "btn-ghost text-base-content/70"
                    }`}
                  >
                    <LogIn size={16} />
                    Login
                  </Link>

                  <Link 
                    to="/signup" 
                    className={`btn btn-sm rounded-xl px-4 gap-2 normal-case font-semibold transition-all ${
                      isActive("/signup") 
                        ? "btn-primary text-white shadow-md shadow-primary/20" 
                        : "btn-outline border-base-300"
                    }`}
                  >
                    <UserPlus size={16} />
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE TOP BAR ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-200">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
              <PackageCheck size={18} />
            </div>
            <span className="font-black text-sm tracking-tight text-base-content">
              Angelyn's Ukay<span className="text-primary"> Delivery App</span>
            </span>
          </div>

          <button
            className="btn btn-sm btn-circle btn-ghost text-base-content/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ================= MOBILE DROPDOWN MENU ================= */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity duration-200" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-16 right-4 w-52 bg-base-100/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-base-200 space-y-1 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {user ? (
              <>
                <button 
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                    isActive("/") ? "bg-primary/10 text-primary" : "text-base-content/80 hover:bg-base-200"
                  }`} 
                  onClick={() => handleNavigate("/")}
                >
                  <Home size={16} /> Dashboard
                </button>
                <button 
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                    isActive("/customers") ? "bg-primary/10 text-primary" : "text-base-content/80 hover:bg-base-200"
                  }`} 
                  onClick={() => handleNavigate("/customers")}
                >
                  <UserPlus size={16} /> Customers
                </button>
                <button 
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                    isActive("/delivery") ? "bg-primary/10 text-primary" : "text-base-content/80 hover:bg-base-200"
                  }`} 
                  onClick={() => handleNavigate("/delivery")}
                >
                  <History size={16} /> History
                </button>
                <div className="divider my-1 opacity-50"></div>
                <button 
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors" 
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-base-200 text-base-content/80" 
                  onClick={() => handleNavigate("/login")}
                >
                  <LogIn size={16} className="text-primary" /> Login
                </button>
                <button 
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-base-200 text-base-content/80" 
                  onClick={() => handleNavigate("/signup")}
                >
                  <UserPlus size={16} className="text-primary" /> Signup
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-md border-t border-base-200/80 shadow-lg">
          <div className="flex justify-around items-center h-15 px-2">
            <button
              onClick={() => navigate("/")}
              className={`flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-all ${
                isActive("/") ? "text-primary scale-105" : "text-base-content/50 hover:text-base-content"
              }`}
            >
              <Home size={19} className="mb-0.5" />
              Home
            </button>

            <button
              onClick={() => navigate("/customers")}
              className={`flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-all ${
                isActive("/customers") ? "text-primary scale-105" : "text-base-content/50 hover:text-base-content"
              }`}
            >
              <UserPlus size={19} className="mb-0.5" />
              Customers
            </button>

            <button
              onClick={() => navigate("/delivery")}
              className={`flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-all ${
                isActive("/delivery") ? "text-primary scale-105" : "text-base-content/50 hover:text-base-content"
              }`}
            >
              <History size={19} className="mb-0.5" />
              History
            </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;