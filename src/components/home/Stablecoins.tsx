import GrowthTrends from "../stablecoins/GrowthTrends";
import StableCoinsDistribution from "../stablecoins/StableCoinsDistribution";

export default function Stablecoins() {
  return (
    <div className="py-6 flex flex-col gap-10">
      <div className="space-y-4">
        <StableCoinsDistribution
          title="Stablecoin Distribution"
        />
      </div>
      <section>
        <GrowthTrends/>
      </section>
    </div>
  );
}