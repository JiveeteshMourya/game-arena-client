import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../utils/constants";

const apiBase = API_URL.replace(/\/$/, "");

const comingSoon = [
  { name: "Tetris Blitz", badge: "Coming soon" },
  { name: "Astro Dodger", badge: "Coming soon" },
];

export default function HomePage() {
  const [topThree, setTopThree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopThree = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiBase}/snake-game/top-three`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load scores");
        setTopThree(data?.data?.topThreeScorers || []);
      } catch (err) {
        setError(err.message || "Failed to load scores");
      } finally {
        setLoading(false);
      }
    };
    fetchTopThree();
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
            New drop · Arcade revival
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            IEHE Game Arena
          </h1>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Quick‑hit classics with modern polish. Smash a new high score, flex on the leaderboard,
            and watch for fresh games landing soon.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/snake"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              Play Snake
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                Live
              </span>
            </Link>
            <Link
              to="/snake"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              View leaderboard
            </Link>
          </div>
        </div>

        <div className="flex-1 rounded-2xl bg-slate-900/60 p-5 shadow-xl shadow-emerald-900/30 ring-1 ring-emerald-500/15">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Top Snake scorers</h2>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              Live
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {loading && <p className="text-sm text-slate-400">Loading leaderboard…</p>}
            {error && <p className="text-sm text-amber-300">Error: {error}</p>}
            {!loading && !error && topThree.length === 0 && (
              <p className="text-sm text-slate-400">No scores yet. Play first!</p>
            )}
            {!loading &&
              !error &&
              topThree.map((entry, idx) => (
                <div
                  key={(entry?.username || "user") + idx}
                  className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3 ring-1 ring-slate-700/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-200">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {entry?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">Snake</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-300">{entry?.score ?? 0}</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="col-span-1 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 p-[1px] shadow-xl shadow-emerald-900/40">
          <div className="h-full rounded-[calc(1rem-1px)] bg-slate-950/90 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                Live
              </div>
              <span className="text-xs font-semibold text-slate-400">Classic Arcade</span>
            </div>
            <h3 className="text-xl font-bold text-white">Snake</h3>
            <p className="mt-2 text-sm text-slate-300">
              Glide, grow, and dodge yourself. Speed ramps up as you score.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/snake"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                Play
              </Link>
              <Link
                to="/snake"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </article>

        <article className="col-span-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-indigo-300 p-[1px] shadow-xl shadow-indigo-900/40">
          <div className="h-full rounded-[calc(1rem-1px)] bg-slate-950/90 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100">
                Live
              </div>
              <span className="text-xs font-semibold text-slate-400">Memory Rush</span>
            </div>
            <h3 className="text-xl font-bold text-white">Simon Says</h3>
            <p className="mt-2 text-sm text-slate-300">
              Memorize the flashing sequence and repeat it back to climb levels.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/simon"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-400 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              >
                Play
              </Link>
              <Link
                to="/simon"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </article>

        {comingSoon.map(game => (
          <article
            key={game.name}
            className="rounded-2xl bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40 ring-1 ring-slate-800"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/40">
                {game.badge}
              </div>
              <span className="text-xs font-semibold text-slate-500">New title</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{game.name}</h3>
            <p className="mt-2 text-sm text-slate-300">
              We&apos;re polishing retro favorites with modern juice. Stay tuned!
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 opacity-70"
              disabled
            >
              Coming soon
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
