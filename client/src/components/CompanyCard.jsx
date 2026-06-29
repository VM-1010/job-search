import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Briefcase, Users, ArrowRight } from 'lucide-react';

const CompanyCard = ({ company }) => {
  if (!company) return null;

  // Handle both nested and flat structure robustly
  const companyData = company.company ? company.company : company;
  const activeJobsCount = company.activeJobsCount !== undefined ? company.activeJobsCount : 0;
  const recruiterCount = company.recruiterCount !== undefined ? company.recruiterCount : 0;

  const {
    _id,
    companyName = 'Unknown Company',
    logo = '',
    industry = 'Technology',
    headquarters = 'Remote',
    companySize = ''
  } = companyData;

  const getCompanyInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-all duration-300 hover:bg-slate-900/80 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        {/* Logo Container */}
        <Link to={`/company/${_id}`} className="flex-shrink-0">
          {logo && logo !== '' ? (
            <img
              src={logo}
              alt={companyName}
              className="h-14 w-14 rounded-2xl object-cover border border-slate-850 bg-slate-950"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {(!logo || logo === '') ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-base">
              {getCompanyInitials(companyName)}
            </div>
          ) : (
            <div style={{ display: 'none' }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-base">
              {getCompanyInitials(companyName)}
            </div>
          )}
        </Link>

        {/* Text Info */}
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors text-lg truncate">
            <Link to={`/company/${_id}`}>{companyName}</Link>
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-0.5">{industry}</p>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{headquarters}</span>
            {companySize && (
              <>
                <span className="text-slate-700">•</span>
                <span className="truncate">{companySize} employees</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics info & link */}
      <div className="flex items-center justify-between border-t border-slate-850 mt-5 pt-4">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-indigo-400/80" />
            <span>
              <strong className="text-white font-semibold">{activeJobsCount}</strong> open jobs
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-purple-400/80" />
            <span>
              <strong className="text-white font-semibold">{recruiterCount}</strong> recruiters
            </span>
          </div>
        </div>

        <Link
          to={`/company/${_id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/30 transition-all duration-300"
        >
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
