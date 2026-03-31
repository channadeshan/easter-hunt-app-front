import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { PARTI_API } from "../contexts/AuthContext";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";

type ScanState = "idle" | "scanning" | "processing" | "result";

interface ScanResult {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function ScannerPage() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
    }
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError("");
    setScanState("scanning");
    processingRef.current = false;

    // Small delay for DOM mount
    await new Promise((r) => setTimeout(r, 150));

    const html5Qr = new Html5Qrcode("qr-reader");
    scannerRef.current = html5Qr;

    try {
      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;
          setScanState("processing");

          await stopScanner();

          console.log(`QR code scanned ${decodedText}`);

          try {
            const res = await fetch(`${PARTI_API}/scan`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scannedCode: decodedText }),
            });
            const data = await res.json();

            if (res.ok) {
              setResult({
                type: "success",
                title: data.egg
                  ? `You claimed ${data.egg.emoji ?? ""} ${data.egg.name}!`
                  : data.hint
                    ? "Hint Discovered!"
                    : "Success!",
                message:
                  data.message ||
                  (data.egg
                    ? `You found the ${data.egg.name}! Keep hunting!`
                    : data.hint
                      ? (data.hint.text ??
                        "A new clue has been added to your Intel.")
                      : "Nice find!"),
              });
            } else {
              setResult({
                type: "error",
                title:
                  res.status === 404
                    ? "Unknown Code"
                    : res.status === 400
                      ? "Already Claimed!"
                      : "Oops!",
                message:
                  data.message || "Something went wrong. Try another code.",
              });
            }
          } catch {
            setResult({
              type: "error",
              title: "Network Error",
              message: "Could not reach the server. Check your connection.",
            });
          }
          setScanState("result");
        },
        () => {}, // silent scan failures
      );
    } catch (err: any) {
      setCameraError(
        err?.message?.includes("permission")
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : "Could not start camera. Make sure no other app is using it.",
      );
      setScanState("idle");
    }
  }, [stopScanner]);

  // Auto-start on mount
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const handleKeepScanning = () => {
    setResult(null);
    setScanState("idle");
    startScanner();
  };

  const handleBack = () => {
    stopScanner();
    navigate("/play");
  };

  return (
    <div className="min-h-screen bg-hunt-bg flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-hunt-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-xl bg-hunt-card border border-hunt-border flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="font-display font-bold text-white text-base leading-none">
            Scan QR Code
          </h1>
          <p className="text-xs text-gray-500 font-body">
            Point camera at an egg or hint
          </p>
        </div>
        <div className="ml-auto">
          {scanState === "scanning" && (
            <span className="flex items-center gap-1.5 text-xs text-hunt-mint font-body">
              <span className="relative flex h-2 w-2">
                <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-hunt-mint opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-hunt-mint" />
              </span>
              Scanning
            </span>
          )}
          {scanState === "processing" && (
            <span className="flex items-center gap-1.5 text-xs text-hunt-canary font-body">
              <Spinner size="sm" color="border-hunt-canary" />
              Checking...
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-5 gap-5">
        {/* Camera View */}
        <div className="w-full rounded-2xl overflow-hidden bg-hunt-card border border-hunt-border relative">
          <div id="qr-reader" className="w-full" />

          {/* Scanning overlay frame */}
          {scanState === "scanning" && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-56 h-56">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-hunt-canary rounded-tl-md" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-hunt-canary rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-hunt-canary rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-hunt-canary rounded-br-md" />
              </div>
            </div>
          )}

          {/* Idle state */}
          {scanState === "idle" && !cameraError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner />
              <p className="text-gray-500 text-sm font-body">
                Starting camera...
              </p>
            </div>
          )}

          {/* Camera error */}
          {cameraError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
              <span className="text-4xl">📷</span>
              <p className="text-hunt-coral text-sm font-body">{cameraError}</p>
              <button
                onClick={startScanner}
                className="bg-hunt-card border border-hunt-border text-white font-body text-sm px-4 py-2 rounded-xl hover:border-hunt-canary transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🥚", label: "Egg QR", desc: "Claim a hidden egg" },
              { icon: "💡", label: "Hint QR", desc: "Unlock a location clue" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-hunt-card border border-hunt-border rounded-xl p-3 flex items-center gap-2"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-display font-semibold text-white text-sm">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 font-body">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 font-body">
            Keep your phone steady. Detection is automatic.
          </p>
        </div>
      </main>

      {/* Result Modal */}
      {result && (
        <Modal
          isOpen={scanState === "result"}
          onClose={handleKeepScanning}
          title={result.title}
          variant={result.type === "success" ? "success" : "error"}
        >
          <p className="text-white/80 mb-5">{result.message}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleKeepScanning}
              className="w-full bg-hunt-canary hover:bg-hunt-canary/80 text-hunt-bg font-display font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              📷 Keep Scanning
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-hunt-card border border-hunt-border text-gray-400 hover:text-white font-body text-sm py-2.5 rounded-xl transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
