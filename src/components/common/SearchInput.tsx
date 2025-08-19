import React from "react";
import { Search } from "lucide-react";

type SearchInputProps = {
  handleSearch: React.ChangeEventHandler<HTMLInputElement>;
  query: string;
  placeholder?: string;
};

const SearchInput = ({ handleSearch, query, placeholder }: SearchInputProps) => {
  return (
    <div className="bg-[#F4F4F4] h-11 flex items-center justify-between rounded-[10px] w-full max-w-[510px] ">
      <input
        value={query}
        onChange={handleSearch}
        type="text"
        className="w-full h-full p-2.5"
        placeholder={placeholder}
      />
      <button className="bg-[#1969FE] w-8 h-8 m-2.5 flex justify-center items-center p-2 rounded-sm">
        <Search className="text-white h-4 w-4" />
      </button>
    </div>
  );
};

export default SearchInput;
