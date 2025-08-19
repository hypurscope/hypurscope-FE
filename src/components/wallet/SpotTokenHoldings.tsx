import React from "react";

type Row = {
  token: string;
  balance: string;
  value: string;
  allocation: string;
};

const defaultRows: Row[] = [
  {
    token: "USDC",
    balance: "45,230.50",
    value: "$45,230",
    allocation: "24.2%",
  },
  { token: "ETH", balance: "28.75", value: "$121,010", allocation: "38.5%" },
  { token: "BTC", balance: "1.08", value: "$121,000", allocation: "6.2%" },
];

export default function SpotTokenHoldings({
  rows = defaultRows,
}: {
  rows?: Row[];
}) {
  return (
    <section className="space-y-3 font-geist-sans">
      <div>
        <h2 className="text-xl font-semibold">Spot Token Holdings</h2>
        <p className="text-sm text-black/50">
          Current token balances and allocations
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Token</th>
              <th className="px-5 py-3 font-medium">Balance</th>
              <th className="px-5 py-3 font-medium">Value</th>
              <th className="px-5 py-3 font-medium">Allocation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.token} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.token}</td>
                <td className="px-5 py-4">{r.balance}</td>
                <td className="px-5 py-4">{r.value}</td>
                <td className="px-5 py-4">{r.allocation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
