import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, BarChart3, Activity, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../hooks/useAuthStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    students: [],
    certificates: [],
    departments: [],
    auditLogs: []
  });
  
  const [certAction, setCertAction] = useState({ id: null, type: null, reason: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        api.get('students/list/'),
        api.get('certificates/'),
        api.get('students/departments/')
      ];
      
      // Only admins can see audit logs
      if (user?.role === 'admin') {
        endpoints.push(api.get('accounts/audit-logs/'));
      }
      
      const responses = await Promise.allSettled(endpoints);
      
      const students = responses[0].status === 'fulfilled' ? (responses[0].value.data.results || responses[0].value.data) : [];
      const certificates = responses[1].status === 'fulfilled' ? (responses[1].value.data.results || responses[1].value.data) : [];
      const departments = responses[2].status === 'fulfilled' ? (responses[2].value.data.results || responses[2].value.data) : [];
      const auditLogs = user?.role === 'admin' && responses[3].status === 'fulfilled' 
        ? (responses[3].value.data.results || responses[3].value.data) : [];
        
      setData({ students, certificates, departments, auditLogs });
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (certId) => {
    try {
      await api.post(`certificates/${certId}/verify/`, { comment: 'Verified by admin/faculty' });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to verify certificate');
    }
  };

  const handleReject = async (certId, reason) => {
    if (!reason) {
      alert('Rejection reason is required');
      return;
    }
    try {
      await api.post(`certificates/${certId}/reject/`, { reason });
      setCertAction({ id: null, type: null, reason: '' });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to reject certificate');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { students, certificates, departments, auditLogs } = data;
  
  const pendingCerts = certificates.filter(c => c.status === 'pending');
  const verifiedCerts = certificates.filter(c => c.status === 'verified');
  const rejectedCerts = certificates.filter(c => c.status === 'rejected');

  const adminStats = [
    { label: 'Total Students', value: students.length, icon: <Users className="h-6 w-6 text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Certificates', value: certificates.length, icon: <FileText className="h-6 w-6 text-purple-500" />, bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Pending Verification', value: pendingCerts.length, icon: <Clock className="h-6 w-6 text-yellow-500" />, bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Verified', value: verifiedCerts.length, icon: <CheckCircle className="h-6 w-6 text-green-500" />, bg: 'bg-green-100 dark:bg-green-900/30' },
  ];

  // Calculate students by department
  const departmentData = departments.map(d => {
    const count = students.filter(s => s.department_name === d.name).length;
    return { name: d.code || d.name.substring(0, 5), students: count };
  }).filter(d => d.students > 0);

  const certificateStatusData = [
    { name: 'Verified', value: verifiedCerts.length },
    { name: 'Pending', value: pendingCerts.length },
    { name: 'Rejected', value: rejectedCerts.length },
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">{user?.role} Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">System overview and statistics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminStats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Department Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Students by Department</h2>
            <BarChart3 className="text-slate-400 h-5 w-5" />
          </div>
          <div className="h-72 w-full">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No department data available</div>
            )}
          </div>
        </div>

        {/* Certificate Status Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Certificate Status</h2>
            <PieChart className="text-slate-400 h-5 w-5" />
          </div>
          <div className="h-72 w-full flex justify-center">
            {certificateStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={certificateStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {certificateStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No certificate data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Certificates Needing Verification</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Certificate Name</th>
                  <th className="px-6 py-4 font-medium">Date Uploaded</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {pendingCerts.length > 0 ? (
                  pendingCerts.slice(0, 10).map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{cert.student_name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {cert.certificate_file ? (
                          <a href={cert.certificate_file} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                            {cert.title}
                          </a>
                        ) : (
                          cert.title
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(cert.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {certAction.id === cert.id && certAction.type === 'reject' ? (
                          <div className="flex flex-col gap-2 items-end">
                            <input 
                              type="text" 
                              placeholder="Reason..." 
                              value={certAction.reason} 
                              onChange={e => setCertAction({ ...certAction, reason: e.target.value })}
                              className="input text-xs w-40 py-1"
                            />
                            <div className="flex gap-1">
                              <button onClick={() => setCertAction({ id: null, type: null, reason: '' })} className="btn btn-secondary text-xs py-1 px-2">Cancel</button>
                              <button onClick={() => handleReject(cert.id, certAction.reason)} className="btn bg-red-600 text-white hover:bg-red-700 text-xs py-1 px-2">Confirm</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleVerify(cert.id)} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors font-medium">Verify</button>
                            <button onClick={() => setCertAction({ id: cert.id, type: 'reject', reason: '' })} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors font-medium">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No pending certificates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="card">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5" /> System Audit Log
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-6">
                {auditLogs.length > 0 ? (
                  auditLogs.slice(0, 10).map((log, idx) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="relative mt-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 flex items-center justify-center z-10 relative mt-1.5"></div>
                        {idx !== Math.min(9, auditLogs.length - 1) && (
                          <div className="absolute top-3 left-1/2 -ml-px w-0.5 h-[120%] bg-slate-200 dark:bg-slate-700"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.description || log.action}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          by {log.user?.first_name || 'System'} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-4">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
