import React from "react";

type OpenPositionsProps = {
  address: string;
};

type Row = {
  asset: string;
  size: string;
  notional: string;
  markPrice: string;
  pnl: string; // currency string with sign
  pnlPct: number; // positive or negative number
};

const rowsDefault: Row[] = [
  {
    asset: "ETH/USDC",
    size: "5.2 ETH",
    notional: "$22,466",
    markPrice: "$4,315",
    pnl: "+$2,340",
    pnlPct: 6.4,
  },
  {
    asset: "BTC/USDC",
    size: "0.5 BTC",
    notional: "$61,125",
    markPrice: "$121,987",
    pnl: "-$890",
    pnlPct: -2.5,
  },
];

const GREEN = "#25AD32";
const RED = "#E5484D";

export default function OpenPositions({ address }: OpenPositionsProps) {
  const rows = rowsDefault;
  return (
    <section className="space-y-4 max-w-5xl w-full mx-auto mt-8 font-geist-sans ">
      <div>
        <h2 className="text-2xl font-semibold">Open Positions</h2>
        <p className="text-sm text-black/50">Current trading positions</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Size</th>
              <th className="px-5 py-3 font-medium">Notional Value</th>
              <th className="px-5 py-3 font-medium">Mark Price</th>
              <th className="px-5 py-3 font-medium">Unrealized PnL</th>
              <th className="px-5 py-3 font-medium">PnL %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.asset} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.asset}</td>
                <td className="px-5 py-4">{r.size}</td>
                <td className="px-5 py-4">{r.notional}</td>
                <td className="px-5 py-4">{r.markPrice}</td>
                <td className="px-5 py-4">{r.pnl}</td>
                <td
                  className="px-5 py-4"
                  style={{ color: r.pnlPct >= 0 ? GREEN : RED }}
                >
                  {r.pnlPct >= 0 ? "+" : ""}
                  {r.pnlPct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
