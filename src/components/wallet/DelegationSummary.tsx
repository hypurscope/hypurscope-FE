import React from "react";

const GREEN = "#25AD32";

type Metric = { label: string; value: string; highlight?: boolean };

type Row = {
  validator: string;
  delegated: string;
  commission: string;
  apy: string;
  status: "Active" | "Inactive";
};

const defaultMetrics: Metric[] = [
  { label: "Total Delegated", value: "$65,000" },
  { label: "Active Validators", value: "3" },
  { label: "Pending Rewards", value: "$1,850", highlight: true },
];

const defaultRows: Row[] = [
  {
    validator: "ValiDAO",
    delegated: "$25,000",
    commission: "$500",
    apy: "8.2%",
    status: "Active",
  },
  {
    validator: "B-Harvest",
    delegated: "$15,000",
    commission: "$300",
    apy: "8.7%",
    status: "Active",
  },
  {
    validator: "Purpurposeful",
    delegated: "$12,000",
    commission: "$240",
    apy: "8.9%",
    status: "Active",
  },
];

export default function DelegationSummary({
  metrics = defaultMetrics,
  rows = defaultRows,
}: {
  metrics?: Metric[];
  rows?: Row[];
}) {
  return (
    <section className="space-y-5 font-geist-sans">
      <div>
        <h2 className="text-xl font-semibold">Delegation Summary</h2>
        <p className="text-sm text-black/50">
          Your delegation activities and validator performance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
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
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Validator</th>
              <th className="px-5 py-3 font-medium">Delegated Amount</th>
              <th className="px-5 py-3 font-medium">Commission</th>
              <th className="px-5 py-3 font-medium">APY</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.validator} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.validator}</td>
                <td className="px-5 py-4">{r.delegated}</td>
                <td className="px-5 py-4">{r.commission}</td>
                <td className="px-5 py-4">{r.apy}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full border border-black/10 px-2 py-0.5 text-[10px] text-black/60">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
