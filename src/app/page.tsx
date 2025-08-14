"use client";

import MetricsOverview from "@/components/common/MetricsOverview";
import Tabs from "@/components/common/Tabs";
import { TVLOverview, Stablecoins, Protocols } from "@/components/home";
import { MetricData } from "@/types";

export default function Home() {
  const defaultMetrics: MetricData[] = [
    {
      label: "Total Value Locked",
      value: "$2.4B",
      change: {
        percentage: "+12.6%",
        direction: "up",
        period: "from last week",
      },
    },
    {
      label: "Supported assets",
      value: "3",
      change: undefined,
      description: "USDC, USDT, DAI",
    },
    {
      label: "Protocols",
      value: "3",
      change: {
        percentage: "+2%",
        direction: "up",
        period: "from last week",
      },
    },
  ];

  // Simple tab items for testing the transition
  const tabItems = [
    {
      key: "TVL",
      label: "TVL Overview",
      content: <TVLOverview />,
    },
    {
      key: "stablecoins",
      label: "Stablecoins",
      content: <Stablecoins />,
    },
    {
      key: "protocols",
      label: "Protocols",
      content: <Protocols />,
    },
  ];

  return (
    <div className="pt-10">
      <section className="mx-40 grid grid-cols-3 gap-8">
        {defaultMetrics.map((metric, index) => (
          <MetricsOverview key={index} metric={metric} />
        ))}
      </section>

      <section className="mt-10 mx-5 ">
        <div>
          <Tabs items={tabItems} defaultValue={tabItems[0].key} />
        </div>
      </section>
    </div>
  );
}
