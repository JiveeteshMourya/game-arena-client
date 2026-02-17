import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const buttonBase =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, authBusy } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 text-white shadow-md backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          IEHE Game Arena
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-100 hover:bg-slate-800 sm:hidden"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Link
                  to="/snake"
                  className={`${buttonBase} border border-emerald-500/70 text-emerald-200 hover:border-emerald-400 hover:text-emerald-100 focus-visible:outline-amber-400`}
                >
                  Snake
                </Link>
                <Link
                  to="/simon"
                  className={`${buttonBase} border border-indigo-400/70 text-indigo-100 hover:border-indigo-300 hover:text-indigo-50 focus-visible:outline-amber-400`}
                >
                  Simon
                </Link>
                <span className="text-sm text-slate-200">
                  {user.username || user.email || "Logged in"}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={authBusy}
                  className={`${buttonBase} border border-slate-600 text-slate-100 hover:border-slate-400 hover:text-white focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {authBusy ? "..." : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${buttonBase} border border-slate-600 text-slate-100 hover:border-slate-400 hover:text-white focus-visible:outline-amber-400`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className={`${buttonBase} bg-amber-400 text-slate-900 hover:bg-amber-300 focus-visible:outline-amber-400`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div
        className={`sm:hidden border-t border-slate-800 bg-slate-900 px-4 pb-4 transition-all duration-200 ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mt-3 flex flex-col gap-2">
          {user ? (
            <>
              <Link
                to="/snake"
                className={`${buttonBase} border border-emerald-500/70 text-center text-emerald-200 hover:border-emerald-400 hover:text-emerald-100 focus-visible:outline-amber-400`}
                onClick={() => setMenuOpen(false)}
              >
                Snake
              </Link>
              <Link
                to="/simon"
                className={`${buttonBase} border border-indigo-400/70 text-center text-indigo-100 hover:border-indigo-300 hover:text-indigo-50 focus-visible:outline-amber-400`}
                onClick={() => setMenuOpen(false)}
              >
                Simon
              </Link>
              <div className="rounded-md border border-slate-800 bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                {user.username || user.email || "Logged in"}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={authBusy}
                className={`${buttonBase} border border-slate-700 text-center text-slate-100 hover:border-slate-500 hover:text-white focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {authBusy ? "..." : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`${buttonBase} border border-slate-700 text-center text-slate-100 hover:border-slate-500 hover:text-white focus-visible:outline-amber-400`}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className={`${buttonBase} bg-amber-400 text-center text-slate-900 hover:bg-amber-300 focus-visible:outline-amber-400`}
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
