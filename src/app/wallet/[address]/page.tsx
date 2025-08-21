import { notFound } from "next/navigation";
import Tabs from "@/components/common/Tabs";
import OpenPositions from "@/components/wallet/OpenPositions";
import TradingHistory from "@/components/wallet/TradingHistory";
import VaultSummary from "@/components/wallet/VaultSummary";
import SpotTokenHoldings from "@/components/wallet/SpotTokenHoldings";
import StakingSummary from "@/components/wallet/StakingSummary";
import DelegationSummary from "@/components/wallet/DelegationSummary";
import MetricCard from "@/components/dashboard/MetricCard";
import { formatUSDCompact } from "@/lib/utils";

const isValidAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

export default async function WalletPage({
  params: { address },
}: {
  params: { address: string };
}) {
  if (!isValidAddress(address)) notFound();

  // Fetch portfolio overview from upstream with a far-back start_time to include full history
  let accountValue: string = "-";
  let netVolume: string = "-";
  let withdrawable: string = "-";
  try {
    const url = `https://hyper-dev-p1ob.onrender.com/api/user-info/${address}?start_time=${encodeURIComponent(
      "2000-01-01 00:00"
    )}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const p = data?.user_state?.Portfolio;
      if (p) {
        if (typeof p["Account Value"] === "number")
          accountValue = formatUSDCompact(p["Account Value"]);
        if (typeof p["Net Volume of Trade"] === "number")
          netVolume = formatUSDCompact(p["Net Volume of Trade"]);
        if (typeof p["Withdrawable Balance"] === "number")
          withdrawable = formatUSDCompact(p["Withdrawable Balance"]);
      }
    }
  } catch {}

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
    // {
    //   key: "vaultSummary",
    //   label: "Vault Summary",
    //   content: <VaultSummary address={address} />,
    // },
  ];

  const overviewData = [
    { label: "Account Value", key: "walletValue", value: accountValue },
    { label: "Net Volume of Trade", key: "netVolume", value: netVolume },
    {
      label: "Withdrawable Balance",
      key: "withdrawableBalance",
      value: withdrawable,
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
          <MetricCard
            key={data.label}
            label={data.label}
            value={data.value}
            fontSize="text-3xl"
          />
        ))}
      </section>
      <section className="w-full">
        <Tabs items={items} defaultValue={items[0].key} className="max-w-6xl" />
        <hr className="border-t border-[#BAD2FF] mt-20 max-w-[1084px] mx-auto" />
      </section>
      <section className="space-y-20 w-full mt-14">
        <SpotTokenHoldings address={address} />
        <StakingSummary />
        <DelegationSummary />
      </section>
    </div>
  );
}
