"use client";
import { defaultData } from "@/data";
import { StablecoinItem } from "@/types";
import Image from "next/image";
import React from "react";

export interface StableCoinsDistributionProps {
  title?: string;
  items?: StablecoinItem[];
  className?: string;
}



function formatBillionsUSD(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

const TokenChip: React.FC<{ symbol: string; color?: string }> = ({
  symbol,
  color = "#111827",
}) => (
  <span
    aria-hidden
    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white"
    style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.02) inset" }}
  >
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {symbol[0]}
    </span>
  </span>
);

const Bar: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="relative h-2 w-full rounded-full bg-[#F3F4F6]">
    <div
      className="absolute left-0 top-0 h-full rounded-full bg-[#1F1F1F]"
      style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
    />
  </div>
);

const StableCoinsDistribution: React.FC<StableCoinsDistributionProps> = ({
  title = "Stablecoin Distribution",
  items = defaultData,
  className,
}) => {
  return (
    <section className={`${className} font-geist-sans`}>
      <h3 className="mb-8 text-xl font-medium text-black md:text-2xl">
        {title}
      </h3>

      <div className="flex flex-col gap-8">
        {items.map((item) => {
          const positive = item.changePct >= 0;
          return (
            <div key={item.symbol} className="flex flex-col gap-2">
              {/* Row header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt={`${item.symbol} logo`}
                      width={24}
                      height={24}
                      className="h-7 w-7"
                    />
                  ) : (
                    <div
                      className="h-6 w-6 rounded-full bg-gray-200"
                      aria-hidden
                    />
                  )}
                  <span className="text-base font-medium text-black">
                    {item.symbol}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-base font-semibold text-black">
                    {formatBillionsUSD(item.value)}
                  </div>
                  <div
                    className={`text-sm ${
                      positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {item.changePct.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <Bar percent={item.percent} />

              {/* Subtext */}
              <div className="text-sm text-[#9CA3AF]">
                {item.percent.toFixed(1)}% of total TVL
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StableCoinsDistribution;
