// Signup.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { Toaster, toast } from "react-hot-toast";
import { Loader, UserPlus, User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { signup, user, loading } = useUserStore();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    signup(form);
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
            <UserPlus size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Create Account</h2>
          <p className="text-xs text-base-content/60 mt-1">
            Join us to start managing your deliveries efficiently
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field */}
          <div>
            <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
              <input
                name="name"
                type="text"
                placeholder="Juan Dela Cruz"
                value={form.name}
                onChange={handleChange}
                className="input input-bordered w-full pl-10 rounded-xl focus:input-primary text-sm font-medium"
                required
              />
            </div>
          </div>

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

          {/* Confirm Password Field */}
          <div>
            <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
              Confirm Password
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input input-bordered w-full pl-10 pr-10 rounded-xl focus:input-primary text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
                Sign up
              </>
            )}
          </button>
        </form>

        <p className='mt-6 text-center text-xs text-base-content/60 font-medium'>
          Already have an account?{" "}
          <Link to='/login' className='font-bold text-primary hover:underline'>
            Login here
          </Link>
        </p>
      </motion.div>
      <Toaster position="bottom-center" />
    </div>
  );
}