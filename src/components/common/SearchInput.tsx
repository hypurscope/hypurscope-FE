import React from "react";
import { Search } from "lucide-react";

type SearchInputProps = {
  handleSearch: React.ChangeEventHandler<HTMLInputElement>;
  query: string;
  placeholder?: string;
  onSubmit?: (value: string) => void;
};

const SearchInput = ({
  handleSearch,
  query,
  placeholder,
  onSubmit,
}: SearchInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit?.(query.trim());
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    // Update input value via onChange so UI reflects it
    // Note: we can't synthesize a ChangeEvent cleanly, so rely on native paste + next tick
    setTimeout(() => onSubmit?.(pasted), 0);
  };
  return (
    <div className="bg-[#F4F4F4] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 h-11 flex items-center justify-between rounded-[10px] w-full max-w-[510px] border">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        value={query}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={handleSearch}
        type="text"
        className="w-full rounded-l-[10px] font-geist-sans  h-full p-2.5 outline-none"
        placeholder={placeholder}
      />
      <button
        aria-label="Search"
        onClick={() => onSubmit?.(query.trim())}
        className="bg-[#1969FE] w-8 h-8 m-2.5 flex justify-center items-center p-2 rounded-sm"
      >
        <Search className="text-white h-4 w-4" />
      </button>
    </div>
  );
};

export default SearchInput;
