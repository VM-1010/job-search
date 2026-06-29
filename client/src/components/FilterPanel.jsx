import React from 'react';
import { Filter, X, Briefcase, MapPin, Grid } from 'lucide-react';

const CATEGORIES = [
  'Engineering',
  'Data Science',
  'Design',
  'Product Management',
  'Marketing',
  'Sales',
  'Support',
  'Human Resources',
  'Finance'
];

const LOCATIONS = [
  'Remote',
  'Hybrid',
  'On-site',
  'New York',
  'San Francisco',
  'Seattle',
  'Austin',
  'London',
  'Bangalore'
];

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary'
];

const FilterPanel = ({
  filters = { category: '', location: '', employmentType: '' },
  onFilterChange,
  onClearFilters
}) => {
  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleLocationChange = (e) => {
    onFilterChange({ ...filters, location: e.target.value });
  };

  const handleEmploymentTypeToggle = (type) => {
    // If it's already selected, clear it, otherwise select it
    const newValue = filters.employmentType === type ? '' : type;
    onFilterChange({ ...filters, employmentType: newValue });
  };

  const hasActiveFilters = filters.category || filters.location || filters.employmentType;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Filter className="h-4.5 w-4.5 text-indigo-400" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Grid className="h-3.5 w-3.5 text-slate-500" />
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={handleCategoryChange}
            className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            Location
          </label>
          <select
            value={filters.location || ''}
            onChange={handleLocationChange}
            className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type Filter */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
            Employment Type
          </label>
          <div className="space-y-2.5">
            {EMPLOYMENT_TYPES.map((type) => {
              const isChecked = filters.employmentType === type;
              return (
                <label
                  key={type}
                  className="flex items-center gap-3 text-sm text-slate-300 hover:text-white cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleEmploymentTypeToggle(type)}
                    className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/50 focus:ring-offset-slate-900 focus:ring-offset-2 transition-all cursor-pointer accent-indigo-600"
                  />
                  <span className={`transition-colors ${isChecked ? 'text-indigo-400 font-semibold' : 'group-hover:text-slate-200'}`}>
                    {type}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
