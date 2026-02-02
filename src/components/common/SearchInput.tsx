import React, { useMemo } from "react";
import { Search } from "lucide-react";

type SearchInputProps = {
  handleSearch: React.ChangeEventHandler<HTMLInputElement>;
  query: string;
  placeholder?: string;
  onSubmit?: (value: string) => void;
};

const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
};

const SearchInput = ({
  handleSearch,
  query,
  placeholder,
  onSubmit,
}: SearchInputProps) => {
  const trimmedQuery = query.trim();
  const isValid = useMemo(() => {
    if (!trimmedQuery) return true; // Empty is neutral, not invalid
    return isValidAddress(trimmedQuery);
  }, [trimmedQuery]);

  const showError = trimmedQuery && !isValid;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid && trimmedQuery) {
      onSubmit?.(trimmedQuery);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (isValidAddress(pasted)) {
      setTimeout(() => onSubmit?.(pasted), 0);
    }
  };

  const handleSubmit = () => {
    if (isValid && trimmedQuery) {
      onSubmit?.(trimmedQuery);
    }
  };

  return (
    <div className="w-full max-w-[510px]">
      <div
        className={`bg-[#F4F4F4] h-10 md:h-11 flex items-center justify-between rounded-[10px] w-full border transition-colors ${
          showError
            ? "border-red-500 ring-1 ring-red-500"
            : "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        }`}
      >
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
          className="w-full rounded-l-[10px] font-geist-sans h-full p-2 md:p-2.5 text-sm md:text-base outline-none bg-transparent"
          placeholder={placeholder}
          aria-invalid={showError ? "true" : "false"}
          aria-describedby={showError ? "search-error" : undefined}
        />
        <button
          aria-label="Search"
          onClick={handleSubmit}
          disabled={!isValid || !trimmedQuery}
          className={`w-7 h-7 md:w-8 md:h-8 m-2 md:m-2.5 flex justify-center items-center p-2 rounded-sm transition-colors ${
            isValid && trimmedQuery
              ? "bg-[#1969FE] hover:bg-[#1557d6] cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <Search
            className={`h-5 w-5 md:h-4 md:w-4 ${
              isValid && trimmedQuery ? "text-white" : "text-gray-500"
            }`}
          />
        </button>
      </div>
      {showError && (
        <p
          id="search-error"
          className="text-red-600 text-xs mt-1.5 ml-1"
          role="alert"
        >
          Please enter a valid Hyperliquid address (0x followed by 40
          characters)
        </p>
      )}
    </div>
  );
};

export default SearchInput;
