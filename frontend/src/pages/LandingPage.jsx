import { Link } from 'react-router-dom';
import { Award, Briefcase, BookOpen, Star, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const features = [
    {
      id: "digital-certificates",
      icon: <Award className="h-6 w-6 text-primary-500" />,
      title: "Digital Certificates",
      description: "Upload, verify, and showcase your verified certificates with integrated QR verification."
    },
    {
      id: "skill-tracking",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      title: "Skill Tracking",
      description: "Monitor your technical and soft skills with intuitive progress visualizations."
    },
    {
      id: "career-portfolio",
      icon: <Briefcase className="h-6 w-6 text-emerald-500" />,
      title: "Career Portfolio",
      description: "Automatically generate a professional portfolio and resume from your profile."
    },
    {
      id: "faculty-verification",
      icon: <ShieldCheck className="h-6 w-6 text-purple-500" />,
      title: "Faculty Verification",
      description: "Institutional verification adds weight and authenticity to your achievements."
    },
    {
      id: "career-readiness",
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      title: "Career Readiness",
      description: "Get an AI-powered score based on your profile completeness and achievements."
    },
    {
      id: "projects-internships",
      icon: <BookOpen className="h-6 w-6 text-orange-500" />,
      title: "Projects & Internships",
      description: "Showcase real-world experience to stand out to potential employers."
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 opacity-90"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-200/50 dark:bg-primary-900/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-200/50 dark:bg-purple-900/20 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <span className="inline-block py-1 px-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold tracking-wider uppercase mb-6 shadow-sm border border-primary-200 dark:border-primary-800/50">
              Final Year Project 2026
            </span> */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              Build Your Skills. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
                Showcase Your Achievements.
              </span>
              <br className="hidden md:block" /> Shape Your Career.
            </h1>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              One intelligent platform to manage skills, certificates, projects, internships, and your complete student career profile. Designed for modern universities.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login" className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all group">
                Student Login
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin" className="btn bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-8 py-4 rounded-full text-lg font-semibold shadow-md hover:-translate-y-1 transition-all">
                Admin / Faculty Portal
              </Link>
            </div>
          </motion.div>
          
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 p-2 backdrop-blur-sm shadow-2xl">
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-inner">
                {/* Mock Header */}
                <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-2 bg-slate-50 dark:bg-slate-900">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Mock Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    <div className="h-32 rounded-xl bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 p-6 flex flex-col justify-center border border-primary-200 dark:border-primary-800">
                      <div className="h-6 w-48 bg-primary-200 dark:bg-primary-800 rounded-md mb-3"></div>
                      <div className="h-4 w-64 bg-primary-200/70 dark:bg-primary-800/70 rounded-md"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"></div>
                      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"></div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
                    <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Powerful Features for Modern Students</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to build a comprehensive, verifiable academic and professional profile.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
              >
                <Link to={`/topics/${feature.id}`} className="card p-8 hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-800 group block h-full">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="h-6 w-6 text-primary-500" />
            <span className="font-bold text-lg text-slate-700 dark:text-slate-300">SkillCert</span>
          </div>
          <p>© 2026 Student Skill & Certificate Management System. Final Year Project.</p>
        </div>
      </footer>
    </div>
  );
}
