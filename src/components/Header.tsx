"use client";
import Image from "next/image";
import React from "react";
import SearchInput from "./common/SearchInput";
import { useState } from "react";

const Header = () => {
  const [query, setQuery] = useState("");

  return (
    <header className="w-full flex flex-col gap-8  ">
      <nav>
        <div>
          <Image
            src="https://res.cloudinary.com/dhvwthnzq/image/upload/v1755094133/hyperscope/HyperScope_gze9aw.svg"
            alt="Logo"
            className="h-10  w-fit object-cover"
            width={100}
            height={200}
          />
        </div>
      </nav>
      <section className="flex items-center justify-between">
        <div className="w-full max-w-sm ">
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
    </header>
  );
};

export default Header;
