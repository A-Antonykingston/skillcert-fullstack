import { useState, useEffect } from 'react';
import { Award, Plus, FileText, CheckCircle, Clock, XCircle, Search, Calendar, Building, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Certificates() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    issuing_organization: '',
    certificate_id: '',
    category: '',
    issue_date: '',
    expiry_date: '',
    credential_url: '',
    description: '',
    certificate_file: null
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certsRes, catsRes] = await Promise.all([
        api.get('certificates/'),
        api.get('certificates/categories/')
      ]);
      setCertificates(certsRes.data.results || certsRes.data);
      setCategories(catsRes.data.results || catsRes.data);
    } catch (err) {
      console.error('Failed to fetch certificates data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'certificate_file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });
      
      await api.post('certificates/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Certificate uploaded successfully! It is now pending verification.');
      setShowForm(false);
      setFormData({
        title: '', issuing_organization: '', certificate_id: '', category: '',
        issue_date: '', expiry_date: '', credential_url: '', description: '', certificate_file: null
      });
      fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload certificate. Please check all required fields.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.delete(`certificates/${itemToDelete}/`);
        setCertificates(certificates.filter(c => c.id !== itemToDelete));
      } catch (err) {
        alert('Failed to delete certificate');
      }
    }
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cert.issuing_organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-green-200 dark:border-green-800"><CheckCircle className="h-3 w-3" /> Verified</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-red-200 dark:border-red-800"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-yellow-200 dark:border-yellow-800"><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-8 w-8 text-primary-500" />
            Certificates
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Upload and manage your certificates for verification.</p>
        </div>
        
        {user?.role === 'student' && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary shadow-lg shadow-primary-500/30"
          >
            <Plus className="h-5 w-5 mr-2" /> Upload New Certificate
          </button>
        )}
      </div>
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> {success}
        </div>
      )}

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="card p-6 border-primary-200 dark:border-primary-800">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload New Certificate</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg mb-6 text-sm border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Certificate Title *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="input" placeholder="e.g. AWS Certified Solutions Architect" />
                  </div>
                  <div>
                    <label className="label">Issuing Organization *</label>
                    <input type="text" name="issuing_organization" required value={formData.issuing_organization} onChange={handleInputChange} className="input" placeholder="e.g. Amazon Web Services" />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="input">
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Credential ID</label>
                    <input type="text" name="certificate_id" value={formData.certificate_id} onChange={handleInputChange} className="input" placeholder="e.g. AWS-12345678" />
                  </div>
                  <div>
                    <label className="label">Issue Date *</label>
                    <input type="date" name="issue_date" required value={formData.issue_date} onChange={handleInputChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Expiry Date (if applicable)</label>
                    <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} className="input" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Credential URL</label>
                    <input type="url" name="credential_url" value={formData.credential_url} onChange={handleInputChange} className="input" placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Certificate File (PDF or Image)</label>
                    <input type="file" name="certificate_file" accept=".pdf,image/*" onChange={handleInputChange} className="input p-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Description (optional)</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="input" rows="3" placeholder="Brief description of skills learned..."></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Uploading...' : 'Submit Certificate'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate List */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search certificates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total: {certificates.length}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Award className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-lg font-medium">No certificates found</p>
            {searchTerm ? (
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm mt-1">Click "Upload New Certificate" to add your first one</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredCertificates.map(cert => (
              <div key={cert.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left column - Icon/Preview */}
                  <div className="hidden md:flex flex-shrink-0 w-24 h-24 bg-gradient-to-br from-primary-100 to-indigo-50 dark:from-primary-900/40 dark:to-indigo-900/20 rounded-xl border border-primary-200 dark:border-primary-800/50 items-center justify-center">
                    <FileText className="h-10 w-10 text-primary-500" />
                  </div>
                  
                  {/* Middle column - Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{cert.title}</h3>
                      <div className="flex-shrink-0">
                        {getStatusBadge(cert.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-3 font-medium">
                      <Building className="h-4 w-4 text-slate-400" />
                      {cert.issuing_organization}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </div>
                      {cert.certificate_id && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-medium">ID:</span> {cert.certificate_id}
                        </div>
                      )}
                      {cert.category_name && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">Category:</span> {cert.category_name}
                        </div>
                      )}
                    </div>
                    
                    {cert.status === 'rejected' && cert.rejection_reason && (
                      <div className="mt-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded text-sm border-l-2 border-red-500">
                        <span className="font-semibold block mb-1">Rejection Reason:</span>
                        {cert.rejection_reason}
                      </div>
                    )}
                  </div>
                  
                  {/* Right column - Actions */}
                  <div className="flex md:flex-col gap-3 justify-end md:w-32 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-700">
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary py-1.5 text-xs w-full flex justify-center items-center gap-1.5">
                        <LinkIcon className="h-3.5 w-3.5" /> Link
                      </a>
                    )}
                    {cert.certificate_file && (
                      <a href={cert.certificate_file} target="_blank" rel="noopener noreferrer" className="btn btn-secondary py-1.5 text-xs w-full flex justify-center items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> File
                      </a>
                    )}
                    {(cert.status === 'pending' || cert.status === 'rejected') && (
                      <button onClick={() => handleDelete(cert.id)} className="btn text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 py-1.5 text-xs w-full">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={confirmDelete}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
      />
    </div>
  );
}
