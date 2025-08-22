import React from "react";

const GREEN = "#25AD32";

type Metric = { label: string; value: string; highlight?: boolean };

type Row = { validator: string; staked: string; apr: string; rewards: string };

const defaultMetrics: Metric[] = [
  { label: "Total Staked", value: "$125,000" },
  { label: "Available Balance", value: "$10,000" },
  { label: "Active Validators", value: "3" },
  { label: "Average APR", value: "8.5%", highlight: true },
];

const defaultRows: Row[] = [
  { validator: "ValiDAO", staked: "$25,000", apr: "8.2%", rewards: "$1,850" },
  { validator: "B-Harvest", staked: "$15,000", apr: "8.7%", rewards: "$1,200" },
  {
    validator: "Purpurposeful",
    staked: "$12,000",
    apr: "8.9%",
    rewards: "$800",
  },
];

export default function StakingSummary({
  metrics = defaultMetrics,
  rows = defaultRows,
}: {
  metrics?: Metric[];
  rows?: Row[];
}) {
  return (
    <section className="space-y-5 font-geist-sans">
      <div>
        <h2 className="text-xl font-semibold">Staking Summary</h2>
        <p className="text-sm text-black/50">
          Validator staking positions and rewards
        </p>
      </div>

      {/* <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="text-xs text-black/50">{m.label}</div>
            <div
              className="text-base font-medium"
              style={m.highlight ? { color: GREEN } : undefined}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div> */}

      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Validator</th>
              <th className="px-5 py-3 font-medium">Staked Amount</th>
              <th className="px-5 py-3 font-medium">APR</th>
              <th className="px-5 py-3 font-medium">Rewards</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.validator} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.validator}</td>
                <td className="px-5 py-4">{r.staked}</td>
                <td className="px-5 py-4">{r.apr}</td>
                <td className="px-5 py-4">{r.rewards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
