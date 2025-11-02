import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiDollarSign, FiBriefcase, FiBookmark, FiUser } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({ coverLetter: '' });

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
    if (user) {
      checkBookmarkStatus();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/applications/my-applications`);
      const hasApplied = response.data.some(
        (app) => app.job._id === id || app.job === id
      );
      setApplied(hasApplied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      const userBookmarks = response.data.bookmarks || [];
      const isBookmarked = userBookmarks.some(
        (jobId) => jobId.toString() === id
      );
      setBookmarked(isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_URL}/jobs/${id}/bookmark`);
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Error bookmarking job:', error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_URL}/applications`, {
        jobId: id,
        coverLetter: applicationData.coverLetter,
        resumeUrl: user.resumeUrl,
      });
      setApplied(true);
      setShowApplicationForm(false);
      alert('Application submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying for job');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Job not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{job.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{job.company}</p>
          </div>
          {user && user.role === 'candidate' && (
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full ${
                bookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <FiBookmark className="text-xl" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          {job.location && (
            <span className="flex items-center">
              <FiMapPin className="mr-1" />
              {job.location}
            </span>
          )}
          {(job.salary?.min || job.salary?.max) && (
            <span className="flex items-center">
              <FiDollarSign className="mr-1" />
              {job.salary.min && job.salary.max
                ? `${job.salary.min}K - ${job.salary.max}K ${job.salary.currency || 'USD'}`
                : job.salary.min
                ? `${job.salary.min}K+ ${job.salary.currency || 'USD'}`
                : `Up to ${job.salary.max}K ${job.salary.currency || 'USD'}`}
            </span>
          )}
          <span className="flex items-center">
            <FiBriefcase className="mr-1" />
            {job.experience} years experience
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {user && user.role === 'candidate' && (
          <div className="mb-6">
            {applied ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                You have already applied for this job
              </div>
            ) : (
              <>
                {!showApplicationForm ? (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Apply Now
                  </button>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows="6"
                        value={applicationData.coverLetter}
                        onChange={(e) =>
                          setApplicationData({ ...applicationData, coverLetter: e.target.value })
                        }
                        placeholder="Tell us why you're a great fit for this position..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Submit Application
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowApplicationForm(false)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Requirements</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {job.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            Posted by: <span className="font-semibold">{job.postedBy?.name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Posted on: {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

