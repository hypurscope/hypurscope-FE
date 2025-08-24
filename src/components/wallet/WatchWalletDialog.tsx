"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";

interface WatchWalletDialogProps {
  address: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onActivate: (email: string) => void; // success path
  onResult?: (result: { success: boolean; message: string }) => void; // toast hook
}

export const WatchWalletDialog: React.FC<WatchWalletDialogProps> = ({
  address,
  open,
  onOpenChange,
  onActivate,
  onResult,
}) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch("/api/track-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, email }),
      });
      if (!res.ok) {
        let msg = "Failed to start watching";
        try {
          const j = await res.json();
          msg = j?.error || msg;
        } catch {}
        setError(msg);
        onResult?.({ success: false, message: msg });
        return;
      }
      const data = await res.json();
      onActivate(email);
      onResult?.({
        success: true,
        message: data?.message || "Watching wallet",
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] w-[92%] sm:w-full p-0 rounded-xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <form
          onSubmit={submit}
          className="space-y-6 sm:space-y-8 font-geist-sans px-5 sm:px-10 py-5 sm:py-6"
        >
          <div>
            <DialogTitle className="text-base sm:text-lg">
              Watch Wallet Notifications
            </DialogTitle>
            <DialogDescription className="max-w-[440px] text-xs sm:text-sm leading-relaxed">
              Get email notifications when this wallet has trading activity,
              position changes, or other important events
            </DialogDescription>
          </div>
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium block">
                Wallet Address
              </label>
              <Input
                value={address}
                disabled
                className="text-[11px] sm:text-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium block">
                Email Address
              </label>
              <Input
                placeholder="Enter your email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-[11px] sm:text-xs text-red-500" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-medium">
                Notification Types
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-[11px] sm:text-xs">
                <li className="flex items-center gap-2">
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-orange-500" />
                  New positions opened/closed
                </li>
                <li className="flex items-center gap-2">
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-[#6A59CE]" />
                  Deposits/Withdrawals
                </li>
                <li className="flex items-center gap-2">
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-pink-500" />
                  Large trades (&gt;$10,000)
                </li>
                <li className="flex items-center gap-2">
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-green-500" />
                  Staking/delegation changes
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-[#1969FE] hover:text-[#0A57FF] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email || submitting}
              className="px-6 w-full sm:w-auto"
            >
              <Eye className="h-4 w-4" /> Start Watching
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WatchWalletDialog;
