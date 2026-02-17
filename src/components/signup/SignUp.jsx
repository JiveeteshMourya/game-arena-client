import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "../../utils/toast";

const allowedGenders = ["M", "F", "O"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp({ onSubmit }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signup, user, authBusy } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { username, email, password, gender } = form;
    const nextErrors = {};
    if (!username.trim()) nextErrors.username = "Username is required";
    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      nextErrors.email = "Invalid email format";
    }
    if (!password.trim()) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!allowedGenders.includes(gender)) {
      nextErrors.gender = "Gender must be M, F, or O";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(form);
      } else {
        await signup(form);
      }
      setErrors({});
      toast.success("Signed up successfully");
      navigate("/", { replace: true });
    } catch (err) {
      const message = err?.message || "Signup failed. Please try again.";
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 p-8 shadow-xl shadow-slate-950/40 backdrop-blur">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Fill in the details below to get started.</p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-200">
              Username<span className="text-amber-400">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              placeholder="your_username"
              required
            />
            {errors.username && <p className="mt-1 text-xs text-amber-300">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-200">
              Email<span className="text-amber-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="mt-1 text-xs text-amber-300">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-200">
              Password<span className="text-amber-400">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              placeholder="********"
              required
            />
            {errors.password && <p className="mt-1 text-xs text-amber-300">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="gender" className="mb-1 block text-sm font-medium text-slate-200">
              Gender<span className="text-amber-400">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              required
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="O">O</option>
            </select>
            {errors.gender && <p className="mt-1 text-xs text-amber-300">{errors.gender}</p>}
          </div>

          {errors.form && (
            <p className="text-sm font-medium text-amber-300" role="alert">
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || authBusy}
            className="mt-2 w-full rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting || authBusy ? "Signing up..." : "Sign up"}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-300 transition hover:text-amber-200"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
