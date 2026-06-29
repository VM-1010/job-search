import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isSeeker, isRecruiter } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          JobHub
        </Link>

        <div className="navbar-links">
          <Link to="/jobs" className="navbar-link">
            Jobs
          </Link>

          {isAuthenticated ? (
            <>
              {isSeeker && (
                <>
                  <Link to="/dashboard/seeker" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="navbar-link">
                    Profile
                  </Link>
                  <Link to="/applications" className="navbar-link">
                    My Applications
                  </Link>
                </>
              )}

              {isRecruiter && (
                <>
                  <Link to="/dashboard/recruiter" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/jobs/post" className="navbar-link">
                    Post Job
                  </Link>
                  <Link to="/applications/recruiter" className="navbar-link">
                    Applications
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
