import React from "react";
import Tabs from "@/components/common/Tabs";
import USDCSpotHolders from "@/components/dashboard/USDCSpotHolders";
import TokenHolders from "@/components/dashboard/TokenHolders";

const Dashboard = () => {
  return (
    <main className="space-y-10 mb-10 mt-16">
      <Tabs
        items={[
          {
            key: "Spot USDC Holders",
            label: "Spot USDC Holders",
            content: <USDCSpotHolders />,
          },
          {
            key: "Token Holders",
            label: "Token Holders",
            content: <TokenHolders />,
          },
        ]}
        defaultValue="Spot USDC Holders"
      />
    </main>
  );
};

export default Dashboard;
