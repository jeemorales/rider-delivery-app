// Login.jsx
import { motion } from "framer-motion";
import { LogIn, Loader, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { Toaster } from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { login, loading } = useUserStore();
  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card w-full max-w-md shadow-2xl bg-base-100 p-6 sm:p-8 rounded-3xl border border-base-200"
      >
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome Back</h2>
          <p className="text-xs text-base-content/60 mt-1">
            Login to access your rider dashboard & delivery route
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
              <input
                name="email"
                type="email"
                placeholder="rider@example.com"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full pl-10 rounded-xl focus:input-primary text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="input input-bordered w-full pl-10 pr-10 rounded-xl focus:input-primary text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full rounded-xl mt-2 font-bold shadow-lg shadow-primary/20 normal-case text-base"
          >
            {loading ? (
              <>
                <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className='mr-2 h-5 w-5' aria-hidden='true' />
                Login
              </>
            )}
          </button>
        </form>

        <p className='mt-6 text-center text-xs text-base-content/60 font-medium'>
          Not a member?{" "}
          <Link to='/signup' className='font-bold text-primary hover:underline'>
            Sign up now
          </Link>
        </p>
      </motion.div>
      <Toaster position="bottom-center" />
    </div>
  );
}