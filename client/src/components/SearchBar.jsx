import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const SearchBar = ({ initialSearch = '', initialLocation = '', onSearch }) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search, location });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md"
    >
      {/* Keyword Search Input */}
      <div className="relative flex-grow w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Job title, keywords, skill, or company..."
          className="block w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-slate-500 rounded-xl focus:outline-none text-sm transition-all focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Location Divider for Desktop */}
      <div className="hidden md:block h-6 w-px bg-slate-800" />

      {/* Location Search Input */}
      <div className="relative w-full md:w-1/3">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <MapPin className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state, or 'Remote'..."
          className="block w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-slate-500 rounded-xl focus:outline-none text-sm transition-all focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  );
};

export default SearchBar;
