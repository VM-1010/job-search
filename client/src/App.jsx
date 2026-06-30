import { ClerkProvider, SignedIn, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing          from '@/pages/Landing';
import Dashboard        from '@/pages/Dashboard';
import Jobs             from '@/pages/Jobs';
import Applications     from '@/pages/Applications';
import Profile          from '@/pages/Profile';
import EmpDashboard     from '@/pages/EmpDashboard';
import Listings         from '@/pages/Listings';
import ListingDetails   from '@/pages/ListingDetails';
import CompanyProfile   from '@/pages/CompanyProfile';
import ApplicantProfile from '@/pages/ApplicantProfile';

import UserLayout     from '@/layouts/UserLayout';
import EmployerLayout from '@/layouts/EmployerLayout';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');
}

// Guard: wraps a route so unauthenticated users are redirected to sign-in
function Protected({ children }) {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />

          {/* User routes */}
          <Route
            element={
              <SignedIn>
                <UserLayout />
              </SignedIn>
            }
          >
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/jobs"         element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile"      element={<Profile />} />
          </Route>

          {/* Employer routes */}
          <Route
            element={
              <SignedIn>
                <EmployerLayout />
              </SignedIn>
            }
          >
            <Route path="/emp/dashboard"          element={<EmpDashboard />} />
            <Route path="/emp/listings"           element={<Listings />} />
            <Route path="/emp/listings/new"       element={<Listings />} />
            <Route path="/emp/listings/:id"       element={<ListingDetails />} />
            <Route path="/emp/listings/:id/edit"  element={<ListingDetails />} />
            <Route path="/emp/profile"            element={<CompanyProfile />} />
            <Route path="/emp/applicant/:userId"  element={<ApplicantProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}
