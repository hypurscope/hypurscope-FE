import Image from "next/image";
import React from "react";
import { Search } from "lucide-react";

const Header = () => {
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
        <div className="bg-[#F4F4F4] h-11 flex items-center justify-between rounded-[10px] w-full max-w-[510px] ">
          <input
            type="text"
            className="w-full h-full p-2.5"
            placeholder="Search wallets, protocols, tokens..."
          />
          <button className="bg-[#1969FE] w-8 h-8 m-2.5 flex justify-center items-center p-2 rounded-sm">
            <Search className="text-white h-4 w-4" />
          </button>
        </div>
      </section>
    </header>
  );
};

export default Header;
