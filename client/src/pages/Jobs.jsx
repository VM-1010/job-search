import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import { Briefcase, AlertCircle, SlidersHorizontal, X } from 'lucide-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read URL params or set default values
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';
  const employmentType = searchParams.get('employmentType') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;

  // React Query fetch jobs
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ['jobs', { search, location, category, employmentType, page }],
    queryFn: async () => {
      const response = await api.get('/jobs', {
        params: { search, location, category, employmentType, page, limit }
      });
      return response.data;
    },
    placeholderData: (prev) => prev
  });

  const jobs = data?.jobs || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  // Sync state helpers that update URL parameters
  const updateParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Always reset page to 1 when filters or search inputs change
    if (newParams.page === undefined) {
      nextParams.set('page', '1');
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value.toString());
      } else {
        nextParams.delete(key);
      }
    });

    setSearchParams(nextParams);
  };

  const handleSearch = ({ search: s, location: l }) => {
    updateParams({ search: s, location: l });
  };

  const handleFilterChange = (filters) => {
    updateParams({
      category: filters.category,
      location: filters.location,
      employmentType: filters.employmentType
    });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      {/* Search Header Area */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Search Developer & Tech Jobs
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Find your next role with verified salaries and immutable recruiter details.
        </p>
        
        {/* Search Bar */}
        <div className="mt-6">
          <SearchBar initialSearch={search} initialLocation={location} onSearch={handleSearch} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Mobile Filters Toggle & Result Count */}
        <div className="flex lg:hidden items-center justify-between w-full border-b border-slate-850 pb-4 mb-2">
          <span className="text-sm text-slate-400 font-medium">
            Found <span className="text-white font-bold">{total}</span> jobs
          </span>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            Filters
          </button>
        </div>

        {/* Mobile Filters Slide-Over Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-slate-900 border-l border-slate-800 p-6 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <FilterPanel
                filters={{ category, location, employmentType }}
                onFilterChange={(f) => {
                  handleFilterChange(f);
                  setMobileFiltersOpen(false);
                }}
                onClearFilters={() => {
                  handleClearFilters();
                  setMobileFiltersOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Desktop Filter Panel (Left Column) */}
        <div className="hidden lg:block w-80 shrink-0">
          <FilterPanel
            filters={{ category, location, employmentType }}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Jobs List Area (Right Column) */}
        <div className="flex-grow w-full">
          {/* Desktop Result Count */}
          <div className="hidden lg:flex items-center justify-between border-b border-slate-850 pb-4 mb-6">
            <span className="text-sm text-slate-400 font-medium">
              We found <span className="text-white font-bold">{total}</span> opportunities matching your criteria
            </span>
          </div>

          {isLoading ? (
            /* Loading State Skeleton list */
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            /* Error State */
            <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-8 text-center text-red-400 flex flex-col items-center gap-4">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Failed to Load Listings</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {error?.message || 'A network error occurred while retrieving job postings.'}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-semibold hover:bg-red-500/20 transition-all border border-red-500/20"
              >
                Retry Request
              </button>
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-16 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-slate-650 mb-4" />
              <h3 className="text-lg font-bold text-white">No Jobs Found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
                We couldn't find any job opportunities matching your search or filters. Try adjusting your query parameters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* Jobs List Grid */
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
