import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleMobileNav = (e) => {
    const value = e.target.value;

    if (value === "logout") {
      logout();
      return;
    }

    if (value) navigate(value);
  };

  return (
    <header className="sticky top-0 z-50 bg-base-200/80 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="navbar py-2">

          {/* Logo */}
          <div className="flex-1">
            <span className="text-xl font-bold tracking-wide">
              Rider Delivery App
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-4 font-medium">
            {user ? (
              <>
                <Link className="hover:text-primary transition" to="/">Dashboard</Link>
                <Link className="hover:text-primary transition" to="/customers">Customers</Link>
                <Link className="hover:text-primary transition" to="/delivery">Delivery</Link>
                <button className="hover:text-error transition" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="hover:text-secondary transition" to="/login">Login</Link>
                <Link className="hover:text-primary transition" to="/signup">Signup</Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <select
              className="select select-sm select-bordered"
              onChange={handleMobileNav}
              defaultValue=""
            >
              <option value="" disabled>
                Menu
              </option>

              {user ? (
                <>
                  <option value="/">Dashboard</option>
                  <option value="/customers">Customers</option>
                  <option value="/delivery">Deliveries</option>
                  <option value="logout">Logout</option>
                </>
              ) : (
                <>
                  <option value="/login">Login</option>
                  <option value="/signup">Signup</option>
                </>
              )}
            </select>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
