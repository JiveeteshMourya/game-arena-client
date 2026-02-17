import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const buttonBase =
  "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, authBusy } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  const avatarLetter = (user?.username || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-lg shadow-black/25 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-white transition hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          I.E.H.E. Game Arena
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-100 hover:bg-slate-800 sm:hidden"
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

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 shadow-sm shadow-black/25">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-base font-bold text-emerald-100">
                    {avatarLetter}
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Player</p>
                    <p className="text-sm font-semibold text-white">
                      {user.username || user.email || "Logged in"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={authBusy}
                  className={`${buttonBase} border border-emerald-400/70 text-emerald-50 hover:bg-emerald-400 hover:text-slate-950 shadow-sm shadow-emerald-900/30 disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {authBusy ? "..." : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${buttonBase} border border-slate-700 text-slate-100 hover:border-emerald-400 hover:text-emerald-50`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className={`${buttonBase} bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-900/30 hover:bg-emerald-300`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div
        className={`sm:hidden border-t border-slate-800/60 bg-slate-950/95 px-4 pb-4 shadow-inner shadow-black/35 transition-all duration-200 ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mt-3 flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-sm shadow-black/25">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-base font-bold text-emerald-100">
                  {avatarLetter}
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Player</p>
                  <p className="text-sm font-semibold text-white">
                    {user.username || user.email || "Logged in"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={authBusy}
                className={`${buttonBase} w-full border border-emerald-400/70 text-emerald-50 hover:bg-emerald-400 hover:text-slate-950 shadow-sm shadow-emerald-900/30 disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {authBusy ? "..." : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`${buttonBase} w-full border border-slate-700 text-center text-slate-100 hover:border-emerald-400 hover:text-emerald-50`}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className={`${buttonBase} w-full bg-emerald-400 text-center text-slate-950 shadow-sm shadow-emerald-900/30 hover:bg-emerald-300`}
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
