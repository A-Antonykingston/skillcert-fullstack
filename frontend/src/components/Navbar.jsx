import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Award, Menu, X, User, Bell, LogOut, Sun, Moon, ChevronDown, Code2, Briefcase, Building2, LayoutDashboard, ScrollText, UserCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from "../hooks/useAuthStore";

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/skills', label: 'Skills', icon: Code2 },
  { to: '/certificates', label: 'Certificates', icon: ScrollText },
  { to: '/projects', label: 'Projects', icon: Briefcase },
  { to: '/internships', label: 'Internships', icon: Building2 },
];

function NavLink({ to, label, icon: Icon, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 group
        ${isActive
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
          : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }
      `}
    >
      <Icon size={16} className={`transition-colors ${isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-primary-500'}`} />
      {label}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute -bottom-[13px] left-2 right-2 h-0.5 bg-primary-500 rounded-full"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({ to, label, icon: Icon, isActive, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium
          transition-all duration-200
          ${isActive
            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-sm'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400'
          }
        `}
      >
        <Icon size={20} className={isActive ? 'text-primary-500' : 'text-slate-400'} />
        {label}
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
        )}
      </Link>
    </motion.div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, fetchProfile, user } = useAuthStore();
  const profileRef = useRef(null);

  // Track scroll for navbar style change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync dark mode from DOM
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const closeMobile = () => setIsOpen(false);

  const isActive = (path) => location.pathname === path;

  const userInitials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className={`
          fixed w-full z-50 transition-all duration-300
          ${scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 dark:shadow-slate-900/30 border-b border-slate-200/50 dark:border-slate-700/50'
            : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur-md group-hover:blur-lg transition-all" />
                <Award className="relative h-8 w-8 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
                Skill<span className="text-primary-600 dark:text-primary-400">Cert</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {isAuthenticated ? (
                NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    {...link}
                    isActive={isActive(link.to)}
                  />
                ))
              ) : (
                <>
                  <NavLink to="/" label="Home" icon={Award} isActive={isActive('/')} />
                </>
              )}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {darkMode ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun size={18} />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => navigate('/activity')}
                    className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                  </button>

                  {/* Divider */}
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {userInitials}
                      </div>
                      <div className="text-left hidden xl:block">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                          {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User' : 'User'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight capitalize">
                          {user?.role || 'Student'}
                        </p>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-slate-900/40 overflow-hidden"
                        >
                          <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User' : 'User'}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email || ''}</p>
                          </div>
                          <div className="p-1.5">
                            <Link
                              to="/profile"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                              <UserCircle size={16} />
                              My Profile
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : null}
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => { closeMobile(); navigate('/activity'); }}
                  className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={22} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={22} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-1">
                {isAuthenticated ? (
                  <>
                    {/* User Info (Mobile) */}
                    <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {userInitials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User' : 'User'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{user?.role || 'Student'}</p>
                      </div>
                    </div>

                    {NAV_LINKS.map((link, idx) => (
                      <MobileNavLink
                        key={link.to}
                        {...link}
                        isActive={isActive(link.to)}
                        onClick={closeMobile}
                      />
                    ))}

                    <MobileNavLink
                      to="/profile"
                      label="Profile"
                      icon={UserCircle}
                      isActive={isActive('/profile')}
                      onClick={closeMobile}
                    />

                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={20} />
                          Sign Out
                        </button>
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <>
                    <MobileNavLink
                      to="/"
                      label="Home"
                      icon={Award}
                      isActive={isActive('/')}
                      onClick={closeMobile}
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
