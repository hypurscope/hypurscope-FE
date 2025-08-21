import MetricsOverview from "@/components/common/MetricsOverview";
import Tabs from "@/components/common/Tabs";
import { TVLOverview } from "@/components/home";
import Protocols from "@/components/home/Protocols";
import Stablecoins from "@/components/home/Stablecoins";
import { MetricData } from "@/types";
import LiveTVLMetric from "@/components/home/LiveTVLMetric";

export default function Home() {
  const defaultMetrics: MetricData[] = [
    // {
    //   label: "Supported assets",
    //   value: "3",
    //   change: undefined, // No change data
    //   description: "USDC, USDT, DAI",
    // },
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
    // {
    //   key: "protocols",
    //   label: "Protocols",
    //   content: <Protocols />,
    // },
  ];
  return (
    <div className="pt-10">
      <section className="mx-40 justify-items-center grid grid-cols-2 gap-4">
        <LiveTVLMetric className="max-w-[300px]" />
        {defaultMetrics.map((metric, index) => (
          <MetricsOverview
            key={index}
            metric={metric}
            className="max-w-[300px]"
          />
        ))}
      </section>

      <section className="mt-10 mx-20">
        <div>
          <Tabs items={tabItems} defaultValue={tabItems[0].key} />
        </div>
      </section>
    </div>
  );
}
