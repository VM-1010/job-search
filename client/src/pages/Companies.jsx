import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import CompanyCard from '../components/CompanyCard';
import Pagination from '../components/Pagination';
import { Building, Search, AlertCircle, X } from 'lucide-react';

const Companies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL search query & page
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9; // Grid of 3x3 is very neat

  // React Query fetch companies
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ['companies', { search, page }],
    queryFn: async () => {
      const response = await api.get('/companies', {
        params: { search, page, limit }
      });
      return response.data;
    },
    placeholderData: (prev) => prev
  });

  const companies = data?.companies || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value;
    const nextParams = new URLSearchParams(searchParams);
    
    if (query.trim()) {
      nextParams.set('search', query.trim());
    } else {
      nextParams.delete('search');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleClearSearch = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="rounded-full bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold leading-6 text-purple-400 ring-1 ring-inset ring-purple-500/20">
          Company Directory
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mt-6">
          Explore Company Profiles
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400">
          Discover workplace reviews, active job postings, and key recruiter contacts.
        </p>

        {/* Company Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-8 max-w-xl mx-auto relative flex items-center bg-slate-900/60 rounded-2xl border border-slate-800 p-1.5 shadow-2xl focus-within:border-purple-500/50 transition-colors"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by company name or industry..."
            className="block w-full pl-12 pr-10 py-3 bg-transparent text-white placeholder-slate-600 rounded-xl focus:outline-none text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-28 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold text-sm shadow-md hover:from-purple-700 hover:to-indigo-650 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Grid Content section */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-8 text-center text-red-400 flex flex-col items-center gap-4 max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Failed to Load Companies</h3>
            <p className="text-sm text-slate-400 mt-1">
              {error?.message || 'A network error occurred while retrieving companies list.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-semibold hover:bg-red-500/20 transition-all border border-red-500/20"
          >
            Retry Request
          </button>
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-16 text-center max-w-lg mx-auto">
          <Building className="h-12 w-12 mx-auto text-slate-650 mb-4" />
          <h3 className="text-lg font-bold text-white">No Companies Found</h3>
          <p className="text-sm text-slate-400 mt-2">
            No companies matching your search filters were found. Try another query.
          </p>
          {search && (
            <button
              onClick={handleClearSearch}
              className="mt-6 rounded-xl bg-purple-650 px-5 py-2.5 text-sm font-semibold hover:bg-purple-600 transition-colors shadow-lg shadow-purple-650/20"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((companyWrapper) => (
              <CompanyCard
                key={companyWrapper.company?._id || companyWrapper._id}
                company={companyWrapper}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Companies;
