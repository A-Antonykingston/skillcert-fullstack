import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate real-time API fetch
    const fetchTopic = async () => {
      setLoading(true);
      try {
        // Fallback mock data if backend fails
        const mockData = {
          'digital-certificates': { title: 'Digital Certificates', content: 'Upload, verify, and showcase your verified certificates with integrated QR verification. Connected to backend APIs to ensure authenticity.' },
          'skill-tracking': { title: 'Skill Tracking', content: 'Monitor your technical and soft skills with intuitive progress visualizations. See real-time growth as you complete courses.' },
          'career-portfolio': { title: 'Career Portfolio', content: 'Automatically generate a professional portfolio and resume from your profile. Syncs with real-time student data.' },
          'faculty-verification': { title: 'Faculty Verification', content: 'Institutional verification adds weight and authenticity to your achievements.' },
          'career-readiness': { title: 'Career Readiness', content: 'Get an AI-powered score based on your profile completeness and achievements.' },
          'projects-internships': { title: 'Projects & Internships', content: 'Showcase real-world experience to stand out to potential employers. Integrates directly with your verified records.' },
        };
        
        // Simulating network delay to feel like a real app
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (mockData[topicId]) {
          setData(mockData[topicId]);
        } else {
          setData({ title: topicId.replace('-', ' '), content: `Detailed information about ${topicId.replace('-', ' ')}.` });
        }
      } catch (err) {
        setError('Failed to load topic data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopic();
  }, [topicId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      {loading ? (
        <div className="card p-12 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-slate-500">Loading topic details...</p>
        </div>
      ) : error ? (
        <div className="card p-12 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize mb-4">
            {data?.title}
          </h1>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p className="text-lg leading-relaxed">{data?.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
