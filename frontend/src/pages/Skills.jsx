import { useState, useEffect } from 'react';
import { Star, Plus, CheckCircle, XCircle, Search, Trash2, Edit2, ShieldCheck, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Skills() {
  const { user } = useAuthStore();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    skill_name: '',
    category: '',
    proficiency: 'beginner',
    proficiency_percentage: 25,
    experience_months: 0
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
      const [skillsRes, catsRes] = await Promise.all([
        api.get('skills/student/'),
        api.get('skills/categories/')
      ]);
      setSkills(skillsRes.data.results || skillsRes.data);
      setCategories(catsRes.data.results || catsRes.data);
    } catch (err) {
      console.error('Failed to fetch skills data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    if (name === 'proficiency') {
      let percentage = 25;
      if (value === 'intermediate') percentage = 50;
      else if (value === 'advanced') percentage = 75;
      else if (value === 'expert') percentage = 100;
      newFormData.proficiency_percentage = percentage;
    }
    
    setFormData(newFormData);
    setError('');
  };

  const handleEdit = (skill) => {
    setFormData({
      skill_name: skill.skill_name,
      category: skill.category || '',
      proficiency: skill.proficiency,
      proficiency_percentage: skill.proficiency_percentage,
      experience_months: skill.experience_months
    });
    setEditingId(skill.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      if (editingId) {
        await api.patch(`skills/student/${editingId}/`, formData);
        setSuccess('Skill updated successfully!');
      } else {
        await api.post('skills/student/', formData);
        setSuccess('Skill added successfully!');
      }
      
      setShowForm(false);
      setFormData({
        skill_name: '', category: '', proficiency: 'beginner', 
        proficiency_percentage: 25, experience_months: 0
      });
      setEditingId(null);
      fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save skill. Please check your inputs.');
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
        await api.delete(`skills/student/${itemToDelete}/`);
        setSkills(skills.filter(s => s.id !== itemToDelete));
      } catch (err) {
        alert('Failed to delete skill');
      }
    }
  };

  const filteredSkills = skills.filter(skill => 
    skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (skill.category_name && skill.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Skills Tracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor your technical and soft skills.</p>
        </div>
        
        {user?.role === 'student' && !showForm && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({
                skill_name: '', category: '', proficiency: 'beginner', 
                proficiency_percentage: 25, experience_months: 0
              });
              setShowForm(true);
            }}
            className="btn btn-primary shadow-lg shadow-primary-500/30"
          >
            <Plus className="h-5 w-5 mr-2" /> Add a Skill
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
                  {editingId ? 'Edit Skill' : 'Add New Skill'}
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
                    <label className="label">Skill Name *</label>
                    <input type="text" name="skill_name" required value={formData.skill_name} onChange={handleInputChange} className="input" placeholder="e.g. React, Python, Public Speaking" />
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
                    <label className="label">Proficiency Level</label>
                    <select name="proficiency" value={formData.proficiency} onChange={handleInputChange} className="input">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Experience (Months)</label>
                    <input type="number" name="experience_months" min="0" value={formData.experience_months} onChange={handleInputChange} className="input" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label flex justify-between">
                      <span>Proficiency Percentage</span>
                      <span className="text-primary-600 font-semibold">{formData.proficiency_percentage}%</span>
                    </label>
                    <input 
                      type="range" 
                      name="proficiency_percentage" 
                      min="0" max="100" step="5"
                      value={formData.proficiency_percentage} 
                      onChange={handleInputChange} 
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : 'Save Skill'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills List */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search skills..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total: {skills.length}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Star className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-lg font-medium">No skills found</p>
            {searchTerm ? (
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm mt-1">Click "Add a Skill" to get started</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredSkills.map(skill => (
              <motion.div 
                key={skill.id} 
                whileHover={{ y: -3 }}
                className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Progress bar background */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 dark:bg-slate-700 w-full">
                  <div 
                    className={`h-full ${skill.proficiency_percentage > 70 ? 'bg-green-500' : skill.proficiency_percentage > 40 ? 'bg-primary-500' : 'bg-yellow-500'}`} 
                    style={{ width: `${skill.proficiency_percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{skill.skill_name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{skill.category_name || 'Uncategorized'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(skill)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-700 rounded-lg">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(skill.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4 mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide
                    ${skill.proficiency === 'expert' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 
                      skill.proficiency === 'advanced' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      skill.proficiency === 'intermediate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                      'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}
                  >
                    {skill.proficiency}
                  </span>
                  
                  {skill.is_verified && (
                    <span className="text-green-600 dark:text-green-400 flex items-center text-xs font-medium" title="Verified by Faculty">
                      <ShieldCheck className="h-4 w-4 mr-0.5" /> Verified
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-medium pb-2">
                  <Briefcase className="h-4 w-4 mr-1.5 text-slate-400" />
                  {skill.experience_months} months experience
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={confirmDelete}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
      />
    </div>
  );
}
