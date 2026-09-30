import { useState, useEffect } from 'react';
import { Activity, Award, Star, BookOpen, Building2, User, ArrowLeft, Bell, ShieldCheck, CheckCircle, XCircle, Plus, Edit, Trash2, LogIn, FileText, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';

const TYPE_CONFIG = {
  certificate: { icon: Award, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Certificate' },
  skill: { icon: Star, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Skill' },
  project: { icon: BookOpen, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Project' },
  internship: { icon: Building2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Internship' },
  achievement: { icon: ShieldCheck, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Achievement' },
  profile: { icon: User, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Profile' },
  system: { icon: Bell, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700', label: 'System' },
  course: { icon: FileText, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30', label: 'Course' },
  skills: { icon: Star, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Skill' },
  certificates: { icon: Award, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Certificate' },
  projects: { icon: BookOpen, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Project' },
  internships: { icon: Building2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Internship' },
  auth: { icon: LogIn, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30', label: 'Auth' },
};

const ACTION_ICONS = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  VERIFY: CheckCircle,
  REJECT: XCircle,
  LOGIN: LogIn,
};

function getActionIcon(action) {
  const upper = (action || '').toUpperCase();
  for (const [key, icon] of Object.entries(ACTION_ICONS)) {
    if (upper.includes(key)) return icon;
  }
  return Activity;
}

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function groupByDate(items) {
  const groups = {};
  items.forEach(item => {
    const date = new Date(item.timestamp || item.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });
  return Object.entries(groups);
}

export default function AllActivity() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch notifications (available to all users)
        const notifRes = await api.get('notifications/');
        const notifData = notifRes.data.results || notifRes.data || [];

        // Normalize notifications to common shape
        const normalizedNotifications = notifData.map(n => ({
          id: n.id,
          type: 'notification',
          module: n.notification_type || 'system',
          action: n.title,
          description: n.message,
          timestamp: n.created_at,
          is_read: n.is_read,
          source: 'notification',
        }));

        setNotifications(normalizedNotifications);

        // Build a combined activity feed from various data sources
        const activityItems = [];

        // Fetch recent data from multiple endpoints to build activity
        const [skillsRes, certsRes, projectsRes, internshipsRes] = await Promise.all([
          api.get('skills/student/').catch(() => ({ data: [] })),
          api.get('certificates/').catch(() => ({ data: [] })),
          api.get('projects/').catch(() => ({ data: [] })),
          api.get('internships/').catch(() => ({ data: [] })),
        ]);

        // Process skills into activities
        const skills = skillsRes.data.results || skillsRes.data || [];
        skills.forEach(s => {
          activityItems.push({
            id: `skill-${s.id}`,
            type: 'activity',
            module: 'skills',
            action: 'Skill Added',
            description: `Added skill: ${s.skill_name || s.name || 'Unknown'}`,
            timestamp: s.created_at || s.updated_at,
            source: 'skills',
          });
        });

        // Process certificates into activities
        const certs = certsRes.data.results || certsRes.data || [];
        certs.forEach(c => {
          activityItems.push({
            id: `cert-${c.id}`,
            type: 'activity',
            module: 'certificates',
            action: c.status === 'verified' ? 'Certificate Verified' : c.status === 'rejected' ? 'Certificate Rejected' : 'Certificate Uploaded',
            description: `${c.title} — ${c.issuing_organization || 'Unknown Org'}`,
            timestamp: c.verified_at || c.created_at || c.updated_at,
            source: 'certificates',
            status: c.status,
          });
        });

        // Process projects into activities
        const projects = projectsRes.data.results || projectsRes.data || [];
        projects.forEach(p => {
          activityItems.push({
            id: `project-${p.id}`,
            type: 'activity',
            module: 'projects',
            action: 'Project Added',
            description: `${p.title} — ${(p.category || '').replace('_', ' ')}`,
            timestamp: p.created_at || p.updated_at,
            source: 'projects',
          });
        });

        // Process internships into activities
        const internships = internshipsRes.data.results || internshipsRes.data || [];
        internships.forEach(i => {
          activityItems.push({
            id: `intern-${i.id}`,
            type: 'activity',
            module: 'internships',
            action: 'Internship Added',
            description: `${i.role || i.title || 'Internship'} at ${i.company_name || 'Unknown'}`,
            timestamp: i.created_at || i.updated_at,
            source: 'internships',
          });
        });

        // Sort by timestamp descending
        activityItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivities(activityItems);
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine and filter
  const allItems = [...activities, ...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const displayItems = activeTab === 'notifications'
    ? notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : activeTab === 'activities'
      ? activities
      : allItems;

  const filteredItems = filterType === 'all'
    ? displayItems
    : displayItems.filter(item => item.module === filterType || item.source === filterType);

  const grouped = groupByDate(filteredItems);

  const tabs = [
    { key: 'all', label: 'All', count: allItems.length },
    { key: 'activities', label: 'Activities', count: activities.length },
    { key: 'notifications', label: 'Notifications', count: notifications.length },
  ];

  const filterOptions = [
    { key: 'all', label: 'All Types' },
    { key: 'skills', label: 'Skills' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'projects', label: 'Projects' },
    { key: 'internships', label: 'Internships' },
  ];

  const handleMarkAllRead = async () => {
    try {
      await api.post('notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Activity className="text-primary-600 dark:text-primary-400" />
              All Activity
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Your complete activity log and notifications.
            </p>
          </div>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            Mark all read
          </button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }
            `}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter size={14} className="text-slate-400 flex-shrink-0" />
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilterType(opt.key)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
              ${filterType === opt.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Activity Feed */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading activity...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <Activity className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No activity yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Start adding skills, certificates, and projects to see your activity here.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {grouped.map(([dateStr, items], groupIdx) => (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.05 }}
              >
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {formatDate(dateStr)}
                  </span>
                  <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const typeConfig = TYPE_CONFIG[item.module] || TYPE_CONFIG.system;
                    const TypeIcon = typeConfig.icon;
                    const ActionIcon = getActionIcon(item.action);

                    return (
                      <motion.div
                        key={item.id || `${groupIdx}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`
                          flex items-start gap-4 p-4 rounded-xl transition-colors
                          ${item.source === 'notification' && !item.is_read
                            ? 'bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }
                        `}
                      >
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0 relative`}>
                          <TypeIcon size={18} className={typeConfig.color} />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                            <ActionIcon size={10} className="text-slate-500" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.action}
                            </p>
                            {item.source === 'notification' && !item.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>
                            )}
                            {item.status === 'verified' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">Verified</span>
                            )}
                            {item.status === 'rejected' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">Rejected</span>
                            )}
                            {item.status === 'pending' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium">Pending</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                        </div>

                        {/* Time */}
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0 mt-0.5">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
