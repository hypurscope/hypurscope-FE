import React from "react";

type VaultSummaryProps = {
  address: string;
};

type Row = {
  name: string;
  deposited: string;
  apy: string;
  rewards: string;
};

const rowsDefault: Row[] = [
  {
    name: "ETH Yield Vault",
    deposited: "$35,000",
    apy: "12.5%",
    rewards: "$1,850",
  },
  {
    name: "BTC Strategy Vault",
    deposited: "$25,000",
    apy: "9.8%",
    rewards: "$1,200",
  },
  {
    name: "Stablecoin Vault",
    deposited: "$15,000",
    apy: "6.2%",
    rewards: "$800",
  },
];

export default function VaultSummary({ address }: VaultSummaryProps) {
  const rows = rowsDefault;
  return (
    <section className="space-y-4 max-w-5xl w-full mx-auto mt-8 font-geist-sans">
      <div>
        <h2 className="text-2xl font-semibold">Vault Summary</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Vault Name</th>
              <th className="px-5 py-3 font-medium">Deposited</th>
              <th className="px-5 py-3 font-medium">APY</th>
              <th className="px-5 py-3 font-medium">Rewards</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.name}</td>
                <td className="px-5 py-4">{r.deposited}</td>
                <td className="px-5 py-4">{r.apy}</td>
                <td className="px-5 py-4">{r.rewards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
