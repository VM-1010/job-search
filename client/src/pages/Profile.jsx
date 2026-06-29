import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Briefcase,
  BookOpen,
  FolderGit,
  Award,
  Globe,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  FileText,
  Camera,
  X
} from 'lucide-react';

const Profile = () => {
  const { checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // State to hold modal configurations for CRUD operations
  // If null, no modal is open. Otherwise, { type: 'education|experience|etc', action: 'add|edit', data?: currentItem }
  const [modalConfig, setModalConfig] = useState(null);

  // Fetch full user profile
  const { data: profileResponse, isLoading, isError, error } = useQuery({
    queryKey: ['users', 'profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    }
  });

  const profileData = profileResponse || {};
  const { name, email, profile = {} } = profileData;
  const {
    headline = '',
    about = '',
    location = '',
    profilePicture = '',
    profilePhoto = '',
    education = [],
    experience = [],
    certifications = [],
    projects = [],
    skills = [],
    languages = [],
    resume = ''
  } = profile;

  // Mutation helper for profile changes
  const profileMutation = useMutation({
    mutationFn: async ({ url, method, body }) => {
      const response = await api({ url, method, data: body });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user'] });
      checkAuth(); // Update Auth Context user details
      addToast(data.message || 'Profile updated successfully', 'success');
      setModalConfig(null);
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading your professional profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Profile Failed to Load</h1>
        <p className="mt-4 max-w-md text-slate-400">
          {error?.response?.data?.message || error?.message || 'Could not load profile configuration.'}
        </p>
      </div>
    );
  }

  // Safe Date Converter for Inputs (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const displayDateRange = (start, end, current) => {
    const format = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    };
    const startFmt = format(start) || 'N/A';
    if (current) return `${startFmt} - Present`;
    const endFmt = format(end) || 'N/A';
    return `${startFmt} - ${endFmt}`;
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scalar Profile Overview */}
        <div className="space-y-6">
          {/* Card Overview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Profile Picture */}
            <div className="relative mx-auto h-24 w-24 rounded-full border-2 border-indigo-500/35 overflow-hidden flex items-center justify-center bg-slate-950 shadow-xl group">
              {(profilePicture || profilePhoto) ? (
                <img
                  src={profilePicture || profilePhoto}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-indigo-400">{getInitials(name)}</span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white mt-4">{name}</h2>
            <p className="text-xs text-indigo-400 font-semibold mt-1 uppercase tracking-wider">{headline || 'Add professional headline'}</p>
            
            <div className="mt-5 border-t border-slate-850 pt-4 flex flex-col gap-2.5 text-sm text-slate-450">
              <div className="flex items-center justify-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-650" />
                <span>{location || 'Specify location'}</span>
              </div>
              <div className="text-xs text-slate-500">{email}</div>
            </div>

            {/* Resume button */}
            <div className="mt-6 border-t border-slate-850 pt-4">
              {resume ? (
                <a
                  href={resume}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 border border-slate-850 py-2.5 text-xs font-bold hover:bg-slate-900 transition-all text-slate-300"
                >
                  <FileText className="h-4 w-4 text-indigo-400" />
                  View Resume
                </a>
              ) : (
                <span className="text-xs text-slate-500 italic">No resume linked. Add your resume URL below.</span>
              )}
            </div>

            <button
              onClick={() => setModalConfig({ type: 'scalars' })}
              className="mt-6 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Profile Details
            </button>
          </div>

          {/* Preferences Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-850">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Job Preferences</h3>
              <button 
                onClick={() => setModalConfig({ type: 'preferences' })}
                className="text-indigo-400 hover:text-indigo-300 transition-colors p-1"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 text-xs font-medium">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Job Types</span>
                {profile.preferences?.jobTypes?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.preferences.jobTypes.map((type, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-300">{type}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-500 italic">No preference set</span>}
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Preferred Locations</span>
                {profile.preferences?.locations?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.preferences.locations.map((loc, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-300">{loc}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-500 italic">No preference set</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Sections and Subdocuments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm relative">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-400" />
                About Me
              </h3>
              <button
                onClick={() => setModalConfig({ type: 'about' })}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {about || 'Write a summary description about your career, goals, and passions...'}
            </p>
          </div>

          {/* Experience CRUD Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center pb-3 mb-5 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-400" />
                Work Experience
              </h3>
              <button
                onClick={() => setModalConfig({ type: 'experience', action: 'add' })}
                className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 p-1.5 rounded-xl border border-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {experience.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm italic">No experience listed. Add experience history.</div>
            ) : (
              <div className="space-y-6">
                {experience.map((exp) => (
                  <div key={exp._id} className="relative pl-6 border-l border-slate-800 group/item">
                    <div className="absolute left-0 top-1.5 -ml-1.5 h-3 w-3 rounded-full bg-slate-800 border-2 border-indigo-500 group-hover/item:bg-indigo-500 transition-colors" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug">{exp.position}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-indigo-400 font-medium">
                          <span>{exp.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-xs text-slate-400 font-normal">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {exp.location}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-650" />
                          {displayDateRange(exp.startDate, exp.endDate, exp.current)}
                        </span>
                        {exp.description && (
                          <p className="text-xs text-slate-405 mt-3 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalConfig({ type: 'experience', action: 'edit', data: exp })}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-850"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete experience?')) {
                              profileMutation.mutate({
                                url: `/users/profile/experience/${exp._id}`,
                                method: 'DELETE'
                              });
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-850"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education CRUD Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center pb-3 mb-5 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                Education
              </h3>
              <button
                onClick={() => setModalConfig({ type: 'education', action: 'add' })}
                className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 p-1.5 rounded-xl border border-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {education.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm italic">No education history listed. Add education credentials.</div>
            ) : (
              <div className="space-y-6">
                {education.map((edu) => (
                  <div key={edu._id} className="relative pl-6 border-l border-slate-800 group/item">
                    <div className="absolute left-0 top-1.5 -ml-1.5 h-3 w-3 rounded-full bg-slate-800 border-2 border-indigo-500 group-hover/item:bg-indigo-500 transition-colors" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug">{edu.school}</h4>
                        <p className="text-xs text-indigo-400 font-semibold mt-1">
                          {edu.degree || 'Degree'} • {edu.fieldOfStudy || 'Field of Study'}
                        </p>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-650" />
                          {displayDateRange(edu.startDate, edu.endDate, false)}
                        </span>
                        {edu.description && (
                          <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalConfig({ type: 'education', action: 'edit', data: edu })}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-850"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete education entry?')) {
                              profileMutation.mutate({
                                url: `/users/profile/education/${edu._id}`,
                                method: 'DELETE'
                              });
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-850"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects CRUD Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center pb-3 mb-5 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderGit className="h-5 w-5 text-indigo-400" />
                Featured Projects
              </h3>
              <button
                onClick={() => setModalConfig({ type: 'projects', action: 'add' })}
                className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 p-1.5 rounded-xl border border-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm italic">No projects listed. Add your projects.</div>
            ) : (
              <div className="space-y-6">
                {projects.map((proj) => (
                  <div key={proj._id} className="relative pl-6 border-l border-slate-800 group/item">
                    <div className="absolute left-0 top-1.5 -ml-1.5 h-3 w-3 rounded-full bg-slate-800 border-2 border-indigo-500 group-hover/item:bg-indigo-500 transition-colors" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug flex items-center gap-2">
                          {proj.title}
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-455 hover:text-indigo-350">
                              <LinkIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </h4>
                        <span className="text-xs text-slate-550 flex items-center gap-1.5 mt-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-650" />
                          {displayDateRange(proj.startDate, proj.endDate, false)}
                        </span>
                        {proj.description && (
                          <p className="text-xs text-slate-400 mt-2.5 whitespace-pre-wrap leading-relaxed">{proj.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalConfig({ type: 'projects', action: 'edit', data: proj })}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-850"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete project?')) {
                              profileMutation.mutate({
                                url: `/users/profile/projects/${proj._id}`,
                                method: 'DELETE'
                              });
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-850"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications CRUD Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center pb-3 mb-5 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" />
                Certifications
              </h3>
              <button
                onClick={() => setModalConfig({ type: 'certifications', action: 'add' })}
                className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 p-1.5 rounded-xl border border-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {certifications.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm italic">No certifications listed. Add credentials.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <div key={cert._id} className="rounded-xl border border-slate-850 bg-slate-950/45 p-4 flex justify-between items-start group/cert">
                    <div>
                      <h4 className="font-bold text-white text-sm">{cert.name}</h4>
                      <p className="text-xs text-indigo-400 mt-0.5">{cert.issuer}</p>
                      <div className="mt-2 space-y-1 text-[11px] text-slate-500 font-medium">
                        <span>Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</span>
                        {cert.expirationDate && (
                          <span className="block">Expires: {new Date(cert.expirationDate).toLocaleDateString()}</span>
                        )}
                        {cert.credentialId && <span className="block">ID: {cert.credentialId}</span>}
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:underline mt-2.5"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Show Credential
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover/cert:opacity-100 transition-opacity">
                      <button
                        onClick={() => setModalConfig({ type: 'certifications', action: 'edit', data: cert })}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-850"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete certification?')) {
                            profileMutation.mutate({
                              url: `/users/profile/certifications/${cert._id}`,
                              method: 'DELETE'
                            });
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-850"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills and Languages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Skills CRUD */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-850">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-indigo-400" />
                  Skills
                </h3>
                <button
                  onClick={() => setModalConfig({ type: 'skills', action: 'add' })}
                  className="text-indigo-400 hover:text-indigo-300 p-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {skills.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs italic">No skills listed.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div
                      key={skill._id}
                      className="group flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 pl-3.5 pr-2.5 py-1.5 text-xs text-slate-200 hover:border-indigo-500/50 hover:bg-slate-850/50 transition-all font-semibold"
                    >
                      <span>{skill.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({skill.level})</span>
                      <div className="flex items-center gap-0.5 ml-1 border-l border-slate-800 pl-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalConfig({ type: 'skills', action: 'edit', data: skill })}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            profileMutation.mutate({
                              url: `/users/profile/skills/${skill._id}`,
                              method: 'DELETE'
                            });
                          }}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Languages CRUD */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-850">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-indigo-400" />
                  Languages
                </h3>
                <button
                  onClick={() => setModalConfig({ type: 'languages', action: 'add' })}
                  className="text-indigo-400 hover:text-indigo-300 p-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {languages.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs italic">No languages listed.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <div
                      key={lang._id}
                      className="group flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 pl-3.5 pr-2.5 py-1.5 text-xs text-slate-200 hover:border-indigo-500/50 hover:bg-slate-850/50 transition-all font-semibold"
                    >
                      <span>{lang.language}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({lang.proficiency})</span>
                      <div className="flex items-center gap-0.5 ml-1 border-l border-slate-800 pl-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalConfig({ type: 'languages', action: 'edit', data: lang })}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            profileMutation.mutate({
                              url: `/users/profile/languages/${lang._id}`,
                              method: 'DELETE'
                            });
                          }}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* CRUD Edit Modals */}
      {modalConfig && (
        <ModalWrapper config={modalConfig} onClose={() => setModalConfig(null)} onSave={profileMutation.mutate} scalars={profile} />
      )}
    </div>
  );
};

// Unified Modal component to render forms based on target resource
const ModalWrapper = ({ config, onClose, onSave, scalars }) => {
  const { type, action, data = {} } = config;
  
  // Local form states
  const [fields, setFields] = useState(() => {
    if (type === 'scalars') {
      return {
        headline: scalars.headline || '',
        location: scalars.location || '',
        resume: scalars.resume || '',
        profilePicture: scalars.profilePicture || scalars.profilePhoto || ''
      };
    }
    if (type === 'about') {
      return { about: scalars.about || '' };
    }
    if (type === 'preferences') {
      return {
        jobTypes: scalars.preferences?.jobTypes?.join(', ') || '',
        locations: scalars.preferences?.locations?.join(', ') || ''
      };
    }
    if (type === 'education') {
      return {
        school: data.school || '',
        degree: data.degree || '',
        fieldOfStudy: data.fieldOfStudy || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        description: data.description || ''
      };
    }
    if (type === 'experience') {
      return {
        company: data.company || '',
        position: data.position || '',
        location: data.location || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        current: data.current || false,
        description: data.description || ''
      };
    }
    if (type === 'projects') {
      return {
        title: data.title || '',
        link: data.link || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        description: data.description || ''
      };
    }
    if (type === 'certifications') {
      return {
        name: data.name || '',
        issuer: data.issuer || '',
        issueDate: data.issueDate ? data.issueDate.split('T')[0] : '',
        expirationDate: data.expirationDate ? data.expirationDate.split('T')[0] : '',
        credentialId: data.credentialId || '',
        credentialUrl: data.credentialUrl || ''
      };
    }
    if (type === 'skills') {
      return {
        name: data.name || '',
        level: data.level || 'Intermediate'
      };
    }
    if (type === 'languages') {
      return {
        language: data.language || '',
        proficiency: data.proficiency || 'Conversational'
      };
    }
    return {};
  });

  const [validationError, setValidationError] = useState('');

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFields(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Validations & Format Body
    let body = {};
    let url = `/users/profile/${type}`;
    let method = action === 'add' ? 'POST' : 'PUT';

    if (type === 'scalars') {
      // Headline is updated first, and location, resume, picture via loop or separate endpoint
      // We will perform multiple calls if multiple fields changed, or single call for scalars.
      // Wait, let's look at the mapping: the endpoint updates individual scalars:
      // PUT /api/users/profile/headline
      // PUT /api/users/profile/about
      // PUT /api/users/profile/location
      // PUT /api/users/profile/resume
      // PUT /api/users/profile/picture
      // We can update them sequentially or allow editing one scalar card at a time.
      // Let's implement individual sequential updates or a single trigger.
      // Since profileMutation handles one request, we can write a promise helper that updates changed keys!
      // But let's build the form so that it handles saving all of them sequentially:
      const changedFields = [];
      if (fields.headline.trim() !== (scalars.headline || '')) {
        changedFields.push({ url: '/users/profile/headline', body: { headline: fields.headline.trim() } });
      }
      if (fields.location.trim() !== (scalars.location || '')) {
        changedFields.push({ url: '/users/profile/location', body: { location: fields.location.trim() } });
      }
      if (fields.resume.trim() !== (scalars.resume || '')) {
        changedFields.push({ url: '/users/profile/resume', body: { resume: fields.resume.trim() } });
      }
      if (fields.profilePicture.trim() !== (scalars.profilePicture || scalars.profilePhoto || '')) {
        changedFields.push({ url: '/users/profile/picture', body: { profilePicture: fields.profilePicture.trim() } });
      }

      if (changedFields.length === 0) {
        onClose();
        return;
      }

      // Execute updates sequentially
      const saveScalars = async () => {
        try {
          for (const item of changedFields) {
            await api.put(item.url, item.body);
          }
          onSave({ url: '/users/profile/headline', method: 'PUT', body: { headline: fields.headline.trim() } }); // trigger invalidation
        } catch (err) {
          setValidationError(err.response?.data?.message || 'Error updating profile details');
        }
      };
      saveScalars();
      return;
    }

    if (type === 'about') {
      if (fields.about.trim().length === 0) {
        setValidationError('About section cannot be empty.');
        return;
      }
      url = '/users/profile/about';
      body = { about: fields.about.trim() };
    }

    if (type === 'preferences') {
      url = '/users/profile/preferences';
      body = {
        preferences: {
          jobTypes: fields.jobTypes ? fields.jobTypes.split(',').map(s => s.trim()).filter(Boolean) : [],
          locations: fields.locations ? fields.locations.split(',').map(s => s.trim()).filter(Boolean) : []
        }
      };
    }

    if (type === 'education') {
      if (!fields.school.trim()) {
        setValidationError('School/University name is required.');
        return;
      }
      if (fields.endDate && fields.startDate && new Date(fields.endDate) < new Date(fields.startDate)) {
        setValidationError('End date must be after start date.');
        return;
      }
      body = {
        school: fields.school.trim(),
        degree: fields.degree.trim(),
        fieldOfStudy: fields.fieldOfStudy.trim(),
        description: fields.description.trim(),
        startDate: fields.startDate ? new Date(fields.startDate).toISOString() : undefined,
        endDate: fields.endDate ? new Date(fields.endDate).toISOString() : undefined
      };
      if (action === 'edit') {
        url = `/users/profile/education/${data._id}`;
      }
    }

    if (type === 'experience') {
      if (!fields.company.trim()) {
        setValidationError('Company name is required.');
        return;
      }
      if (!fields.position.trim()) {
        setValidationError('Job Title/Position is required.');
        return;
      }
      if (!fields.current && fields.endDate && fields.startDate && new Date(fields.endDate) < new Date(fields.startDate)) {
        setValidationError('End date must be after start date.');
        return;
      }
      body = {
        company: fields.company.trim(),
        position: fields.position.trim(),
        location: fields.location.trim(),
        current: fields.current,
        description: fields.description.trim(),
        startDate: fields.startDate ? new Date(fields.startDate).toISOString() : undefined,
        endDate: (!fields.current && fields.endDate) ? new Date(fields.endDate).toISOString() : undefined
      };
      if (action === 'edit') {
        url = `/users/profile/experience/${data._id}`;
      }
    }

    if (type === 'projects') {
      if (!fields.title.trim()) {
        setValidationError('Project title is required.');
        return;
      }
      if (fields.endDate && fields.startDate && new Date(fields.endDate) < new Date(fields.startDate)) {
        setValidationError('End date must be after start date.');
        return;
      }
      body = {
        title: fields.title.trim(),
        description: fields.description.trim(),
        link: fields.link.trim(),
        startDate: fields.startDate ? new Date(fields.startDate).toISOString() : undefined,
        endDate: fields.endDate ? new Date(fields.endDate).toISOString() : undefined
      };
      if (action === 'edit') {
        url = `/users/profile/projects/${data._id}`;
      }
    }

    if (type === 'certifications') {
      if (!fields.name.trim()) {
        setValidationError('Certification name is required.');
        return;
      }
      body = {
        name: fields.name.trim(),
        issuer: fields.issuer.trim(),
        credentialId: fields.credentialId.trim(),
        credentialUrl: fields.credentialUrl.trim(),
        issueDate: fields.issueDate ? new Date(fields.issueDate).toISOString() : undefined,
        expirationDate: fields.expirationDate ? new Date(fields.expirationDate).toISOString() : undefined
      };
      if (action === 'edit') {
        url = `/users/profile/certifications/${data._id}`;
      }
    }

    if (type === 'skills') {
      if (!fields.name.trim()) {
        setValidationError('Skill name is required.');
        return;
      }
      body = {
        name: fields.name.trim(),
        level: fields.level
      };
      if (action === 'edit') {
        url = `/users/profile/skills/${data._id}`;
      }
    }

    if (type === 'languages') {
      if (!fields.language.trim()) {
        setValidationError('Language is required.');
        return;
      }
      body = {
        language: fields.language.trim(),
        proficiency: fields.proficiency
      };
      if (action === 'edit') {
        url = `/users/profile/languages/${data._id}`;
      }
    }

    onSave({ url, method, body });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl border border-slate-850 bg-slate-900 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6 capitalize">
          {action ? `${action} ${type}` : `Edit ${type}`}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Render forms conditionally based on type */}

          {type === 'scalars' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Professional Headline</label>
                <input
                  type="text"
                  name="headline"
                  value={fields.headline}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="Senior Software Engineer | MERN Developer"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Location</label>
                <input
                  type="text"
                  name="location"
                  value={fields.location}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="San Francisco, CA (or Remote)"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Resume Link / Drive URL</label>
                <input
                  type="text"
                  name="resume"
                  value={fields.resume}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Photo URL</label>
                <input
                  type="text"
                  name="profilePicture"
                  value={fields.profilePicture}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </>
          )}

          {type === 'about' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">About summary</label>
              <textarea
                name="about"
                rows={6}
                value={fields.about}
                onChange={handleTextChange}
                className="block w-full rounded-xl border border-slate-805 bg-slate-955 p-4 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Talk about your career history, developer toolkit, and major projects..."
              />
            </div>
          )}

          {type === 'preferences' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Job Types (comma separated)</label>
                <input
                  type="text"
                  name="jobTypes"
                  value={fields.jobTypes}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="Full-time, Remote, Contract"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Locations (comma separated)</label>
                <input
                  type="text"
                  name="locations"
                  value={fields.locations}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="San Francisco, New York, Tokyo"
                />
              </div>
            </>
          )}

          {type === 'education' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">School / University</label>
                <input
                  type="text"
                  name="school"
                  required
                  value={fields.school}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="Stanford University"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={fields.degree}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Field of Study</label>
                  <input
                    type="text"
                    name="fieldOfStudy"
                    value={fields.fieldOfStudy}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                    placeholder="Computer Science"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={fields.startDate}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={fields.endDate}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={fields.description}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-955 p-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Relevant courses, academic achievements, extra activities..."
                />
              </div>
            </>
          )}

          {type === 'experience' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={fields.company}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                    placeholder="Google"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Job Title / Position</label>
                  <input
                    type="text"
                    name="position"
                    required
                    value={fields.position}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Location</label>
                <input
                  type="text"
                  name="location"
                  value={fields.location}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="Mountain View, CA"
                />
              </div>
              <div className="flex items-center gap-2.5 py-1.5">
                <input
                  type="checkbox"
                  id="current"
                  name="current"
                  checked={fields.current}
                  onChange={handleCheckboxChange}
                  className="h-4.5 w-4.5 rounded border-slate-805 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="current" className="text-sm font-semibold text-slate-300 select-none">I am currently working in this role</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={fields.startDate}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                {!fields.current && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={fields.endDate}
                      onChange={handleTextChange}
                      className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Role Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={fields.description}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-955 p-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Describe your responsibilities, metrics achieved, and stacks utilized..."
                />
              </div>
            </>
          )}

          {type === 'projects' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={fields.title}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="E-commerce Analytics Suite"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Link</label>
                <input
                  type="text"
                  name="link"
                  value={fields.link}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="https://github.com/username/project"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={fields.startDate}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={fields.endDate}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={fields.description}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-955 p-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Explain what the project does, tech stack used, and your contribution..."
                />
              </div>
            </>
          )}

          {type === 'certifications' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Certification Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={fields.name}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Issuing Organization / Issuer</label>
                <input
                  type="text"
                  name="issuer"
                  value={fields.issuer}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="Amazon Web Services"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Credential ID</label>
                  <input
                    type="text"
                    name="credentialId"
                    value={fields.credentialId}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                    placeholder="AWS-123456"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Credential URL</label>
                  <input
                    type="text"
                    name="credentialUrl"
                    value={fields.credentialUrl}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                    placeholder="https://credly.com/..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={fields.issueDate}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={fields.expirationDate}
                    onChange={handleTextChange}
                    className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === 'skills' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Skill Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={fields.name}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="React"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Proficiency Level</label>
                <select
                  name="level"
                  value={fields.level}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </>
          )}

          {type === 'languages' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Language</label>
                <input
                  type="text"
                  name="language"
                  required
                  value={fields.language}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                  placeholder="English"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Proficiency Level</label>
                <select
                  name="proficiency"
                  value={fields.proficiency}
                  onChange={handleTextChange}
                  className="block w-full rounded-xl border border-slate-805 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 justify-end mt-8 border-t border-slate-850 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
