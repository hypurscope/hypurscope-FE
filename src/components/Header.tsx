"use client";
import Image from "next/image";
import React, { useState } from "react";
import SearchInput from "./common/SearchInput";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams() as { address?: string }; // ← read dynamic param
  const onDashboard = pathname.startsWith("/dashboard");

  // helper function for active state
  const isActive = (route: string) => pathname === route;

  const isValidAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

  // If we're on /wallet/[address], use that value for the placeholder
  const walletFromUrl = pathname.startsWith("/wallet/")
    ? typeof params?.address === "string"
      ? params.address
      : pathname.split("/")[2] // fallback if params not populated
    : undefined;

  const go = (value: string) => {
    if (!value) return;
    if (!isValidAddress(value)) {
      // optional: toast or show inline error
      return;
    }
    router.push(`/wallet/${value.toLowerCase()}`);
  };

  return (
    <header className="w-full flex flex-col gap-8">
      <nav className="flex justify-between items-center font-geist-sans">
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/dhvwthnzq/image/upload/v1755955314/hyperscope/Frame_247_zlamyk.png"
            alt="Logo"
            className="h-8  lg:block w-fit object-contain"
            width={300}
            height={100}
          />
          {/* <Image
              src={"https://res.cloudinary.com/dhvwthnzq/image/upload/v1755899498/hyperscope/Group_18_aponxv.svg"}
              alt="logo"
              className="h-8 lg:hidden w-40 object-cover"
              width={200}
              height={100}
          /> */}
        </Link>

        <div className="flex items-center gap-2 font-medium text-base md:text-lg text-tertiary">
          <Link href={onDashboard ? "/" : "/dashboard"}>
            <button className="px-3 py-1 md:px-3 md:py-1.5 text-[11px] md:text-base rounded-[8px] md:rounded-[10px] font-medium cursor-pointer text-white bg-[#1969FE]">
              {onDashboard ? "Home" : "Go to Dashboard"}
            </button>
          </Link>
        </div>
      </nav>

      {pathname === "/" ? (
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="w-full md:max-w-sm">
            <h2 className="font-semibold text-2xl md:text-3xl font-geist-sans">
              Hyperliquid Explorer
            </h2>
            <p className="text-tertiary text-sm md:text-base md:mt-2">
              Real-time insights into HyperEVM and HyperCore data layers
            </p>
          </div>
          <div className="w-full max-w-[510px]">
            <SearchInput
              handleSearch={(e) => setQuery(e.target.value)}
              query={query}
              onSubmit={go}
              placeholder="Paste a wallet address"
            />
          </div>
        </section>
      ) : pathname.startsWith("/wallet/") ? (
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 font-geist-sans">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h3 className="font-semibold text-2xl md:text-3xl ">
              Wallet Overview
            </h3>
            <p className="text-xs text-[#777777] break-all md:break-normal">
              {walletFromUrl}
            </p>
          </div>
          <div className="w-full max-w-[510px]">
            <SearchInput
              handleSearch={(e) => setQuery(e.target.value)}
              query={query}
              onSubmit={go}
              placeholder={"Paste a wallet address"}
            />
          </div>
        </section>
      ) : (
        <section className="w-full max-w-2xl">
          <p className="text-tertiary font-geist-sans font-medium text-base lg:text-2xl">
            Explore spot USDC distribution and token holder analytics across the
            Hyperliquid ecosystem
          </p>
        </section>
      )}
    </header>
  );
};

export default Header;
