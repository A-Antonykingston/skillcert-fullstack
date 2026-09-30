import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Star, Briefcase, BookOpen, Building2, User, ChevronRight, ArrowLeft, CheckCircle2, AlertCircle, Lightbulb, Zap, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';

const CATEGORY_CONFIG = {
  profile: {
    label: 'Profile Completion',
    icon: User,
    color: 'primary',
    route: '/profile',
    tip: 'Complete your bio, career objectives, and contact information.',
    bgGradient: 'from-blue-500 to-indigo-600',
  },
  skills: {
    label: 'Skills',
    icon: Star,
    color: 'yellow',
    route: '/skills',
    tip: 'Add technical and soft skills. Target: 10 skills.',
    bgGradient: 'from-amber-500 to-orange-600',
  },
  certificates: {
    label: 'Certificates',
    icon: Award,
    color: 'green',
    route: '/certificates',
    tip: 'Upload and get 3 certificates verified.',
    bgGradient: 'from-emerald-500 to-teal-600',
  },
  projects: {
    label: 'Projects',
    icon: BookOpen,
    color: 'purple',
    route: '/projects',
    tip: 'Showcase at least 3 projects with descriptions.',
    bgGradient: 'from-purple-500 to-violet-600',
  },
  internships: {
    label: 'Internships',
    icon: Building2,
    color: 'rose',
    route: '/internships',
    tip: 'Add at least 1 internship experience.',
    bgGradient: 'from-rose-500 to-pink-600',
  },
};

function getScoreLabel(score) {
  if (score >= 80) return { text: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
  if (score >= 60) return { text: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
  if (score >= 40) return { text: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
  return { text: 'Needs Work', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
}

function getProgressColor(score) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function CircularProgress({ score, size = 200, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreInfo = getScoreLabel(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={score >= 60 ? '#3b82f6' : '#ef4444'} />
            <stop offset="100%" stopColor={score >= 60 ? '#8b5cf6' : '#f59e0b'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold text-slate-900 dark:text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-sm font-medium text-slate-400">/ 100</span>
        <span className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${scoreInfo.bg} ${scoreInfo.color}`}>
          {scoreInfo.text}
        </span>
      </div>
    </div>
  );
}

function BreakdownCard({ category, score, index }) {
  const config = CATEGORY_CONFIG[category];
  if (!config) return null;
  const Icon = config.icon;
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="card p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={() => navigate(config.route)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.bgGradient} flex items-center justify-center text-white shadow-sm`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{config.label}</h3>
            <p className="text-xs text-slate-400">{score}% complete</p>
          </div>
        </div>
        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getProgressColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-start gap-1.5">
        <Lightbulb size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
        {config.tip}
      </p>
    </motion.div>
  );
}

export default function CareerAnalysis() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ skills: 0, certificates: 0, projects: 0, internships: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analysisRes, skillsRes, certsRes, projectsRes, internshipsRes] = await Promise.all([
          api.get('analytics/career-readiness/'),
          api.get('skills/student/'),
          api.get('certificates/'),
          api.get('projects/'),
          api.get('internships/'),
        ]);

        setData(analysisRes.data);
        setCounts({
          skills: (skillsRes.data.results || skillsRes.data).length || 0,
          certificates: (certsRes.data.results || certsRes.data).filter(c => c.status === 'verified').length || 0,
          projects: (projectsRes.data.results || projectsRes.data).length || 0,
          internships: (internshipsRes.data.results || internshipsRes.data).length || 0,
        });
      } catch (err) {
        console.error('Failed to fetch career analysis:', err);
        setError('Failed to load career analysis data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Analyzing your career readiness...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const breakdown = data?.breakdown || {};
  const suggestions = data?.suggestions || [];
  const overallScore = data?.overall_score || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="text-primary-600 dark:text-primary-400" />
            Career Readiness Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Detailed breakdown of your career preparedness score.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1"
        >
          <div className="card p-8 text-center sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Overall Score</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Based on 5 key career factors
            </p>
            <div className="flex justify-center mb-6">
              <CircularProgress score={overallScore} />
            </div>

            {/* Score Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-slate-600 dark:text-slate-400">80-100: Excellent</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-slate-600 dark:text-slate-400">60-79: Good</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-slate-600 dark:text-slate-400">40-59: Fair</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-slate-600 dark:text-slate-400">0-39: Needs Work</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Numbers</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Skills Added</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{counts.skills} / 10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Verified Certs</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{counts.certificates} / 3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Projects</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{counts.projects} / 3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Internships</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{counts.internships} / 1</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Category Breakdown */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary-600" />
              Score Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(breakdown).map(([category, score], idx) => (
                <BreakdownCard key={category} category={category} score={score} index={idx} />
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" />
                Improvement Suggestions
              </h2>
              <div className="card divide-y divide-slate-100 dark:divide-slate-700">
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                    className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() => navigate('/skills')}
              className="btn btn-primary shadow-lg shadow-primary-500/20"
            >
              <Star size={16} className="mr-2" /> Add Skills
            </button>
            <button
              onClick={() => navigate('/certificates')}
              className="btn btn-secondary"
            >
              <Award size={16} className="mr-2" /> Upload Certificate
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="btn btn-secondary"
            >
              <BookOpen size={16} className="mr-2" /> Add Project
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-secondary"
            >
              <User size={16} className="mr-2" /> Complete Profile
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
