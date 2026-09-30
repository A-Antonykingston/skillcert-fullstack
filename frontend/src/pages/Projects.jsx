import { useState, useEffect } from 'react';
import { BookOpen, Plus, ExternalLink, Trash2, Edit2, CheckCircle, XCircle, Search, Calendar, Users, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Projects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
    technologies: '', // We'll split this by comma before sending
    github_url: '',
    live_url: '',
    team_members: '', // We'll split this by comma before sending
    start_date: '',
    end_date: '',
    is_featured: false,
    project_image: null
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
      const res = await api.get('projects/');
      setProjects(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
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

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      technologies: (project.technologies || []).join(', '),
      github_url: project.github_url || '',
      live_url: project.live_url || '',
      team_members: (project.team_members || []).join(', '),
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      is_featured: project.is_featured || false,
      project_image: null // Can't easily preview existing image in this basic form
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'technologies' || key === 'team_members') {
          // Send as JSON string of array
          const arr = formData[key].split(',').map(item => item.trim()).filter(Boolean);
          data.append(key, JSON.stringify(arr));
        } else if (key === 'project_image') {
          if (formData[key]) data.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      if (editingId) {
        await api.patch(`projects/${editingId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Project updated successfully!');
      } else {
        await api.post('projects/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Project added successfully!');
      }

      setShowForm(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save project. Check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', category: 'academic', technologies: '',
      github_url: '', live_url: '', team_members: '', start_date: '',
      end_date: '', is_featured: false, project_image: null
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
        await api.delete(`projects/${itemToDelete}/`);
        setProjects(projects.filter(p => p.id !== itemToDelete));
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-500" />
            My Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and showcase your portfolio projects.</p>
        </div>

        {user?.role === 'student' && !showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn btn-primary shadow-lg shadow-primary-500/30"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Project
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
                  {editingId ? 'Edit Project' : 'Add New Project'}
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
                    <label className="label">Project Title *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="input" placeholder="e.g. E-Commerce Platform" />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="input">
                      <option value="academic">Academic</option>
                      <option value="personal">Personal</option>
                      <option value="open_source">Open Source</option>
                      <option value="freelance">Freelance</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="research">Research</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Description *</label>
                    <textarea name="description" required value={formData.description} onChange={handleInputChange} className="input" rows="3" placeholder="Describe what the project does..."></textarea>
                  </div>
                  <div>
                    <label className="label">Technologies (comma separated)</label>
                    <input type="text" name="technologies" value={formData.technologies} onChange={handleInputChange} className="input" placeholder="React, Node.js, MongoDB" />
                  </div>
                  <div>
                    <label className="label">Team Members (comma separated)</label>
                    <input type="text" name="team_members" value={formData.team_members} onChange={handleInputChange} className="input" placeholder="John Doe, Jane Smith" />
                  </div>
                  <div>
                    <label className="label">GitHub URL</label>
                    <input type="url" name="github_url" value={formData.github_url} onChange={handleInputChange} className="input" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="label">Live URL</label>
                    <input type="url" name="live_url" value={formData.live_url} onChange={handleInputChange} className="input" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="input" />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Project Image</label>
                    <input type="file" name="project_image" accept="image/*" onChange={handleInputChange} className="input p-1" />
                  </div>
                  <div className="flex items-center mt-8">
                    <input type="checkbox" name="is_featured" id="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="h-4 w-4 text-primary-600 rounded" />
                    <label htmlFor="is_featured" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                      Feature this project on my profile
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : 'Save Project'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects List */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total: {projects.length}
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-lg font-medium">No projects found</p>
            {searchTerm ? (
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm mt-1">Click "Add Project" to add your first one</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {filteredProjects.map(project => (
              <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 hover:shadow-lg transition-all flex flex-col">
                {project.project_image && (
                  <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <img src={project.project_image} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{project.title}</h3>
                    <div className="flex gap-1 ml-2">
                      {project.is_featured && (
                        <span className="text-yellow-500 text-xl" title="Featured">
                          ★
                        </span>
                      )}

                    </div>
                  </div>

                  <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium rounded-full mb-3 w-max capitalize">
                    {project.category.replace('_', ' ')}
                  </span>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
                    {project.description}
                  </p>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                        <Code className="h-3.5 w-3.5" /> Technologies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    {project.start_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(project.start_date).toLocaleDateString()}
                      </div>
                    )}
                    {project.team_members && project.team_members.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {project.team_members.length} member{project.team_members.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex gap-3">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="GitHub"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}

                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="Live Demo">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(project)} className="btn btn-secondary py-1 px-3 text-xs">Edit</button>
                    <button onClick={() => handleDelete(project.id)} className="btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 py-1 px-3 text-xs border-0">Delete</button>
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
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />
    </div>
  );
}
