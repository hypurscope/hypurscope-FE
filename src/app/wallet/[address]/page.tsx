import { notFound } from "next/navigation";
import Tabs from "@/components/common/Tabs";
import OpenPositions from "@/components/wallet/OpenPositions";
import TradingHistory from "@/components/wallet/TradingHistory";
import SpotTokenHoldings from "@/components/wallet/SpotTokenHoldings";
import StakingSummary from "@/components/wallet/StakingSummary";
import DelegationSummary from "@/components/wallet/DelegationSummary";
import MetricCard from "@/components/dashboard/MetricCard";
import { formatUSDCompact } from "@/lib/utils";

const isValidAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

type Params = {
  // This might be a promise that resolves to an object containing the address parameter
  params: Promise<{
    address: string;
  }>;
};

// Receive params from Next.js directly
export default async function WalletPage({ params }: Params) {
  const { address } = await params;

  if (!isValidAddress(address)) notFound();

  // Fetch portfolio overview
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
  ];

  const overviewData = [
    { label: "Account Value", key: "walletValue", value: accountValue },
    { label: "Net Volume of Current Trade", key: "netVolume", value: netVolume },
    {
      label: "Withdrawable Balance",
      key: "withdrawableBalance",
      value: withdrawable,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl py-5 sm:py-8 space-y-6 flex flex-col items-center mt-4 sm:mt-5 md:px-0">
      <div className="space-y-1 font-geist-sans w-full">
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight">
          Perpetuals Portfolio
        </h1>
        <p className="text-tertiary text-sm sm:text-base">
          Complete portfolio value and performance summary
        </p>
      </div>

      <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 mb-12 md:mb-20 mx-auto w-full max-w-4xl">
        {overviewData.map((data) => (
          <MetricCard
            key={data.label}
            label={data.label}
            value={data.value}
            fontSize="text-lg sm:text-2xl md:text-3xl"
            className="w-full px-4 sm:px-6 md:px-[40px] py-3 sm:py-4 md:py-5"
          />
        ))}
      </section>

      <section className="w-full">
        <Tabs items={items} defaultValue={items[0].key} className="max-w-6xl" />
        <hr className="border-t border-[#BAD2FF] mt-12 md:mt-20 max-w-[1084px] mx-auto" />
      </section>

      <section className="space-y-14 md:space-y-20 w-full mt-10 md:mt-14">
        <SpotTokenHoldings address={address} />
        <StakingSummary address={address} />
        <DelegationSummary address={address} />
      </section>
    </div>
  );
}
