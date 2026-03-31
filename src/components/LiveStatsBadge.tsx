import React, { useState, useEffect } from "react";
import socket from "../socket";

interface LiveStats {
  liveCount: number;
  totalCount: number;
}

export default function LiveStatsBadge() {
  const [stats, setStats] = useState<LiveStats>({
    liveCount: 0,
    totalCount: 0,
  });

  useEffect(() => {
    // Use named handlers so we can cleanly remove them on unmount.
    // The global socket itself stays connected — we only unregister these
    // specific listeners so they don't stack up across re-renders.
    const onLiveCount = (count: number) =>
      setStats((prev) => ({ ...prev, liveCount: count }));
    const onTotalCount = (count: number) =>
      setStats((prev) => ({ ...prev, totalCount: count }));

    socket.on("live_player_count", onLiveCount);
    socket.on("total_registered_count", onTotalCount);

    return () => {
      socket.off("live_player_count", onLiveCount);
      socket.off("total_registered_count", onTotalCount);
    };
  }, []); // empty deps — runs once, cleanup on unmount

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Live Online */}
      <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-hunt-mint opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-hunt-mint" />
          </span>
          <span className="text-xs text-hunt-mint font-body font-medium">
            LIVE
          </span>
        </div>
        <p className="text-4xl font-display font-bold text-white mt-2">
          {stats.liveCount - 1}
        </p>
        <p className="text-xs text-gray-500 font-body mt-1 uppercase tracking-widest">
          Online Now
        </p>
        <div
          className="absolute bottom-0 left-0 h-1 bg-hunt-mint rounded-full transition-all duration-700"
          style={{
            width: `${Math.min((stats.liveCount / Math.max(stats.totalCount, 1)) * 100, 100)}%`,
          }}
        />
      </div>

      {/* Total Registered */}
      <div className="bg-hunt-card border border-hunt-border rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-3 right-3 text-hunt-lavender text-lg">
          🐣
        </div>
        <p className="text-4xl font-display font-bold text-white mt-2">
          {stats.totalCount}
        </p>
        <p className="text-xs text-gray-500 font-body mt-1 uppercase tracking-widest">
          Total Players
        </p>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-hunt-lavender/30 rounded-full">
          <div className="h-full w-full bg-hunt-lavender rounded-full" />
        </div>
      </div>
    </div>
  );
}
