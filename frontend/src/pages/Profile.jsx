import { useState, useEffect } from 'react';
import { User, Save, CheckCircle, Upload, Briefcase, GraduationCap, MapPin, Phone, Mail, Link as LinkIcon } from 'lucide-react';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';

export default function Profile() {
  const { user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'prefer_not_to_say',
    address: '',
    bio: '',
    department: '',
    register_number: '',
    course_name: '',
    year_of_study: 1,
    semester: 1,
    batch_year: new Date().getFullYear(),
    cgpa: '',
    career_objective: '',
    career_interest: '',
    preferred_job_role: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    avatar: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, deptsRes] = await Promise.all([
        api.get('students/profile/'),
        api.get('students/departments/')
      ]);
      
      const p = profileRes.data;
      setProfileData(p);
      setDepartments(deptsRes.data.results || deptsRes.data);
      
      setFormData({
        first_name: p.user?.first_name || '',
        last_name: p.user?.last_name || '',
        phone: p.user?.phone || '',
        date_of_birth: p.user?.date_of_birth || '',
        gender: p.user?.gender || 'prefer_not_to_say',
        address: p.user?.address || '',
        bio: p.user?.bio || '',
        department: p.department || '',
        register_number: p.register_number || '',
        course_name: p.course_name || '',
        year_of_study: p.year_of_study || 1,
        semester: p.semester || 1,
        batch_year: p.batch_year || new Date().getFullYear(),
        cgpa: p.cgpa || '',
        career_objective: p.career_objective || '',
        career_interest: p.career_interest || '',
        preferred_job_role: p.preferred_job_role || '',
        linkedin_url: p.linkedin_url || '',
        github_url: p.github_url || '',
        portfolio_url: p.portfolio_url || '',
        avatar: null
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'avatar' && formData[key]) {
          data.append(key, formData[key]);
        } else if (key !== 'avatar' && formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      
      await api.patch('students/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Profile updated successfully!');
      fetchProfile(); // Update auth store
      fetchData(); // Refresh local state
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-8 w-8 text-blue-500" />
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your personal and academic information.</p>
        </div>
        <div className="flex items-center gap-3">
          {profileData?.profile_completion && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion</span>
              <div className="w-24 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${profileData.profile_completion > 80 ? 'bg-green-500' : profileData.profile_completion > 50 ? 'bg-blue-500' : 'bg-yellow-500'}`} 
                  style={{ width: `${profileData.profile_completion}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{profileData.profile_completion}%</span>
            </div>
          )}
        </div>
      </div>
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="card p-6 border-t-4 border-t-blue-500">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" /> Personal Information
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg relative">
                {profileData?.user?.avatar ? (
                  <img src={profileData.user.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    <User className="h-16 w-16" />
                  </div>
                )}
              </div>
              <label className="btn btn-secondary py-1.5 px-3 text-sm cursor-pointer w-full text-center">
                <Upload className="h-4 w-4 mr-1.5 inline" /> Upload Photo
                <input type="file" name="avatar" accept="image/*" onChange={handleInputChange} className="hidden" />
              </label>
              {formData.avatar && <span className="text-xs text-green-600 truncate w-32 text-center">{formData.avatar.name}</span>}
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">First Name *</label>
                <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className="input" />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className="input" />
              </div>
              <div>
                <label className="label">Email (Read Only)</label>
                <input type="email" value={profileData?.user?.email || ''} readOnly className="input bg-slate-50 dark:bg-slate-800 text-slate-500" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input pl-9" placeholder="+1..." />
                </div>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="input" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="label flex items-center gap-2"><MapPin className="h-4 w-4" /> Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} className="input" rows="2"></textarea>
            </div>
            <div>
              <label className="label">Professional Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="input" rows="3" placeholder="A short description about yourself..."></textarea>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="card p-6 border-t-4 border-t-emerald-500">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-500" /> Academic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="label">Register/Roll Number</label>
              <input type="text" name="register_number" value={formData.register_number} onChange={handleInputChange} className="input" />
            </div>
            <div>
              <label className="label">Department</label>
              <select name="department" value={formData.department} onChange={handleInputChange} className="input">
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Course/Degree Name</label>
              <input type="text" name="course_name" value={formData.course_name} onChange={handleInputChange} className="input" placeholder="e.g. B.Tech Computer Science" />
            </div>
            <div>
              <label className="label">Year of Study</label>
              <select name="year_of_study" value={formData.year_of_study} onChange={handleInputChange} className="input">
                {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange} className="input">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Batch Year (Graduation)</label>
              <input type="number" name="batch_year" value={formData.batch_year} onChange={handleInputChange} className="input" />
            </div>
            <div>
              <label className="label">CGPA / Percentage</label>
              <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleInputChange} className="input" placeholder="e.g. 8.5" />
            </div>
          </div>
        </div>

        {/* Career & Social */}
        <div className="card p-6 border-t-4 border-t-purple-500">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-500" /> Career & Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label">Career Interest / Specialization</label>
              <input type="text" name="career_interest" value={formData.career_interest} onChange={handleInputChange} className="input" placeholder="e.g. Machine Learning, Web Dev" />
            </div>
            <div>
              <label className="label">Preferred Job Role</label>
              <input type="text" name="preferred_job_role" value={formData.preferred_job_role} onChange={handleInputChange} className="input" placeholder="e.g. Frontend Engineer" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Career Objective</label>
              <textarea name="career_objective" value={formData.career_objective} onChange={handleInputChange} className="input" rows="2" placeholder="What are your career goals?"></textarea>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">LinkedIn URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="input pl-9" placeholder="https://linkedin.com/in/..." />
              </div>
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="url" name="github_url" value={formData.github_url} onChange={handleInputChange} className="input pl-9" placeholder="https://github.com/..." />
              </div>
            </div>
            <div>
              <label className="label">Portfolio Website URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleInputChange} className="input pl-9" placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12 gap-4">
          <button type="submit" disabled={submitting} className="btn btn-primary px-8 shadow-lg shadow-primary-500/30 text-lg py-3 rounded-xl">
            {submitting ? 'Saving Changes...' : <><Save className="h-5 w-5 mr-2" /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
}
