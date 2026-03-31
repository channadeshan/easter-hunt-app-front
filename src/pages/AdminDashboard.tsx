import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth, ADMIN_API } from "../contexts/AuthContext";
import LiveStatsBadge from "../components/LiveStatsBadge";
import ActivityFeed from "../components/ActivityFeed";
import Spinner from "../components/Spinner";
import EmojiPicker from "../components/EmojiPicker";
import { EGG_EMOJIS, defaultAsset } from "../config/emojiAssets";

interface Egg {
  _id: string;
  name: string;
  emoji: string;
  color: string;
  uniqueCode: string;
  isClaimed: boolean;
}

interface Hint {
  _id: string;
  text: string;
  eggId: string;
  uniqueCode: string;
  isDiscovered: boolean;
}

type Tab = "overview" | "eggs" | "hints" | "feed";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Eggs state
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [eggsLoading, setEggsLoading] = useState(false);
  const [hintsLoading, setHintsLoading] = useState(false);

  // Create egg form — eggEmojiUrl holds the CDN image URL sent to the backend
  const [eggName, setEggName] = useState("");
  const [eggEmojiUrl, setEggEmojiUrl] = useState(defaultAsset(EGG_EMOJIS).url);
  const [eggColor, setEggColor] = useState("#ff6b6b");
  const [creatingEgg, setCreatingEgg] = useState(false);
  const [newEggCode, setNewEggCode] = useState<string | null>(null);

  // Create hint form
  const [hintText, setHintText] = useState("");
  const [hintEggId, setHintEggId] = useState("");
  const [creatingHint, setCreatingHint] = useState(false);
  const [newHintCode, setNewHintCode] = useState<string | null>(null);

  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchEggs = useCallback(async () => {
    setEggsLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/eggs`, { credentials: "include" });
      const data = await res.json();
      // console.log(data);
      setEggs(Array.isArray(data.eggs) ? data.eggs : []);
    } catch {
    } finally {
      setEggsLoading(false);
    }
  }, []);

  const fetchHints = useCallback(async () => {
    setHintsLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/hints`, { credentials: "include" });
      const data = await res.json();
      setHints(Array.isArray(data.hints) ? data.hints : []);
    } catch {
    } finally {
      setHintsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEggs();
    fetchHints();
  }, []);

  const createEgg = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setCreatingEgg(true);
    setNewEggCode(null);
    try {
      const res = await fetch(`${ADMIN_API}/egg`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eggName,
          emoji: eggEmojiUrl,
          color: eggColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Failed to create egg");
        return;
      }
      setNewEggCode(data.uniqueCode);
      setEggName("");
      setEggEmojiUrl(defaultAsset(EGG_EMOJIS).url);
      setEggColor("#ff6b6b");
      fetchEggs();
    } catch {
      setFormError("Network error");
    } finally {
      setCreatingEgg(false);
    }
  };

  const createHint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setCreatingHint(true);
    setNewHintCode(null);
    try {
      const res = await fetch(`${ADMIN_API}/hint`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: hintText, eggId: hintEggId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Failed to create hint");
        return;
      }
      setNewHintCode(data.uniqueCode);
      setHintText("");
      setHintEggId("");
      fetchHints();
    } catch {
      setFormError("Network error");
    } finally {
      setCreatingHint(false);
    }
  };

  const deleteEgg = async (id: string) => {
    await fetch(`${ADMIN_API}/eggs/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchEggs();
  };

  const deleteHint = async (id: string) => {
    await fetch(`${ADMIN_API}/hints/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchHints();
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    setResetting(true);
    try {
      await fetch(`${ADMIN_API}/reset-game`, {
        method: "POST",
        credentials: "include",
      });
      await logout();
      navigate("/", { replace: true });
    } catch {
      setResetting(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "eggs", label: "Eggs", icon: "🥚" },
    { key: "hints", label: "Hints", icon: "💡" },
    { key: "feed", label: "Feed", icon: "📡" },
  ];

  return (
    <div className="min-h-screen bg-hunt-bg flex flex-col max-w-lg mx-auto">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass border-b border-hunt-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          <div>
            <h1 className="font-display font-bold text-white text-base leading-none">
              Admin HQ
            </h1>
            <p className="text-xs text-gray-500 font-body">
              Organizer Dashboard
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-hunt-coral transition-colors font-body px-3 py-1.5 rounded-lg border border-hunt-border hover:border-hunt-coral/50"
        >
          Logout
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
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            <LiveStatsBadge />

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4">
                <p className="text-3xl font-display font-bold text-hunt-canary">
                  {eggs.length}
                </p>
                <p className="text-xs text-gray-500 font-body mt-1 uppercase tracking-widest">
                  Eggs Created
                </p>
              </div>
              <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4">
                <p className="text-3xl font-display font-bold text-hunt-sky">
                  {hints.length}
                </p>
                <p className="text-xs text-gray-500 font-body mt-1 uppercase tracking-widest">
                  Hints Created
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-hunt-card border border-red-900/50 rounded-2xl p-4">
              <h3 className="font-display font-semibold text-hunt-coral mb-1 flex items-center gap-2">
                <span>⚠️</span> Danger Zone
              </h3>
              <p className="text-xs text-gray-500 font-body mb-3">
                Reset deletes all game progress and logs you out. This cannot be
                undone.
              </p>
              <button
                onClick={handleReset}
                disabled={resetting}
                className={`w-full py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  resetConfirm
                    ? "bg-hunt-coral text-white animate-wiggle"
                    : "bg-red-950 border border-red-900/50 text-hunt-coral hover:bg-red-900/30"
                }`}
              >
                {resetting ? (
                  <Spinner size="sm" color="border-white" />
                ) : resetConfirm ? (
                  "⚠️ Confirm Reset – Are You Sure?"
                ) : (
                  "🔄 Reset Game"
                )}
              </button>
              {resetConfirm && !resetting && (
                <button
                  onClick={() => setResetConfirm(false)}
                  className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-white transition-colors font-body"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* EGGS TAB */}
        {activeTab === "eggs" && (
          <div className="space-y-4 animate-fade-in">
            {/* Create Egg Form */}
            <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <span>✨</span> Create New Egg
              </h3>
              <form onSubmit={createEgg} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-body block mb-1.5">
                    Name
                  </label>
                  <input
                    value={eggName}
                    onChange={(e) => setEggName(e.target.value)}
                    placeholder="e.g. Golden Egg"
                    className="w-full bg-hunt-bg border border-hunt-border rounded-xl px-3 py-2.5 text-white font-body text-sm placeholder-gray-600 focus:outline-none focus:border-hunt-canary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-body block mb-1.5">
                    Egg Icon
                  </label>
                  {/* Preview of currently selected icon */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-hunt-canary/10 border border-hunt-canary/30 p-2">
                      <img
                        src={eggEmojiUrl}
                        alt="Selected egg icon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-body">
                      Select from library below
                    </p>
                  </div>
                  {/* URL-based picker — sources from EGG_EMOJIS in emojiAssets.ts */}
                  <EmojiPicker
                    pool={EGG_EMOJIS}
                    selected={eggEmojiUrl}
                    onChange={setEggEmojiUrl}
                    size="w-9 h-9"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-body block mb-1.5">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={eggColor}
                      onChange={(e) => setEggColor(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-hunt-border cursor-pointer bg-hunt-bg"
                    />
                    <div className="flex-1 bg-hunt-bg border border-hunt-border rounded-xl px-3 py-2.5">
                      <span className="font-body text-sm text-white">
                        {eggColor}
                      </span>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg"
                      style={{ background: eggColor }}
                    />
                  </div>
                </div>
                {formError && (
                  <p className="text-hunt-coral text-xs font-body">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={creatingEgg}
                  className="w-full bg-hunt-canary hover:bg-hunt-canary/80 disabled:opacity-50 text-hunt-bg font-display font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {creatingEgg ? (
                    <Spinner size="sm" color="border-hunt-bg" />
                  ) : (
                    <>
                      <img
                        src={eggEmojiUrl}
                        alt=""
                        className="w-5 h-5 object-contain"
                      />{" "}
                      Create Egg
                    </>
                  )}
                </button>
              </form>

              {/* New QR Code */}
              {newEggCode && (
                <div className="mt-4 p-4 bg-white rounded-2xl flex flex-col items-center gap-2 animate-bounce-in qr-container">
                  <p className="text-hunt-bg font-display font-bold text-sm">
                    Print This QR!
                  </p>
                  <QRCodeSVG value={newEggCode} size={160} />
                  <p className="text-hunt-bg font-body text-xs opacity-60 font-mono">
                    {newEggCode}
                  </p>
                  <button
                    onClick={() => setNewEggCode(null)}
                    className="text-xs text-gray-400 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Eggs List */}
            <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4">
              <h3 className="font-display font-semibold text-white mb-3 flex items-center justify-between">
                <span>🥚 All Eggs</span>
                <span className="text-xs text-gray-500 font-body">
                  {eggs.length} total
                </span>
              </h3>
              {eggsLoading && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
              {!eggsLoading && eggs.length === 0 && (
                <p className="text-gray-600 text-sm text-center font-body py-4">
                  No eggs yet. Create one above.
                </p>
              )}
              <div className="space-y-2">
                {eggs.map((egg) => (
                  <div
                    key={egg._id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-hunt-border bg-hunt-bg group"
                    style={{ borderLeftColor: egg.color, borderLeftWidth: 3 }}
                  >
                    <span className="text-xl">
                      <img
                        src={egg.emoji}
                        alt={egg.name}
                        className="w-6 h-6 object-contain inline"
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-sm text-white truncate">
                        {egg.name}
                      </p>
                      <p className="font-mono text-xs text-gray-500 truncate">
                        {egg.uniqueCode}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: egg.isClaimed ? "#ff0000" : undefined }}
                      >
                        {egg.isClaimed ? "Claimed" : "Unclaimed"}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEgg(egg._id)}
                      className="text-gray-600 hover:text-hunt-coral transition-colors text-xs opacity-0 group-hover:opacity-100 font-body"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HINTS TAB */}
        {activeTab === "hints" && (
          <div className="space-y-4 animate-fade-in">
            {/* Create Hint Form */}
            <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <span>✨</span> Create New Hint
              </h3>
              <form onSubmit={createHint} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-body block mb-1.5">
                    Hint Text
                  </label>
                  <textarea
                    value={hintText}
                    onChange={(e) => setHintText(e.target.value)}
                    placeholder="e.g. Look near the oak tree..."
                    rows={3}
                    className="w-full bg-hunt-bg border border-hunt-border rounded-xl px-3 py-2.5 text-white font-body text-sm placeholder-gray-600 focus:outline-none focus:border-hunt-sky transition-colors resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-body block mb-1.5">
                    Linked Egg
                  </label>
                  <select
                    value={hintEggId}
                    onChange={(e) => setHintEggId(e.target.value)}
                    className="w-full bg-hunt-bg border border-hunt-border rounded-xl px-3 py-2.5 text-white font-body text-sm focus:outline-none focus:border-hunt-sky transition-colors"
                    required
                  >
                    <option value="">Select an egg...</option>
                    {eggs.map((egg) => (
                      <option key={egg._id} value={egg._id}>
                        {egg.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formError && (
                  <p className="text-hunt-coral text-xs font-body">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={creatingHint}
                  className="w-full bg-hunt-sky hover:bg-hunt-sky/80 disabled:opacity-50 text-white font-display font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {creatingHint ? (
                    <Spinner size="sm" color="border-white" />
                  ) : (
                    "💡 Create Hint"
                  )}
                </button>
              </form>

              {/* New Hint QR */}
              {newHintCode && (
                <div className="mt-4 p-4 bg-white rounded-2xl flex flex-col items-center gap-2 animate-bounce-in qr-container">
                  <p className="text-hunt-bg font-display font-bold text-sm">
                    Print This QR!
                  </p>
                  <QRCodeSVG value={newHintCode} size={160} />
                  <p className="text-hunt-bg font-body text-xs opacity-60 font-mono">
                    {newHintCode}
                  </p>
                  <button
                    onClick={() => setNewHintCode(null)}
                    className="text-xs text-gray-400 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Hints List */}
            <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4">
              <h3 className="font-display font-semibold text-white mb-3 flex items-center justify-between">
                <span>💡 All Hints</span>
                <span className="text-xs text-gray-500 font-body">
                  {hints.length} total
                </span>
              </h3>
              {hintsLoading && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
              {!hintsLoading && hints.length === 0 && (
                <p className="text-gray-600 text-sm text-center font-body py-4">
                  No hints yet.
                </p>
              )}
              <div className="space-y-2">
                {hints.map((hint) => {
                  const egg = eggs.find((e) => e._id === hint.eggId);
                  return (
                    <div
                      key={hint._id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-hunt-border bg-hunt-bg group"
                      style={{ borderLeftColor: "#339af0", borderLeftWidth: 3 }}
                    >
                      <span className="text-lg mt-0.5">
                        {egg?.emoji ?? "💡"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-white">
                          {hint.text}
                        </p>
                        <p className="font-mono text-xs text-gray-500 mt-1 truncate">
                          {hint.uniqueCode}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: hint.isDiscovered ? "#ff0000" : undefined,
                          }}
                        >
                          {hint.isDiscovered ? "Discovered" : "Not discovered"}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteHint(hint._id)}
                        className="text-gray-600 hover:text-hunt-coral transition-colors text-xs opacity-0 group-hover:opacity-100 font-body mt-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FEED TAB */}
        {activeTab === "feed" && (
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
