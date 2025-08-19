"use client";
import Image from "next/image";
import React, { useState } from "react";
import SearchInput from "./common/SearchInput";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  // helper function for active state
  const isActive = (route: string) => pathname === route;

  return (
    <header className="w-full flex flex-col gap-8">
      <nav className="flex justify-between items-center font-geist-sans">
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/dhvwthnzq/image/upload/v1755094133/hyperscope/HyperScope_gze9aw.svg"
            alt="Logo"
            className="h-10 w-fit object-cover"
            width={100}
            height={200}
          />
        </Link>

        <div className="flex items-center gap-2 font-medium text-lg text-tertiary">
          <Link href="/dashboard">
            <button
              className={`px-4 py-1.5 cursor-pointer ${
                isActive("/dashboard") ? "border-b-2 border-b-black text-black" : ""
              }`}
            >
              Dashboard
            </button>
          </Link>

          <Link href="/">
            <button
              className={`px-4 py-1.5 cursor-pointer ${
                isActive("/") ? "border-b-2 border-b-black text-black" : ""
              }`}
            >
              Stats
            </button>
          </Link>
        </div>
      </nav>

      {pathname === "/" ? (
        <section className="flex items-center justify-between">
          <div className="w-full max-w-sm">
            <h2 className="font-semibold text-3xl font-geist-sans">
              Hyperliquid Explorer
            </h2>
            <p className="text-tertiary text-base mt-2">
              Real-time insights into HyperEVM and HyperCore data layers
            </p>
          </div>
          <SearchInput
            handleSearch={(e) => setQuery(e.target.value)}
            query={query}
            placeholder="Search wallets, protocols, tokens..."
          />
        </section>
      ) : (
        <section className="w-full max-w-2xl">
          <p className="text-tertiary font-geist-sans font-medium text-2xl">
            Explore spot USDC distribution and token holder analytics across the
            Hyperliquid ecosystem
          </p>
        </section>
      )}
    </header>
  );
};

export default Header;
