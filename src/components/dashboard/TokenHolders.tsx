"use client";

import React, { useMemo, useState } from "react";
import { tokenHoldersRows, tokenHoldersSummary } from "@/data";
import { Pagination } from "@/components/ui/pagination";
import SearchInput from "../common/SearchInput";
import MetricCard from "./MetricCard";

export default function TokenHolders() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    if (!query) return tokenHoldersRows;
    const q = query.toLowerCase();
    return tokenHoldersRows.filter((r) => r.address.toLowerCase().includes(q));
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setQuery(e.target.value);
  };

  return (
    <div className="space-y-4 font-geist-sans mt-8">
      <div className="flex flex-col items-center justify-between gap-16">
        <SearchInput
          handleSearch={handleSearch}
          query={query}
          placeholder="Search token holders..."
        />
        <div className="grid grid-cols-3 gap-20 ">
          {tokenHoldersSummary.map((m: { label: string; value: string }) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      </div>

      <section className=" mt-14">
        <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EAF1FF] text-xs text-black/70">
              <tr>
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((r: (typeof tokenHoldersRows)[number]) => (
                <tr
                  key={`${r.rank}-${r.address}`}
                  className="border-t border-[#EEF3FF]"
                >
                  <td className="px-5 py-4 text-black/70">#{r.rank}</td>
                  <td className="px-5 py-4 font-mono">{r.address}</td>
                  <td className="px-5 py-4">{r.amount.toLocaleString()}</td>
                  <td className="px-5 py-4">{r.percentage.toFixed(2)}%</td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-6 text-center text-black/50"
                  >
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          className=" px-3 py-3 mt-5"
        />
      </section>
    </div>
  );
}
