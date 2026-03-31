import React, { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../contexts/AuthContext";
import socket from "../socket";

export interface Activity {
  _id: string;
  type: "HINT_DISCOVERED" | "EGG_CLAIMED" | "join" | string;
  message?: string;
  createdAt: string;
  participantId: {
    username: string;
    emojiUrl?: string;
    _id: string;
  };
}

const typeStyle = (type: string) => {
  if (type === "EGG_CLAIMED")
    return {
      cls: "activity-egg bg-yellow-500/5",
      dot: "bg-hunt-canary",
      label: "🥚",
    };
  if (type === "HINT_DISCOVERED")
    return {
      cls: "activity-hint bg-blue-500/5",
      dot: "bg-hunt-sky",
      label: "💡",
    };
  return {
    cls: "activity-join bg-green-500/5",
    dot: "bg-hunt-mint",
    label: "🐥",
  };
};

function timeAgo(ts?: string) {
  if (!ts) return "just now";
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface ActivityFeedProps {
  showHeader?: boolean;
}

export default function ActivityFeed({ showHeader = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch historical activity on mount
    fetch(`${BASE_URL}/activities`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        console.log(data);
        setActivities(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    // Register listener on the global socket — do NOT create a new connection
    const onNewActivity = (activity: Activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 100));
    };

    socket.on("new_activity", onNewActivity);

    // Cleanup ONLY removes this listener — does not disconnect the socket
    return () => {
      socket.off("new_activity", onNewActivity);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📡</span>
          <h3 className="font-display text-base font-semibold text-white">
            Live Feed
          </h3>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-hunt-coral opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-hunt-coral" />
            </span>
            <span className="text-xs text-hunt-coral font-body">Live</span>
          </span>
        </div>
      )}

      <div ref={feedRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm font-body">
            <span className="text-3xl block mb-2">🌱</span>
            Waiting for action...
          </div>
        )}
        {activities.map((activity, i) => {
          const s = typeStyle(activity.type);
          return (
            <div
              key={activity._id || i}
              className={`${s.cls} rounded-lg px-3 py-2.5 flex items-start gap-3 animate-slide-up`}
            >
              <span className="text-base leading-none mt-0.5 shrink-0">
                {s.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/90 font-body leading-snug">
                  {activity.message}
                </p>
                {activity.participantId && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    [ {activity.participantId.username} ]
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-600 shrink-0 mt-0.5">
                {timeAgo(activity.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
