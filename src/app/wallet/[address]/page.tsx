import { notFound } from "next/navigation";
import Tabs from "@/components/common/Tabs";
import OpenPositions from "@/components/wallet/OpenPositions";
import TradingHistory from "@/components/wallet/TradingHistory";
import VaultSummary from "@/components/wallet/VaultSummary";

const isValidAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

export default function WalletPage({
  params: { address },
}: {
  params: { address: string };
}) {
  if (!isValidAddress(address)) notFound();

  const items = [
    { key: "openPosition", label: "Open Positions", content: <OpenPositions address={address} /> },
    { key: "tradingHistory", label: "Trading History", content: <TradingHistory address={address} /> },
    { key: "vaultSummary", label: "Vault Summary", content: <VaultSummary address={address} /> },
  ];

  return (
    <div className="mx-auto max-w-6xl py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Wallet Overview</h1>
        <p className="text-gray-500 font-mono">{address}</p>
      </header>
     <section>
         <Tabs items={items} defaultValue={items[0].key} />
     </section>
     <section>
        data
     </section>
    </div>
  );
}