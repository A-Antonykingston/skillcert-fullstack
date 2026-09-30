import { useState, useEffect } from 'react';
import { Briefcase, Plus, ExternalLink, MapPin, Trash2, Edit2, CheckCircle, XCircle, Search, Calendar, DollarSign, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Internships() {
  const { user } = useAuthStore();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    description: '',
    technologies: '',
    location: '',
    stipend: '',
    start_date: '',
    end_date: '',
    is_current: false,
    certificate_file: null,
    experience_letter: null
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('internships/');
      setInternships(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch internships', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleEdit = (internship) => {
    setFormData({
      company: internship.company,
      role: internship.role,
      description: internship.description || '',
      technologies: (internship.technologies || []).join(', '),
      location: internship.location || '',
      stipend: internship.stipend || '',
      start_date: internship.start_date || '',
      end_date: internship.end_date || '',
      is_current: internship.is_current || false,
      certificate_file: null,
      experience_letter: null
    });
    setEditingId(internship.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'technologies') {
          const arr = formData[key].split(',').map(item => item.trim()).filter(Boolean);
          data.append(key, JSON.stringify(arr));
        } else if (key === 'certificate_file' || key === 'experience_letter') {
          if (formData[key]) data.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      
      if (editingId) {
        await api.patch(`internships/${editingId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Internship updated successfully!');
      } else {
        await api.post('internships/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Internship added successfully!');
      }
      
      setShowForm(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save internship. Check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '', role: '', description: '', technologies: '',
      location: '', stipend: '', start_date: '', end_date: '',
      is_current: false, certificate_file: null, experience_letter: null
    });
    setEditingId(null);
  };
  
  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.delete(`internships/${itemToDelete}/`);
        setInternships(internships.filter(i => i.id !== itemToDelete));
      } catch (err) {
        alert('Failed to delete internship');
      }
    }
  };

  const filteredInternships = internships.filter(internship => 
    internship.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
    internship.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-emerald-500" />
            Internships
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track your internship and work experiences.</p>
        </div>
        
        {user?.role === 'student' && !showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn btn-primary shadow-lg shadow-primary-500/30"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Internship
          </button>
        )}
      </div>
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> {success}
        </div>
      )}

      {/* Add/Edit Form */}
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Internship' : 'Add New Internship'}
                </h2>
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
                    <label className="label">Company Name *</label>
                    <input type="text" name="company" required value={formData.company} onChange={handleInputChange} className="input" placeholder="e.g. Google, TechCorp" />
                  </div>
                  <div>
                    <label className="label">Role / Job Title *</label>
                    <input type="text" name="role" required value={formData.role} onChange={handleInputChange} className="input" placeholder="e.g. Frontend Developer Intern" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Description & Responsibilities</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="input" rows="3" placeholder="What did you do?"></textarea>
                  </div>
                  <div>
                    <label className="label">Technologies Used (comma separated)</label>
                    <input type="text" name="technologies" value={formData.technologies} onChange={handleInputChange} className="input" placeholder="React, Node.js, AWS" />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="input" placeholder="e.g. Bangalore, India (or Remote)" />
                  </div>
                  <div>
                    <label className="label">Start Date *</label>
                    <input type="date" name="start_date" required value={formData.start_date} onChange={handleInputChange} className="input" />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="input" disabled={formData.is_current} />
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    <input type="checkbox" name="is_current" id="is_current" checked={formData.is_current} onChange={handleInputChange} className="h-4 w-4 text-primary-600 rounded" />
                    <label htmlFor="is_current" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                      I currently work here
                    </label>
                  </div>
                  <div>
                    <label className="label">Stipend / Salary (optional)</label>
                    <input type="text" name="stipend" value={formData.stipend} onChange={handleInputChange} className="input" placeholder="e.g. ₹15,000/month" />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Completion Certificate (PDF/Image)</label>
                      <input type="file" name="certificate_file" accept=".pdf,image/*" onChange={handleInputChange} className="input p-1" />
                    </div>
                    <div>
                      <label className="label">Experience Letter (PDF/Image)</label>
                      <input type="file" name="experience_letter" accept=".pdf,image/*" onChange={handleInputChange} className="input p-1" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : 'Save Internship'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internships List */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search internships..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total: {internships.length}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Briefcase className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-lg font-medium">No internships found</p>
            {searchTerm ? (
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm mt-1">Click "Add Internship" to add your first one</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredInternships.map(internship => (
              <div key={internship.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left column - Icon */}
                  <div className="hidden md:flex flex-shrink-0 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <Briefcase className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  
                  {/* Middle column - Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{internship.role}</h3>
                        <p className="text-lg font-medium text-primary-600 dark:text-primary-400">{internship.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(internship)} className="btn btn-secondary py-1 px-3 text-xs">Edit</button>
                        <button onClick={() => handleDelete(internship.id)} className="btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 py-1 px-3 text-xs border-0">Delete</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(internship.start_date).toLocaleDateString()} - {internship.is_current ? 'Present' : (internship.end_date ? new Date(internship.end_date).toLocaleDateString() : '')}
                      </div>
                      {internship.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {internship.location}
                        </div>
                      )}
                      {internship.stipend && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4" /> {internship.stipend}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                      {internship.description}
                    </p>
                    
                    {internship.technologies && internship.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {internship.technologies.map((tech, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {internship.certificate_file && (
                        <a href={internship.certificate_file} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                          <FileText className="h-4 w-4" /> View Certificate
                        </a>
                      )}
                      {internship.experience_letter && (
                        <a href={internship.experience_letter} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                          <FileText className="h-4 w-4" /> View Experience Letter
                        </a>
                      )}
                    </div>
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
        title="Delete Internship"
        message="Are you sure you want to delete this internship? This action cannot be undone."
      />
    </div>
  );
}
