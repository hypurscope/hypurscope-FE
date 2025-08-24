"use client";
import { Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WatchWalletDialog from "@/components/wallet/WatchWalletDialog";

interface WalletHeaderProps {
  address: string;
}

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

const LS_PREFIX = "watchedWallet:";
const keyFor = (addr: string) => `${LS_PREFIX}${addr.toLowerCase()}`;

const WalletHeader: React.FC<WalletHeaderProps> = ({ address }) => {
  const [open, setOpen] = useState(false);
  const [watching, setWatching] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Load persisted state for this wallet when address changes
  useEffect(() => {
    if (typeof window === "undefined" || !address) return;
    try {
      const raw = localStorage.getItem(keyFor(address));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.email) {
          setWatching(true);
          setEmail(parsed.email as string);
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    setWatching(false);
    setEmail(null);
  }, [address]);

  const persistWatch = (em: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        keyFor(address),
        JSON.stringify({ email: em, at: Date.now() })
      );
    } catch {}
  };

  const clearWatch = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(keyFor(address));
    } catch {}
  };

  const pushToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  };

  return (
    <div className="flex justify-between items-start md:items-center w-full ">
      <div className="space-y-1 font-geist-sans w-full">
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight">
          Perpetuals Portfolio
        </h1>
        <p className="text-tertiary text-sm sm:text-base">
          Complete portfolio value and performance summary
        </p>
      </div>
      <div className="ml-4 flex items-center">
        <Button
          variant={watching ? "secondary" : "outline"}
          size="sm"
          onClick={() => {
            if (watching) {
              // toggle off
              setWatching(false);
              setEmail(null);
              clearWatch();
              pushToast("Stopped watching wallet", "success");
            } else {
              setOpen(true);
            }
          }}
          className="px-3 py-2 text-xs font-medium"
          title={
            watching
              ? `Watching${email ? ` (${email})` : ""} - click to stop`
              : "Watch this wallet"
          }
        >
          {watching ? (
            <Eye className="h-4 w-4 text-[#1969FE]" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {watching ? "Unwatch" : "Watch wallet"}
        </Button>
      </div>
      <WatchWalletDialog
        address={address}
        open={open}
        onOpenChange={setOpen}
        onActivate={(em) => {
          setEmail(em);
          setWatching(true);
          persistWatch(em);
          pushToast("Now watching this wallet", "success");
        }}
        onResult={(r) => {
          if (!r.success) pushToast(r.message || "Failed", "error");
        }}
      />
      {/* Toasts */}
      <div className="fixed z-50 top-4 right-4 space-y-2 w-64">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md px-3 py-2 text-sm shadow border flex items-start gap-2 animate-fade-in-down backdrop-blur-sm ${
              t.type === "success"
                ? "bg-white/90 border-green-300 text-green-700"
                : "bg-white/90 border-red-300 text-red-700"
            }`}
          >
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletHeader;
