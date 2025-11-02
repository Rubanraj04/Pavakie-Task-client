import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FiUpload, FiUser, FiMail, FiBriefcase, FiMapPin, FiPhone, 
  FiCalendar, FiEdit3, FiPlus, FiX, FiLink, FiDownload, FiEye,
  FiTrash2, FiSave
} from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');

  // Profile state
  const [profile, setProfile] = useState({
    // Personal
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bio: '',
    location: {
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    // Professional
    skills: [],
    experience: 0,
    jobTitle: '',
    currentCompany: '',
    // Arrays
    education: [],
    workHistory: [],
    certifications: [],
    languages: [],
    // Social
    linkedIn: '',
    github: '',
    portfolio: '',
    website: '',
    // Preferences
    preferredJobTypes: [],
    preferredLocations: [],
    salaryExpectation: {
      min: '',
      max: '',
      currency: 'USD'
    },
    availability: 'Immediately',
    // Resume
    resumeUrl: '',
    resumeFileName: '',
    resumeKeywords: [],
    resumeUploadedAt: null
  });

  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/profile`);
      const data = response.data;
      
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        bio: data.bio || '',
        location: {
          city: data.location?.city || '',
          state: data.location?.state || '',
          country: data.location?.country || '',
          zipCode: data.location?.zipCode || ''
        },
        skills: data.skills || [],
        experience: data.experience || 0,
        jobTitle: data.jobTitle || '',
        currentCompany: data.currentCompany || '',
        education: data.education || [],
        workHistory: data.workHistory || [],
        certifications: data.certifications || [],
        languages: data.languages || [],
        linkedIn: data.linkedIn || '',
        github: data.github || '',
        portfolio: data.portfolio || '',
        website: data.website || '',
        preferredJobTypes: data.preferredJobTypes || [],
        preferredLocations: data.preferredLocations || [],
        salaryExpectation: {
          min: data.salaryExpectation?.min || '',
          max: data.salaryExpectation?.max || '',
          currency: data.salaryExpectation?.currency || 'USD'
        },
        availability: data.availability || 'Immediately',
        resumeUrl: data.resumeUrl || '',
        resumeFileName: data.resumeFileName || '',
        resumeKeywords: data.resumeKeywords || [],
        resumeUploadedAt: data.resumeUploadedAt || null
      });

      setSkillsInput(data.skills?.join(', ') || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Error loading profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const updateData = {
        ...profile,
        skills: skillsArray,
        experience: parseInt(profile.experience) || 0,
      };

      await axios.put(`${API_URL}/users/profile`, updateData);
      await fetchUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating profile' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post(`${API_URL}/upload/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile({
        ...profile,
        resumeUrl: response.data.resumeUrl,
        resumeFileName: response.data.fileName,
        resumeKeywords: response.data.keywords || [],
        resumeUploadedAt: new Date()
      });
      
      await fetchUser();
      setMessage({ type: 'success', text: 'Resume uploaded successfully to MongoDB!' });
      
      // Clear file input
      e.target.value = '';
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error uploading resume' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!profile.resumeUrl || !window.confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      // Extract fileId from resumeUrl (format: /api/upload/resume/:fileId)
      let fileId = profile.resumeUrl;
      if (fileId.includes('/')) {
        fileId = fileId.split('/').pop();
      }
      // Remove any query parameters
      fileId = fileId.split('?')[0];
      
      if (!fileId || fileId === 'undefined') {
        throw new Error('Invalid resume file ID');
      }
      
      await axios.delete(`${API_URL}/upload/resume/${fileId}`);
      
      setProfile({
        ...profile,
        resumeUrl: '',
        resumeFileName: '',
        resumeKeywords: [],
        resumeUploadedAt: null
      });
      
      await fetchUser();
      setMessage({ type: 'success', text: 'Resume deleted successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting resume:', error);
      setMessage({ type: 'error', text: 'Error deleting resume' });
    }
  };

  // Helper functions for managing arrays
  const addEducation = () => {
    setProfile({
      ...profile,
      education: [...profile.education, {
        degree: '',
        field: '',
        institution: '',
        startDate: '',
        endDate: '',
        currentlyStudying: false,
        description: ''
      }]
    });
  };

  const removeEducation = (index) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index)
    });
  };

  const addWorkHistory = () => {
    setProfile({
      ...profile,
      workHistory: [...profile.workHistory, {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
        achievements: []
      }]
    });
  };

  const removeWorkHistory = (index) => {
    setProfile({
      ...profile,
      workHistory: profile.workHistory.filter((_, i) => i !== index)
    });
  };

  const addCertification = () => {
    setProfile({
      ...profile,
      certifications: [...profile.certifications, {
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: ''
      }]
    });
  };

  const removeCertification = (index) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter((_, i) => i !== index)
    });
  };

  const addLanguage = () => {
    setProfile({
      ...profile,
      languages: [...profile.languages, {
        language: '',
        proficiency: 'Intermediate'
      }]
    });
  };

  const removeLanguage = (index) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'professional', label: 'Professional', icon: FiBriefcase },
    { id: 'education', label: 'Education', icon: FiEdit3 },
    { id: 'work', label: 'Work History', icon: FiBriefcase },
    { id: 'additional', label: 'Additional', icon: FiLink },
    { id: 'resume', label: 'Resume', icon: FiUpload }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 
        className="text-3xl font-bold text-gray-800 mb-6"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        My Profile
      </h1>

      {/* User Header Card */}
      <div 
        className="bg-white rounded-lg shadow-md p-6 mb-6 card-hover"
        style={{ animation: 'scaleIn 0.5s ease-out' }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300"
            style={{ animation: 'rotateIn 0.6s ease-out' }}
          >
            <FiUser className="text-white text-2xl" />
          </div>
          <div style={{ animation: 'fadeInLeft 0.6s ease-out 0.2s both' }}>
            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-medium shadow-md">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {user?.role === 'candidate' && (
        <>
          {/* Message Alert */}
          {message.text && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg shadow-lg ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border-2 border-red-300'
                  : 'bg-green-50 text-green-700 border-2 border-green-300'
              }`}
              style={{ animation: 'slideDown 0.4s ease-out' }}
            >
              <div className="flex items-center">
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div 
            className="bg-white rounded-lg shadow-md mb-6 overflow-hidden"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
          >
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap -mb-px">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{ animation: `fadeInRight 0.4s ease-out ${index * 0.1}s both` }}
                    >
                      <Icon className="mr-2 transition-transform duration-300" style={{ 
                        transform: activeTab === tab.id ? 'rotate(5deg) scale(1.1)' : 'none' 
                      }} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600"></span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <form 
            onSubmit={handleUpdate} 
            className="bg-white rounded-lg shadow-md p-6 card-hover"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
          >
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiUser className="mr-2 text-blue-600" />
                  Personal Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.location.city}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        location: { ...profile.location, city: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.location.state}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        location: { ...profile.location, state: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.location.country}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        location: { ...profile.location, country: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.location.zipCode}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        location: { ...profile.location, zipCode: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio/About Me
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{profile.bio.length}/1000 characters</p>
                </div>
              </div>
            )}

            {/* Professional Information Tab */}
            {activeTab === 'professional' && (
              <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiBriefcase className="mr-2 text-blue-600" />
                  Professional Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Job Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Company
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.currentCompany}
                      onChange={(e) => setProfile({ ...profile, currentCompany: e.target.value })}
                      placeholder="e.g., Tech Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={profile.experience}
                      onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={profile.availability}
                      onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                    >
                      <option value="Immediately">Immediately</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3+ months">3+ months</option>
                      <option value="Not looking">Not looking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="JavaScript, React, Node.js, Python"
                  />
                </div>

                {/* Salary Expectation */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Expectation</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min (USD)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={profile.salaryExpectation.min}
                        onChange={(e) => setProfile({
                          ...profile,
                          salaryExpectation: { ...profile.salaryExpectation, min: e.target.value }
                        })}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max (USD)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={profile.salaryExpectation.max}
                        onChange={(e) => setProfile({
                          ...profile,
                          salaryExpectation: { ...profile.salaryExpectation, max: e.target.value }
                        })}
                        placeholder="100000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={profile.salaryExpectation.currency}
                        onChange={(e) => setProfile({
                          ...profile,
                          salaryExpectation: { ...profile.salaryExpectation, currency: e.target.value }
                        })}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiEdit3 className="mr-2 text-blue-600" />
                    Education
                  </h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 btn-animate"
                  >
                    <FiPlus className="mr-2" />
                    Add Education
                  </button>
                </div>

                {profile.education.map((edu, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-4 space-y-4 card-hover"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">Education #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...profile.education];
                            newEdu[index].degree = e.target.value;
                            setProfile({ ...profile, education: newEdu });
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field of Study *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={edu.field}
                          onChange={(e) => {
                            const newEdu = [...profile.education];
                            newEdu[index].field = e.target.value;
                            setProfile({ ...profile, education: newEdu });
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institution *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...profile.education];
                            newEdu[index].institution = e.target.value;
                            setProfile({ ...profile, education: newEdu });
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newEdu = [...profile.education];
                            newEdu[index].startDate = e.target.value;
                            setProfile({ ...profile, education: newEdu });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newEdu = [...profile.education];
                            newEdu[index].endDate = e.target.value;
                            setProfile({ ...profile, education: newEdu });
                          }}
                          disabled={edu.currentlyStudying}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={edu.currentlyStudying}
                          onChange={(e) => {
                            const newEdu = [...profile.education];
                            newEdu[index].currentlyStudying = e.target.checked;
                            setProfile({ ...profile, education: newEdu });
                          }}
                        />
                        <label className="text-sm text-gray-700">Currently Studying</label>
                      </div>
                    </div>
                  </div>
                ))}

                {profile.education.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No education entries. Click "Add Education" to add one.</p>
                )}
              </div>
            )}

            {/* Work History Tab */}
            {activeTab === 'work' && (
              <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiBriefcase className="mr-2 text-blue-600" />
                    Work History
                  </h2>
                  <button
                    type="button"
                    onClick={addWorkHistory}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 btn-animate"
                  >
                    <FiPlus className="mr-2" />
                    Add Experience
                  </button>
                </div>

                {profile.workHistory.map((work, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-4 space-y-4 card-hover"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">Experience #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeWorkHistory(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={work.title}
                          onChange={(e) => {
                            const newWork = [...profile.workHistory];
                            newWork[index].title = e.target.value;
                            setProfile({ ...profile, workHistory: newWork });
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={work.company}
                          onChange={(e) => {
                            const newWork = [...profile.workHistory];
                            newWork[index].company = e.target.value;
                            setProfile({ ...profile, workHistory: newWork });
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={work.location}
                          onChange={(e) => {
                            const newWork = [...profile.workHistory];
                            newWork[index].location = e.target.value;
                            setProfile({ ...profile, workHistory: newWork });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={work.startDate ? new Date(work.startDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newWork = [...profile.workHistory];
                            newWork[index].startDate = e.target.value;
                            setProfile({ ...profile, workHistory: newWork });
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={work.endDate ? new Date(work.endDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newWork = [...profile.workHistory];
                            newWork[index].endDate = e.target.value;
                            setProfile({ ...profile, workHistory: newWork });
                          }}
                          disabled={work.currentlyWorking}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={work.currentlyWorking}
                          onChange={(e) => {
                            const newWork = [...profile.workHistory];
                            newWork[index].currentlyWorking = e.target.checked;
                            setProfile({ ...profile, workHistory: newWork });
                          }}
                        />
                        <label className="text-sm text-gray-700">Currently Working Here</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        value={work.description}
                        onChange={(e) => {
                          const newWork = [...profile.workHistory];
                          newWork[index].description = e.target.value;
                          setProfile({ ...profile, workHistory: newWork });
                        }}
                      />
                    </div>
                  </div>
                ))}

                {profile.workHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No work history entries. Click "Add Experience" to add one.</p>
                )}
              </div>
            )}

            {/* Additional Information Tab */}
            {activeTab === 'additional' && (
              <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiLink className="mr-2 text-blue-600" />
                  Additional Information
                </h2>

                {/* Certifications */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Certifications</h3>
                    <button
                      type="button"
                      onClick={addCertification}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 btn-animate"
                    >
                      <FiPlus className="mr-2" />
                      Add Certification
                    </button>
            </div>

                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-800">Certification #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          className="px-4 py-2 border border-gray-300 rounded-md"
                          placeholder="Certification Name"
                          value={cert.name}
                          onChange={(e) => {
                            const newCerts = [...profile.certifications];
                            newCerts[index].name = e.target.value;
                            setProfile({ ...profile, certifications: newCerts });
                          }}
                        />
                        <input
                          type="text"
                          className="px-4 py-2 border border-gray-300 rounded-md"
                          placeholder="Issuer"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newCerts = [...profile.certifications];
                            newCerts[index].issuer = e.target.value;
                            setProfile({ ...profile, certifications: newCerts });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Languages */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Languages</h3>
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 btn-animate"
                    >
                      <FiPlus className="mr-2" />
                      Add Language
                    </button>
                  </div>

                  {profile.languages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-4 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                        placeholder="Language"
                        value={lang.language}
                        onChange={(e) => {
                          const newLangs = [...profile.languages];
                          newLangs[index].language = e.target.value;
                          setProfile({ ...profile, languages: newLangs });
                        }}
                      />
                      <select
                        className="px-4 py-2 border border-gray-300 rounded-md"
                        value={lang.proficiency}
                        onChange={(e) => {
                          const newLangs = [...profile.languages];
                          newLangs[index].proficiency = e.target.value;
                          setProfile({ ...profile, languages: newLangs });
                        }}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Native">Native</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        value={profile.linkedIn}
                        onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        value={profile.github}
                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        value={profile.portfolio}
                        onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiUpload className="mr-2 text-blue-600" />
                  Resume Management
                </h2>

                {profile.resumeUrl && profile.resumeFileName ? (
                  <div 
                    className="border border-gray-200 rounded-lg p-6 card-hover bg-gradient-to-br from-blue-50 to-indigo-50"
                    style={{ animation: 'scaleIn 0.5s ease-out' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{profile.resumeFileName}</h3>
                        {profile.resumeUploadedAt && (
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(profile.resumeUploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`${API_URL}${profile.resumeUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <FiDownload className="mr-2" />
                          Download
                        </a>
                        <a
                          href={`${API_URL}${profile.resumeUrl}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          <FiEye className="mr-2" />
                          View
                        </a>
                        <button
                          type="button"
                          onClick={handleDeleteResume}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <FiTrash2 className="mr-2" />
                          Delete
                        </button>
                      </div>
                </div>

                {profile.resumeKeywords && profile.resumeKeywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Extracted Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.resumeKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 mb-4">No resume uploaded yet</p>
            )}

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Resume (PDF or DOC/DOCX) - Stored in MongoDB
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && (
                    <p className="mt-2 text-sm text-gray-600">Uploading and parsing resume to MongoDB...</p>
              )}
            </div>
          </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t">
              <button
                type="submit"
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium btn-animate"
              >
                <FiSave className="mr-2" />
                Save Profile
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;
