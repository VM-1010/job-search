import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Calendar, ArrowRight } from 'lucide-react';

const JobCard = ({ job }) => {
  if (!job) return null;

  const {
    _id,
    title,
    location,
    employmentType,
    experienceLevel,
    salaryRange,
    skills = [],
    company = {},
    createdAt,
    status
  } = job;

  const companyName = company.companyName || 'Unknown Company';
  const logo = company.logo;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCompanyInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isClosed = status === 'Closed';

  return (
    <div className={`group relative rounded-2xl border transition-all duration-300 backdrop-blur-sm p-6 ${
      isClosed 
        ? 'border-slate-900 bg-slate-950/40 opacity-70' 
        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5'
    }`}>
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Logo container */}
          <Link to={`/company/${company._id || ''}`} className="flex-shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={companyName}
                className="h-12 w-12 rounded-xl object-cover border border-slate-800 bg-slate-900"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {(!logo || logo === '') ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-sm">
                {getCompanyInitials(companyName)}
              </div>
            ) : (
              <div style={{ display: 'none' }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-sm">
                {getCompanyInitials(companyName)}
              </div>
            )}
          </Link>
          
          <div>
            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors text-lg">
              <Link to={`/job/${_id}`}>{title}</Link>
            </h3>
            <p className="text-sm font-medium text-slate-300 hover:text-white mt-0.5">
              <Link to={`/company/${company._id || ''}`}>{companyName}</Link>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isClosed ? (
            <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-red-400 border border-red-500/20">
              Closed
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Meta Info Grid */}
      <div className="grid grid-cols-2 gap-y-3 sm:flex sm:items-center sm:gap-x-6 mt-5 text-sm text-slate-400 border-b border-slate-850 pb-5">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-4 w-4 text-slate-500" />
          <span>{employmentType} • {experienceLevel}</span>
        </div>
        {salaryRange && (
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <span>{salaryRange}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 sm:ml-auto">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* Skills list and CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
        <div className="flex flex-wrap gap-2 max-w-[80%]">
          {skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-xs text-slate-500 font-medium self-center pl-1">
              +{skills.length - 4} more
            </span>
          )}
        </div>

        <Link
          to={`/job/${_id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/30 transition-all duration-300"
        >
          <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
