import { useState, useEffect } from 'react';
import { Award, BookOpen, Briefcase, Star, ChevronRight, Activity, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name}` : "Student",
    profileCompletion: 0,
    readinessScore: 0,
    stats: [
      { label: 'Total Skills', value: 0, route: '/skills', icon: <Star className="text-yellow-500 h-6 w-6" />, bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
      { label: 'Certificates', value: 0, route: '/certificates', icon: <Award className="text-primary-500 h-6 w-6" />, bg: 'bg-primary-100 dark:bg-primary-900/30' },
      { label: 'Projects', value: 0, route: '/projects', icon: <BookOpen className="text-purple-500 h-6 w-6" />, bg: 'bg-purple-100 dark:bg-purple-900/30' },
      { label: 'Internships', value: 0, route: '/internships', icon: <Briefcase className="text-emerald-500 h-6 w-6" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
    ],
    recentActivities: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [profileRes, skillsRes, certsRes, projectsRes, internshipsRes] = await Promise.all([
          api.get('students/profile/'),
          api.get('skills/student/'),
          api.get('certificates/'),
          api.get('projects/'),
          api.get('internships/')
        ]);
        
        const data = profileRes.data;
        const skillsCount = skillsRes.data.results ? skillsRes.data.results.length : skillsRes.data.length || 0;
        const certsData = certsRes.data.results || certsRes.data || [];
        const certsCount = certsData.length;
        const projectsCount = projectsRes.data.results ? projectsRes.data.results.length : projectsRes.data.length || 0;
        const internshipsCount = internshipsRes.data.results ? internshipsRes.data.results.length : internshipsRes.data.length || 0;
        
        setStudentData(prev => ({
          ...prev,
          name: data.user?.first_name ? `${data.user.first_name} ${data.user.last_name}` : prev.name,
          profileCompletion: data.profile_completion || 75,
          readinessScore: Math.min(100, 20 + (skillsCount * 5) + (certsCount * 10) + (projectsCount * 15)),
          stats: [
            { label: 'Total Skills', value: skillsCount, route: '/skills', icon: <Star className="text-yellow-500 h-6 w-6" />, bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
            { label: 'Certificates', value: certsCount, route: '/certificates', icon: <Award className="text-primary-500 h-6 w-6" />, bg: 'bg-primary-100 dark:bg-primary-900/30' },
            { label: 'Projects', value: projectsCount, route: '/projects', icon: <BookOpen className="text-purple-500 h-6 w-6" />, bg: 'bg-purple-100 dark:bg-purple-900/30' },
            { label: 'Internships', value: internshipsCount, route: '/internships', icon: <Briefcase className="text-emerald-500 h-6 w-6" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
          ],
          recentCertificates: certsData.slice(0, 3), // Get latest 3
          recentActivities: []
        }));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Good Morning, {studentData.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Here's what's happening with your profile today.</p>
        </div>

        <div className="flex gap-4">
          <div className="card p-4 flex items-center gap-4 bg-gradient-to-r from-primary-50 to-white dark:from-slate-800 dark:to-slate-800 border-l-4 border-l-primary-500">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profile</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{studentData.profileCompletion}%</span>
              </div>
            </div>
            <div className="w-16 h-16 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full circular-chart">
                <path className="text-slate-200 dark:text-slate-700 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-primary-500 stroke-current" strokeDasharray={`${studentData.profileCompletion}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {studentData.stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => navigate(stat.route)}
            className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Career Readiness */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary-600 h-6 w-6" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Career Readiness</h2>
              </div>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Good Standing
              </span>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full circular-chart">
                  <path className="text-slate-200 dark:text-slate-700 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-purple-500 stroke-current" strokeDasharray={`${studentData.readinessScore}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{studentData.readinessScore}</span>
                  <span className="text-xs font-medium text-slate-500">/ 100</span>
                </div>
              </div>
              <div className="flex-grow w-full">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Recommendations to improve:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Add 2 more technical skills to reach target.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Complete your professional summary in profile.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Upload certificates for the skills you added.</span>
                  </li>
                </ul>
                <button onClick={() => navigate('/career-analysis')} className="mt-6 btn btn-secondary w-full sm:w-auto">View Detailed Analysis</button>
              </div>
            </div>
          </div>

          {/* Recent Certificates (mock) */}
          <div className="card">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Certificates</h2>
              <button onClick={() => navigate('/certificates')} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {studentData.recentCertificates && studentData.recentCertificates.length > 0 ? (
                studentData.recentCertificates.map(cert => (
                  <div key={cert.id} className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{cert.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{cert.issuing_organization} • Issued {new Date(cert.issue_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {cert.status === 'verified' ? (
                      <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    ) : cert.status === 'rejected' ? (
                      <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        Rejected
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs px-2.5 py-1 rounded-full font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-slate-500 text-sm">
                  No recent certificates found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="card">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-6">
                {studentData.recentActivities && studentData.recentActivities.length > 0 ? (
                  studentData.recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="relative mt-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10 relative shadow-sm border border-slate-200 dark:border-slate-700">
                          {activity.icon}
                        </div>
                        {idx !== studentData.recentActivities.length - 1 && (
                          <div className="absolute top-8 left-1/2 -ml-px w-0.5 h-full bg-slate-200 dark:bg-slate-700"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.message}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center">No recent activities.</p>
                )}
              </div>
              <button onClick={() => navigate('/activity')} className="w-full mt-6 text-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-2 rounded-lg transition-colors">
                View All Activity
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-gradient-to-br from-primary-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            <div className="p-6 relative z-10">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={() => navigate('/certificates')} className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-lg backdrop-blur-sm transition-colors font-medium flex justify-between items-center">
                  Upload New Certificate
                  <ChevronRight className="h-5 w-5 opacity-70" />
                </button>
                <button onClick={() => navigate('/skills')} className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-lg backdrop-blur-sm transition-colors font-medium flex justify-between items-center">
                  Add a Skill
                  <ChevronRight className="h-5 w-5 opacity-70" />
                </button>
                <button onClick={() => navigate('/profile')} className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-lg backdrop-blur-sm transition-colors font-medium flex justify-between items-center">
                  Generate Resume
                  <ChevronRight className="h-5 w-5 opacity-70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
