"use client";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import WatchWalletDialog from "@/components/wallet/WatchWalletDialog";

interface WalletHeaderProps {
  address: string;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ address }) => {
  const [open, setOpen] = useState(false);
  const [watching, setWatching] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

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
          onClick={() => setOpen(true)}
          className="px-3 py-2 text-xs font-medium"
        >
          {watching ? (
            <Eye className="h-4 w-4 text-[#1969FE]" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {watching ? "Watching" : "Watch wallet"}
        </Button>
      </div>
      <WatchWalletDialog
        address={address}
        open={open}
        onOpenChange={setOpen}
        onActivate={(em) => {
          setEmail(em);
          setWatching(true);
        }}
      />
    </div>
  );
};

export default WalletHeader;
