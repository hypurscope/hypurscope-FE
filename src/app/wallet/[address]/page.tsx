import { notFound } from "next/navigation";
import Tabs from "@/components/common/Tabs";
import OpenPositions from "@/components/wallet/OpenPositions";
import TradingHistory from "@/components/wallet/TradingHistory";
import VaultSummary from "@/components/wallet/VaultSummary";
import SpotTokenHoldings from "@/components/wallet/SpotTokenHoldings";
import StakingSummary from "@/components/wallet/StakingSummary";
import DelegationSummary from "@/components/wallet/DelegationSummary";
import MetricCard from "@/components/dashboard/MetricCard";

const isValidAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

export default function WalletPage({
  params: { address },
}: {
  params: { address: string };
}) {
  if (!isValidAddress(address)) notFound();

  const items = [
    {
      key: "openPosition",
      label: "Open Positions",
      content: <OpenPositions address={address} />,
    },
    {
      key: "tradingHistory",
      label: "Trading History",
      content: <TradingHistory address={address} />,
    },
    {
      key: "vaultSummary",
      label: "Vault Summary",
      content: <VaultSummary address={address} />,
    },
  ];

  const overviewData = [
    { label: "Wallet Value", key: "walletValue", value: "$45,125" },
    { label: "Net Volume", key: "netVolume", value: "$1.4M" },
    {
      label: "Withdrawable Balance",
      key: "withdrawableBalance",
      value: "$23,500",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl py-8 space-y-6 flex flex-col items-center">
      <div className="space-y-1 font-geist-sans w-full">
        <h1 className="text-2xl font-medium">Perpetuals Portfolio</h1>
        <p className="text-tertiary">
          Complete portfolio value and performance summary
        </p>
      </div>
      <section className="grid grid-cols-1 gap-1 md:grid-cols-3 mt-8 mb-20 mx-auto  justify-items-center w-full max-w-4xl">
        {overviewData.map((data) => (
          <MetricCard key={data.label} label={data.label} value={data.value} fontSize="text-3xl" />
        ))}
      </section>
      <section className="w-full">
        <Tabs items={items} defaultValue={items[0].key} className="max-w-6xl" />
        <hr className="border-t border-[#BAD2FF] mt-20 max-w-[1084px] mx-auto" />
      </section>
      <section className="space-y-20 w-full mt-14">
        <SpotTokenHoldings />
        <StakingSummary />
        <DelegationSummary />
      </section>
    </div>
  );
}
