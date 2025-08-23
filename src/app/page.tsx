import MetricsOverview from "@/components/common/MetricsOverview";
import Tabs from "@/components/common/Tabs";
import { TVLOverview } from "@/components/home";
import Protocols from "@/components/home/Protocols";
import Stablecoins from "@/components/home/Stablecoins";
import { MetricData } from "@/types";
import LiveTVLMetric from "@/components/home/LiveTVLMetric";

export default function Home() {
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
      <section className="mx-4 md:mx-20 lg:mx-40 flex justify-center items-center">
        <LiveTVLMetric className="w-full lg:max-w-[300px]" />
      </section>

      <section className="mt-10   md:mx-12 lg:mx-20">
        <div>
          <Tabs items={tabItems} defaultValue={tabItems[0].key} />
        </div>
      </section>
    </div>
  );
}
