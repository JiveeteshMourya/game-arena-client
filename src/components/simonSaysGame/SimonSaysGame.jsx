import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_AUTH_BASE_URL ||
  "http://localhost:9000/api/v1"
).replace(/\/$/, "");

const padConfigs = [
  {
    id: 0,
    color: "from-emerald-400 to-emerald-500",
    label: "A",
    ringClass: "ring-emerald-200",
    glow: "0 0 34px rgba(110, 231, 183, 0.85)",
  },
  {
    id: 1,
    color: "from-sky-400 to-sky-500",
    label: "B",
    ringClass: "ring-sky-200",
    glow: "0 0 34px rgba(125, 211, 252, 0.85)",
  },
  {
    id: 2,
    color: "from-amber-400 to-amber-500",
    label: "C",
    ringClass: "ring-amber-200",
    glow: "0 0 34px rgba(252, 211, 77, 0.9)",
  },
  {
    id: 3,
    color: "from-rose-400 to-rose-500",
    label: "D",
    ringClass: "ring-rose-200",
    glow: "0 0 34px rgba(251, 207, 232, 0.85)",
  },
];

export default function SimonSaysGame() {
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [activePad, setActivePad] = useState(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [topPlayers, setTopPlayers] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [pressedPad, setPressedPad] = useState(null);

  const { user, authFetch } = useAuth();
  const playbackTimeouts = useRef([]);
  const nextRoundTimeout = useRef(null);

  const speed = useMemo(() => Math.max(450 - sequence.length * 12, 200), [sequence.length]);

  const clearPlayback = () => {
    playbackTimeouts.current.forEach(clearTimeout);
    playbackTimeouts.current = [];
  };

  const clearNextRound = () => {
    if (nextRoundTimeout.current) {
      clearTimeout(nextRoundTimeout.current);
      nextRoundTimeout.current = null;
    }
  };

  const resetGame = () => {
    clearPlayback();
    clearNextRound();
    setSequence([]);
    setUserStep(0);
    setRunning(false);
    setIsPlayingBack(false);
    setActivePad(null);
    setScore(0);
    setPressedPad(null);
  };

  const addStep = () => {
    setSequence(prev => [...prev, Math.floor(Math.random() * 4)]);
    setUserStep(0);
  };

  const playback = seq => {
    setIsPlayingBack(true);
    clearPlayback();
    seq.forEach((pad, idx) => {
      const onTime = setTimeout(() => setActivePad(pad), idx * (speed + 120));
      const offTime = setTimeout(() => setActivePad(null), idx * (speed + 120) + speed * 0.75);
      playbackTimeouts.current.push(onTime, offTime);
    });
    const done = setTimeout(() => setIsPlayingBack(false), seq.length * (speed + 120));
    playbackTimeouts.current.push(done);
  };

  useEffect(() => {
    if (sequence.length && running) {
      playback(sequence);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence]);

  const startGame = () => {
    resetGame();
    setRunning(true);
    setTimeout(addStep, 150);
  };

  const endGame = async () => {
    setRunning(false);
    clearPlayback();
    clearNextRound();
    setIsPlayingBack(false);
    setActivePad(null);
    setPressedPad(null);
    if (score > 0 && user?._id) {
      setIsPosting(true);
      try {
        const url = `${apiBase}/simon-says-game/score/${user._id}?score=${score}`;
        const res = await authFetch(url, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to save score");
        if (data?.data?.isNewTopScore) {
          toast.success("New top score!");
        } else {
          toast.success("Score saved");
        }
        fetchTopPlayers();
      } catch (err) {
        toast.error(err?.message || "Could not save score");
      } finally {
        setIsPosting(false);
      }
    }
  };

  const handleUserPress = padId => {
    if (!running || isPlayingBack) return;
    setPressedPad(padId);
    setTimeout(() => setPressedPad(null), 140);
    const expected = sequence[userStep];
    if (padId === expected) {
      const nextStep = userStep + 1;
      if (nextStep === sequence.length) {
        const nextScore = sequence.length;
        setScore(nextScore);
        clearNextRound();
        nextRoundTimeout.current = setTimeout(() => {
          addStep();
          nextRoundTimeout.current = null;
        }, 2000);
      } else {
        setUserStep(nextStep);
      }
    } else {
      toast.error("Wrong pad! Game over.");
      endGame();
    }
  };

  const fetchTopPlayers = async () => {
    try {
      const res = await fetch(`${apiBase}/simon-says-game/top-ten`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load scores");
      const scores =
        data?.data?.topTenScorers ||
        data?.data?.top10Scorers ||
        data?.data?.topScorers ||
        data?.data?.topThreeScorers ||
        [];
      setTopPlayers(scores.slice(0, 10));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTopPlayers();
    return () => {
      clearPlayback();
      clearNextRound();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-6 text-slate-100">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_240px] lg:gap-6">
        <aside
          id="simon-guide"
          className="order-3 rounded-2xl bg-slate-900/70 p-5 shadow-lg shadow-indigo-900/40 backdrop-blur lg:order-1"
        >
          <h2 className="text-lg font-semibold text-white">How to play</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>👀 Watch the pads flash in order.</li>
            <li>🎯 Tap pads to repeat the exact sequence.</li>
            <li>➕ Each round adds one new step.</li>
            <li>⏳ 2s pause before the next pattern begins.</li>
            <li>💾 Score saves automatically when you fail.</li>
          </ul>
        </aside>

        <div className="order-1 flex flex-col gap-4 rounded-2xl bg-slate-900/70 p-5 shadow-xl shadow-indigo-900/40 backdrop-blur lg:order-2">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-white">Simon Says</h1>
                <p className="text-sm text-slate-400">
                  Watch the pattern, repeat it. Each round adds a new step.
                </p>
              </div>
              <a
                href="#simon-guide"
                className="text-xs font-semibold text-indigo-200 underline decoration-indigo-400 underline-offset-4 lg:hidden"
              >
                How to play
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="rounded-lg bg-slate-800/70 px-3 py-2">
                Level: {sequence.length || 0}
              </span>
              <span className="rounded-lg bg-slate-800/70 px-3 py-2">Score: {score}</span>
              <span className="rounded-lg bg-slate-800/70 px-3 py-2">
                Status: {running ? (isPlayingBack ? "Playing pattern" : "Your turn") : "Idle"}
              </span>
            </div>
          </header>

          <div className="grid w-full max-w-md grid-cols-2 gap-2 self-center sm:gap-3">
            {padConfigs.map(pad => {
              const isLit = activePad === pad.id || pressedPad === pad.id;
              const litStyle = isLit ? { boxShadow: pad.glow } : undefined;
              return (
                <button
                  key={pad.id}
                  onClick={() => handleUserPress(pad.id)}
                  aria-pressed={isLit}
                  style={litStyle}
                  className={`aspect-square w-full max-w-[160px] justify-self-center rounded-2xl bg-gradient-to-br ${pad.color} text-lg font-bold text-slate-950 shadow-lg shadow-slate-950/30 ring-4 transition duration-150 sm:max-w-[180px] ${
                    isLit
                      ? `scale-95 brightness-125 saturate-125 ${pad.ringClass}`
                      : "opacity-95 ring-transparent"
                  } ${!running || isPlayingBack ? "cursor-not-allowed opacity-80" : ""}`}
                  disabled={!running || isPlayingBack}
                >
                  {pad.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={startGame}
              className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:w-auto"
            >
              Start
            </button>
            <button
              onClick={() => {
                if (running) {
                  resetGame();
                  setTimeout(() => addStep(), 150);
                } else {
                  resetGame();
                }
              }}
              className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:w-auto"
            >
              Reset
            </button>
          </div>

          {isPosting && <p className="text-xs text-emerald-300">Saving score...</p>}
        </div>

        <aside className="order-2 w-full max-w-xs self-start rounded-2xl bg-slate-900/70 p-4 shadow-xl shadow-indigo-900/40 backdrop-blur lg:order-3">
          <h2 className="text-xl font-semibold text-white">Top 10 Players</h2>
          <p className="mb-3 text-sm text-slate-400">Highest personal bests</p>
          <ol className="space-y-2">
            {topPlayers.length === 0 && <li className="text-sm text-slate-400">No scores yet.</li>}
            {topPlayers.map((entry, idx) => (
              <li
                key={(entry?.username || "user") + idx}
                className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2"
              >
                <span className="text-sm text-slate-200">
                  #{idx + 1} {entry?.username || "Unknown"}
                </span>
                <span className="text-sm font-semibold text-amber-300">{entry?.score ?? 0}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
