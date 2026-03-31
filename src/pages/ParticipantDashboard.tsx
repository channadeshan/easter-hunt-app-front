import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, PARTI_API } from "../contexts/AuthContext";
import ActivityFeed from "../components/ActivityFeed";
import Spinner from "../components/Spinner";
import socket from "../socket";

interface Egg {
  _id: string;
  name: string;
  emoji: string;
  color: string;
  claimed?: boolean;
}

interface HintItem {
  _id: string;
  text: string;
  eggId?: string;
  updatedAt?: string;
  discoveredBy: {
    username: string;
    _id: string;
  };
}

type Tab = "Egglist" | "Hints" | "Feed";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function timeAgo(ts?: string) {
  if (!ts) return "just now";
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function ParticipantDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Egglist");
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [hints, setHints] = useState<HintItem[]>([]);
  const [eggsLoading, setEggsLoading] = useState(true);
  const [hintsLoading, setHintsLoading] = useState(true);

  const fetchEggs = useCallback(async () => {
    try {
      const res = await fetch(`${PARTI_API}/eggs`, { credentials: "include" });
      const data = await res.json();
      setEggs(Array.isArray(data.eggs) ? data.eggs : []);
    } catch {
    } finally {
      setEggsLoading(false);
    }
  }, []);

  const fetchHints = useCallback(async () => {
    try {
      const res = await fetch(`${PARTI_API}/hints/discovered`, {
        credentials: "include",
      });
      const data = await res.json();
      // console.log(data);
      setHints(Array.isArray(data.hints) ? data.hints : []);
    } catch {
    } finally {
      setHintsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEggs();
    fetchHints();

    // Named handlers so we can remove exactly these listeners on unmount.
    // The underlying socket connection is NOT touched here.
    const onGameReset = () => {
      logout();
      navigate("/", { replace: true });
    };
    const onNewActivity = () => {
      fetchEggs();
      fetchHints();
    };

    socket.on("game_reset", onGameReset);
    socket.on("new_activity", onNewActivity);

    return () => {
      socket.off("game_reset", onGameReset);
      socket.off("new_activity", onNewActivity);
      // Do NOT call socket.disconnect() here — that would kill the global connection
    };
  }, []);

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "Egglist", label: "Egglist", icon: "🥚" },
    { key: "Hints", label: "Intel", icon: "💡" },
    { key: "Feed", label: "Feed", icon: "📡" },
  ];

  const unclaimedEggs = eggs.filter((e) => !e.claimed);
  const claimedEggs = eggs.filter((e) => e.claimed);

  return (
    <div className="min-h-screen bg-hunt-bg flex flex-col max-w-lg mx-auto">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass border-b border-hunt-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">
            {user?.emojiUrl ? (
              <img src={user.emojiUrl} alt="User Emoji" className="w-6 h-6" />
            ) : (
              "🐥"
            )}
          </span>
          <div>
            <h1 className="font-display font-bold text-white text-base leading-none">
              {`Welcome to the Hunt!  ${user ? `${user.username}` : ""}`}
            </h1>
            <p className="text-xs text-gray-500 font-body">
              {claimedEggs.length}/{eggs.length} found &middot; {hints.length}{" "}
              hints
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/play/scan")}
          className="flex items-center gap-1.5 bg-hunt-canary hover:bg-hunt-canary/80 text-hunt-bg font-display font-bold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
        >
          <span>📷</span> Scan
        </button>
      </header>

      {/* Tab Nav */}
      <nav className="flex border-b border-hunt-border bg-hunt-bg sticky top-[57px] z-30">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-3 text-xs font-body font-medium transition-all flex flex-col items-center gap-0.5 ${
              activeTab === t.key
                ? "text-hunt-canary border-b-2 border-hunt-canary"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className="text-base">{t.icon}</span>
            {t.label}
            {t.key === "Egglist" && unclaimedEggs.length > 0 && (
              <span className="bg-hunt-canary text-hunt-bg text-[9px] font-bold px-1.5 rounded-full leading-none py-0.5 absolute ml-8 -mt-1">
                {unclaimedEggs.length}
              </span>
            )}
            {t.key === "Hints" && hints.length > 0 && (
              <span className="bg-hunt-sky text-white text-[9px] font-bold px-1.5 rounded-full leading-none py-0.5 absolute ml-8 -mt-1">
                {hints.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 pb-8">
        {/* EGGLIST TAB */}
        {activeTab === "Egglist" && (
          <div className="space-y-3 animate-fade-in">
            {eggsLoading && (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            )}

            {!eggsLoading && eggs.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🌱</div>
                <p className="font-display text-white text-lg">No eggs yet!</p>
                <p className="text-gray-500 text-sm font-body mt-1">
                  The organizer hasn't created any eggs.
                </p>
              </div>
            )}

            {/* Unclaimed Eggs */}
            {unclaimedEggs.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-body mb-2 px-1">
                  🎯 Find These ({unclaimedEggs.length})
                </p>
                <div className="space-y-2">
                  {unclaimedEggs.map((egg, i) => {
                    const rgb = hexToRgb(egg.color || "#ff6b6b");
                    return (
                      <div
                        key={egg._id}
                        className={`rounded-2xl p-4 border transition-all duration-200 animate-slide-up stagger-${Math.min(i + 1, 4)}`}
                        style={{
                          background: `linear-gradient(135deg, rgba(${rgb.r},${rgb.g},${rgb.b},0.12) 0%, rgba(${rgb.r},${rgb.g},${rgb.b},0.04) 100%)`,
                          borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{
                              background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.2)`,
                            }}
                          >
                            <img src={egg.emoji} alt={egg.name} />
                          </div>
                          <div>
                            <p className="font-display font-semibold text-white">
                              {egg.name}
                            </p>
                            <p
                              className="text-xs font-body mt-0.5"
                              style={{ color: egg.color }}
                            >
                              Unclaimed &middot; Find &amp; scan me!
                            </p>
                          </div>
                          <div
                            className="ml-auto w-2 h-2 rounded-full pulse-slow"
                            style={{ background: egg.color }}
                          />
                          <p>{}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Claimed Eggs */}
            {claimedEggs.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-body mb-2 px-1">
                  ✅ Found ({claimedEggs.length})
                </p>
                <div className="space-y-2">
                  {claimedEggs.map((egg) => (
                    <div
                      key={egg._id}
                      className="rounded-2xl p-4 border border-hunt-border bg-hunt-card/50 flex items-center gap-3 opacity-60"
                    >
                      <div className="w-12 h-12 rounded-xl bg-hunt-border flex items-center justify-center text-2xl grayscale">
                        {egg.emoji}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-gray-400">
                          {egg.name}
                        </p>
                        <p className="text-xs text-gray-600 font-body">
                          Claimed by you ✓
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan CTA */}
            {!eggsLoading && unclaimedEggs.length > 0 && (
              <button
                onClick={() => navigate("/play/scan")}
                className="w-full mt-4 bg-hunt-canary hover:bg-hunt-canary/90 active:scale-95 text-hunt-bg font-display font-bold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
              >
                📷 Start Scanning
              </button>
            )}
          </div>
        )}

        {/* INTEL TAB */}
        {activeTab === "Hints" && (
          <div className="space-y-3 animate-fade-in">
            {hintsLoading && (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            )}

            {!hintsLoading && hints.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-display text-white text-lg">
                  No hints discovered
                </p>
                <p className="text-gray-500 text-sm font-body mt-1">
                  Scan hint QR codes around campus to reveal clues.
                </p>
                <button
                  onClick={() => navigate("/play/scan")}
                  className="mt-6 bg-hunt-sky hover:bg-hunt-sky/80 text-white font-display font-semibold px-6 py-3 rounded-xl transition-all active:scale-95"
                >
                  📷 Scan a Hint
                </button>
              </div>
            )}

            {hints.map((hint, i) => (
              <div
                key={hint._id}
                className={`bg-hunt-card border border-hunt-sky/20 rounded-2xl p-4 animate-slide-up stagger-${Math.min(i + 1, 4)}`}
                style={{ borderLeftColor: "#339af0", borderLeftWidth: 3 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">💡</span>
                  <div>
                    <p className="font-body text-white text-sm leading-relaxed">
                      {`Hint :- ${hint.text}`}
                    </p>
                    {hint.discoveredBy && (
                      <p className="text-xs text-gray-600 font-body mt-1.5">
                        Found by {hint.discoveredBy.username}
                      </p>
                    )}
                    {hint.updatedAt && (
                      <p className="text-xs text-gray-600 font-body">
                        Found {timeAgo(hint.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FEED TAB */}
        {activeTab === "Feed" && (
          <div
            className="bg-hunt-card border border-hunt-border rounded-2xl p-4 animate-fade-in"
            style={{ height: "calc(100vh - 160px)" }}
          >
            <ActivityFeed />
          </div>
        )}
      </main>
    </div>
  );
}
