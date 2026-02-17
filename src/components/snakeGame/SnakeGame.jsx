import React, { useEffect, useRef, useState } from "react";
import toast from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/constants";

const BOARD_CELLS = 20; // 20x20 grid
const INITIAL_SPEED = 220; // ms per tick
const SPEED_STEP = 10; // speed up per food until floor
const MIN_SPEED = 90;
const MAX_CANVAS = 420;
const MIN_CANVAS = 260;
const MOBILE_CONTROLS = [
  { label: "↑", dir: "UP", blocked: "DOWN" },
  { label: "←", dir: "LEFT", blocked: "RIGHT" },
  { label: "→", dir: "RIGHT", blocked: "LEFT" },
  { label: "↓", dir: "DOWN", blocked: "UP" },
];

const apiBase = API_URL.replace(/\/$/, "");

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const loopRef = useRef(null);
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 5, y: 5 });
  const dirRef = useRef("RIGHT");
  const speedRef = useRef(INITIAL_SPEED);
  const scoreRef = useRef(0);
  const runningRef = useRef(false);
  const gridSizeRef = useRef(20);

  const [score, setScore] = useState(0);
  const [topPlayers, setTopPlayers] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [running, setRunning] = useState(false);
  const [canvasSize, setCanvasSize] = useState(400);

  const { user, authFetch } = useAuth();

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = randomFood(snakeRef.current);
    dirRef.current = "RIGHT";
    speedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    setScore(0);
  };

  const randomFood = snake => {
    while (true) {
      const pos = {
        x: Math.floor(Math.random() * BOARD_CELLS),
        y: Math.floor(Math.random() * BOARD_CELLS),
      };
      if (!snake.some(s => s.x === pos.x && s.y === pos.y)) return pos;
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const GRID_SIZE = gridSizeRef.current;
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(148,163,184,0.12)";
    for (let i = 0; i <= BOARD_CELLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(
      foodRef.current.x * GRID_SIZE,
      foodRef.current.y * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE
    );

    // Snake
    snakeRef.current.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? "#10b981" : "#059669";
      ctx.fillRect(seg.x * GRID_SIZE, seg.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
  };

  const tick = () => {
    const snake = [...snakeRef.current];
    const head = { ...snake[0] };
    const dir = dirRef.current;
    if (dir === "UP") head.y -= 1;
    if (dir === "DOWN") head.y += 1;
    if (dir === "LEFT") head.x -= 1;
    if (dir === "RIGHT") head.x += 1;

    // wall hit
    if (head.x < 0 || head.y < 0 || head.x >= BOARD_CELLS || head.y >= BOARD_CELLS) {
      endGame();
      return;
    }

    // self hit
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      endGame();
      return;
    }

    snake.unshift(head);

    const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
    if (ate) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      foodRef.current = randomFood(snake);
      const nextSpeed = Math.max(MIN_SPEED, speedRef.current - SPEED_STEP);
      if (nextSpeed !== speedRef.current) {
        speedRef.current = nextSpeed;
        restartLoop();
      }
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    draw();
  };

  const startLoop = () => {
    runningRef.current = true;
    setRunning(true);
    loopRef.current = setInterval(tick, speedRef.current);
  };

  const stopLoop = () => {
    runningRef.current = false;
    setRunning(false);
    if (loopRef.current) clearInterval(loopRef.current);
  };

  const restartLoop = () => {
    stopLoop();
    startLoop();
  };

  const startGame = () => {
    if (runningRef.current) return;
    resetGame();
    draw();
    startLoop();
  };

  const endGame = () => {
    stopLoop();
    runningRef.current = false;
    setRunning(false);
    toast.info(`Game over! Score: ${scoreRef.current}`);
    postScore(scoreRef.current);
  };

  const postScore = async value => {
    if (!user?._id) return;
    setIsPosting(true);
    try {
      const url = `${apiBase}/snake-game/score/${user._id}?score=${value}`;
      const res = await authFetch(url, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.message || "Failed to save score";
        throw new Error(message);
      }
      const isTop = data?.data?.isNewTopScore;
      if (isTop) {
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
  };

  const fetchTopPlayers = async () => {
    try {
      const res = await fetch(`${apiBase}/snake-game/top-ten`, {
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

  const handleKey = e => {
    if (!runningRef.current) return;
    const dir = dirRef.current;
    if (e.key === "ArrowUp" && dir !== "DOWN") dirRef.current = "UP";
    if (e.key === "ArrowDown" && dir !== "UP") dirRef.current = "DOWN";
    if (e.key === "ArrowLeft" && dir !== "RIGHT") dirRef.current = "LEFT";
    if (e.key === "ArrowRight" && dir !== "LEFT") dirRef.current = "RIGHT";
  };

  const resizeCanvas = () => {
    const width = Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.floor(window.innerWidth * 0.9)));
    const cell = Math.max(12, Math.floor(width / BOARD_CELLS));
    const canvasPixels = cell * BOARD_CELLS;
    gridSizeRef.current = cell;
    setCanvasSize(canvasPixels);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    draw();
    fetchTopPlayers();
    window.addEventListener("keydown", handleKey);
    return () => {
      stopLoop();
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize]);

  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-4 py-6 text-slate-100">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_260px] lg:gap-6">
        <aside
          id="snake-guide"
          className="order-3 rounded-2xl bg-slate-900/70 p-5 shadow-lg shadow-emerald-900/30 backdrop-blur lg:order-1"
        >
          <h2 className="text-lg font-semibold text-white">How to play</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>➜ Use arrow keys (desktop) or D-pad (mobile) to move.</li>
            <li>✖ Don&apos;t hit walls or your own tail.</li>
            <li>⏩ Eat food to grow; speed ramps up each bite.</li>
            <li>⏯ Pause/Resume anytime; Reset starts fresh.</li>
            <li>💾 Scores auto-save when the run ends.</li>
          </ul>
        </aside>

        <div className="order-1 flex flex-col rounded-2xl bg-slate-900/70 p-5 shadow-xl shadow-emerald-900/30 backdrop-blur lg:order-2">
          <header className="mb-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-white">🐍 Snake Arena</h1>
                  <p className="text-sm text-slate-400">
                    Swipe/tap on mobile or use arrows on desktop.
                  </p>
                </div>
                <a
                  href="#snake-guide"
                  className="text-xs font-semibold text-emerald-300 underline decoration-emerald-500 underline-offset-4 lg:hidden"
                >
                  How to play
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">
                  Speed: {(1000 / speedRef.current).toFixed(1)} tps
                </div>
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">Score: {score}</div>
              </div>
            </div>
          </header>

          <div className="flex flex-col items-center gap-4">
            <canvas
              ref={canvasRef}
              style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}
              className="w-full max-w-full rounded-xl border border-emerald-500/40 bg-slate-950 shadow-lg shadow-emerald-900/50"
            />
            {/* Mobile D‑pad */}
            <div className="mt-2 grid w-full max-w-sm grid-cols-3 gap-2 text-center text-slate-200 sm:hidden">
              <div className="col-span-3 flex justify-center">
                <button
                  className="h-12 w-16 rounded-lg bg-slate-800 text-lg font-bold shadow-inner shadow-black/30"
                  onClick={() => {
                    const dir = dirRef.current;
                    if (dir !== "DOWN") dirRef.current = "UP";
                  }}
                >
                  ↑
                </button>
              </div>
              <button
                className="h-12 w-16 rounded-lg bg-slate-800 text-lg font-bold shadow-inner shadow-black/30 justify-self-end"
                onClick={() => {
                  const dir = dirRef.current;
                  if (dir !== "RIGHT") dirRef.current = "LEFT";
                }}
              >
                ←
              </button>
              <div />
              <button
                className="h-12 w-16 rounded-lg bg-slate-800 text-lg font-bold shadow-inner shadow-black/30 justify-self-start"
                onClick={() => {
                  const dir = dirRef.current;
                  if (dir !== "LEFT") dirRef.current = "RIGHT";
                }}
              >
                →
              </button>
              <div className="col-span-3 flex justify-center">
                <button
                  className="h-12 w-16 rounded-lg bg-slate-800 text-lg font-bold shadow-inner shadow-black/30"
                  onClick={() => {
                    const dir = dirRef.current;
                    if (dir !== "UP") dirRef.current = "DOWN";
                  }}
                >
                  ↓
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                onClick={startGame}
                className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                disabled={running}
              >
                {running ? "Running..." : "Start"}
              </button>
              <button
                onClick={() => {
                  if (runningRef.current) {
                    stopLoop();
                    toast.info("Paused");
                  } else {
                    startLoop();
                    toast.info("Resumed");
                  }
                }}
                className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:w-auto"
              >
                {runningRef.current ? "Pause" : running ? "Paused" : "Resume"}
              </button>
              <button
                onClick={() => {
                  stopLoop();
                  resetGame();
                  draw();
                }}
                className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:w-auto"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <aside className="order-2 w-full rounded-2xl bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/30 backdrop-blur lg:order-3">
          <h2 className="text-xl font-semibold text-white">Top 10 Players</h2>
          <p className="mb-3 text-sm text-slate-400">Best unique player scores</p>
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
          {isPosting && <p className="mt-4 text-xs text-emerald-300">Saving score...</p>}
        </aside>
      </div>
    </section>
  );
}
