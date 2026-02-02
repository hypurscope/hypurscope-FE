import MetricsOverview from "@/components/common/MetricsOverview";
import Tabs from "@/components/common/Tabs";
import { TVLOverview } from "@/components/home";
import Protocols from "@/components/home/Protocols";
import Stablecoins from "@/components/home/Stablecoins";
import { MetricData } from "@/types";
import LiveTVLMetric from "@/components/home/LiveTVLMetric";
import type { TVLResponse, StablecoinsResponse } from "@/hooks";

export default async function Home() {
  // Fetch data server-side for SSR and social sharing
  const [tvlData, stablecoinsData] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/tvl?range=7D`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      },
    )
      .then((res) => (res.ok ? (res.json() as Promise<TVLResponse>) : null))
      .catch(() => null),

    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/stablecoins`,
      {
        next: { revalidate: 60 },
      },
    )
      .then((res) =>
        res.ok ? (res.json() as Promise<StablecoinsResponse>) : null,
      )
      .catch(() => null),
  ]);

  const tabItems = [
    {
      key: "TVL",
      label: "TVL Overview",
      content: <TVLOverview initialData={tvlData || undefined} />,
    },
    {
      key: "stablecoins",
      label: "Stablecoins",
      content: <Stablecoins initialData={stablecoinsData || undefined} />,
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
        <LiveTVLMetric
          className="w-full lg:max-w-[300px]"
          initialData={tvlData || undefined}
        />
      </section>

      <section className="mt-10   md:mx-12 lg:mx-20">
        <div>
          <Tabs items={tabItems} defaultValue={tabItems[0].key} />
        </div>
      </section>
    </div>
  );
}
