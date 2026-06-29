import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    headline: '',
    about: '',
    location: '',
  });
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', field: '', startDate: '', endDate: '' });
  const [newExp, setNewExp] = useState({ title: '', company: '', startDate: '', endDate: '', description: '' });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      if (data.profile) {
        setProfileData({
          headline: data.profile.headline || '',
          about: data.profile.about || '',
          location: data.profile.location || '',
        });
        setEducation(data.profile.education || []);
        setExperience(data.profile.experience || []);
        setSkills(data.profile.skills || []);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleUpdateProfile = async (field, value) => {
    setLoading(true);
    try {
      let response;
      switch (field) {
        case 'headline':
          response = await userService.updateHeadline(value);
          break;
        case 'about':
          response = await userService.updateAbout(value);
          break;
        case 'location':
          response = await userService.updateLocation(value);
          break;
        default:
          return;
      }
      
      if (response.profile) {
        updateUser({ profile: response.profile });
        setProfileData((prev) => ({ ...prev, [field]: value }));
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducation = async () => {
    if (!newEdu.school || !newEdu.degree) return;
    
    setLoading(true);
    try {
      const response = await userService.addEducation(newEdu);
      if (response.profile?.education) {
        setEducation(response.profile.education);
        setNewEdu({ school: '', degree: '', field: '', startDate: '', endDate: '' });
      }
    } catch (err) {
      alert('Failed to add education');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      const response = await userService.deleteEducation(id);
      if (response.profile?.education) {
        setEducation(response.profile.education);
      }
    } catch (err) {
      alert('Failed to delete education');
    }
  };

  const handleAddExperience = async () => {
    if (!newExp.title || !newExp.company) return;
    
    setLoading(true);
    try {
      const response = await userService.addExperience(newExp);
      if (response.profile?.experience) {
        setExperience(response.profile.experience);
        setNewExp({ title: '', company: '', startDate: '', endDate: '', description: '' });
      }
    } catch (err) {
      alert('Failed to add experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      const response = await userService.deleteExperience(id);
      if (response.profile?.experience) {
        setExperience(response.profile.experience);
      }
    } catch (err) {
      alert('Failed to delete experience');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    setLoading(true);
    try {
      const response = await userService.addSkill({ name: newSkill.trim() });
      if (response.profile?.skills) {
        setSkills(response.profile.skills);
        setNewSkill('');
      }
    } catch (err) {
      alert('Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      const response = await userService.deleteSkill(id);
      if (response.profile?.skills) {
        setSkills(response.profile.skills);
      }
    } catch (err) {
      alert('Failed to delete skill');
    }
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-sections">
        <section className="profile-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label>Headline</label>
            <input
              type="text"
              value={profileData.headline}
              onChange={(e) => setProfileData((prev) => ({ ...prev, headline: e.target.value }))}
              onBlur={(e) => handleUpdateProfile('headline', e.target.value)}
              placeholder="e.g., Software Engineer with 5 years of experience"
            />
          </div>

          <div className="form-group">
            <label>About</label>
            <textarea
              value={profileData.about}
              onChange={(e) => setProfileData((prev) => ({ ...prev, about: e.target.value }))}
              onBlur={(e) => handleUpdateProfile('about', e.target.value)}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
              onBlur={(e) => handleUpdateProfile('location', e.target.value)}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
        </section>

        <section className="profile-section">
          <h2>Skills</h2>
          <div className="skills-list">
            {skills.map((skill) => (
              <div key={skill._id} className="skill-item">
                <span>{skill.name}</span>
                <button onClick={() => handleDeleteSkill(skill._id)} className="btn-delete-sm">
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="add-item-form">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <button onClick={handleAddSkill} disabled={loading}>
              Add
            </button>
          </div>
        </section>

        <section className="profile-section">
          <h2>Education</h2>
          {education.map((edu) => (
            <div key={edu._id} className="info-item">
              <div className="info-header">
                <strong>{edu.degree}</strong>
                <button onClick={() => handleDeleteEducation(edu._id)} className="btn-delete-sm">
                  ×
                </button>
              </div>
              <p>{edu.school} {edu.field && `- ${edu.field}`}</p>
              <p className="info-dates">
                {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : '- Present'}
              </p>
            </div>
          ))}
          <div className="add-form">
            <input
              type="text"
              placeholder="School"
              value={newEdu.school}
              onChange={(e) => setNewEdu((prev) => ({ ...prev, school: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Degree"
              value={newEdu.degree}
              onChange={(e) => setNewEdu((prev) => ({ ...prev, degree: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Field of Study"
              value={newEdu.field}
              onChange={(e) => setNewEdu((prev) => ({ ...prev, field: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Start Date"
              value={newEdu.startDate}
              onChange={(e) => setNewEdu((prev) => ({ ...prev, startDate: e.target.value }))}
            />
            <input
              type="text"
              placeholder="End Date"
              value={newEdu.endDate}
              onChange={(e) => setNewEdu((prev) => ({ ...prev, endDate: e.target.value }))}
            />
            <button onClick={handleAddEducation} disabled={loading}>
              Add Education
            </button>
          </div>
        </section>

        <section className="profile-section">
          <h2>Experience</h2>
          {experience.map((exp) => (
            <div key={exp._id} className="info-item">
              <div className="info-header">
                <strong>{exp.title}</strong>
                <button onClick={() => handleDeleteExperience(exp._id)} className="btn-delete-sm">
                  ×
                </button>
              </div>
              <p>{exp.company}</p>
              <p className="info-dates">
                {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'}
              </p>
              {exp.description && <p className="info-desc">{exp.description}</p>}
            </div>
          ))}
          <div className="add-form">
            <input
              type="text"
              placeholder="Job Title"
              value={newExp.title}
              onChange={(e) => setNewExp((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Company"
              value={newExp.company}
              onChange={(e) => setNewExp((prev) => ({ ...prev, company: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Start Date"
              value={newExp.startDate}
              onChange={(e) => setNewExp((prev) => ({ ...prev, startDate: e.target.value }))}
            />
            <input
              type="text"
              placeholder="End Date"
              value={newExp.endDate}
              onChange={(e) => setNewExp((prev) => ({ ...prev, endDate: e.target.value }))}
            />
            <textarea
              placeholder="Description"
              value={newExp.description}
              onChange={(e) => setNewExp((prev) => ({ ...prev, description: e.target.value }))}
              rows="2"
            />
            <button onClick={handleAddExperience} disabled={loading}>
              Add Experience
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
