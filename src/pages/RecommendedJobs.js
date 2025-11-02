import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiDollarSign, FiBriefcase, FiStar } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs/recommended`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recommended for You</h1>
          <p className="text-gray-600 mt-1">Jobs matched to your skills and experience</p>
        </div>
        <FiStar className="text-yellow-500 text-3xl" />
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-lg mb-4">
            No recommendations available. Try updating your profile with skills and experience.
          </p>
          <Link
            to="/profile"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Update Profile
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => {
            if (!job) return null;
            return (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        #{index + 1} Match
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h2>
                    <p className="text-gray-600 mb-3">{job.company}</p>
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                            ? `${job.salary.min}K - ${job.salary.max}K`
                            : job.salary.min
                            ? `${job.salary.min}K+`
                            : `Up to ${job.salary.max}K`}
                        </span>
                      )}
                      <span className="flex items-center">
                        <FiBriefcase className="mr-1" />
                        {job.experience} years exp.
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills?.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;

