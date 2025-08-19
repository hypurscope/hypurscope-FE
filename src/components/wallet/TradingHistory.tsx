import React from "react";

type TradingHistoryProps = {
  address: string;
};

type Row = {
  time: string;
  mode: "Buy" | "Sell";
  asset: string;
  amount: string;
  price: string;
  value: string;
};

const rowsDefault: Row[] = [
  {
    time: "2 hours ago",
    mode: "Buy",
    asset: "ETH/USDC",
    amount: "2.5 ETH",
    price: "$3,900",
    value: "$7,200",
  },
  {
    time: "5 hours ago",
    mode: "Sell",
    asset: "BTC/USDC",
    amount: "0.2 BTC",
    price: "$103,134",
    value: "$23,000",
  },
  {
    time: "1 day ago",
    mode: "Buy",
    asset: "BTC/USDC",
    amount: "0.5 BTC",
    price: "$100,189",
    value: "$21,000",
  },
];

export default function TradingHistory({ address }: TradingHistoryProps) {
  const rows = rowsDefault;
  return (
    <section className="space-y-4 max-w-5xl w-full mx-auto mt-8 font-geist-sans">
      <div>
        <h2 className="text-2xl font-semibold">Trade History</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Mode</th>
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.time}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full border border-black/10 px-2 py-0.5 text-[11px] text-black/70">
                    {r.mode}
                  </span>
                </td>
                <td className="px-5 py-4">{r.asset}</td>
                <td className="px-5 py-4">{r.amount}</td>
                <td className="px-5 py-4">{r.price}</td>
                <td className="px-5 py-4">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
