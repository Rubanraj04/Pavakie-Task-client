import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiPackage,
} from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Error loading statistics</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.overview.totalJobs}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {stats.overview.activeJobs} active
              </p>
            </div>
            <FiBriefcase className="text-4xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.overview.totalApplications}
              </p>
            </div>
            <FiFileText className="text-4xl text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.overview.totalUsers}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {stats.overview.totalRecruiters} recruiters, {stats.overview.totalCandidates}{' '}
                candidates
              </p>
            </div>
            <FiUsers className="text-4xl text-green-600" />
          </div>
        </div>
      </div>

      {/* Jobs by Status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Jobs by Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {stats.jobsByStatus.map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 capitalize">{item._id}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Applications by Status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Applications by Status
        </h2>
        <div className="grid md:grid-cols-5 gap-4">
          {stats.applicationsByStatus.map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 capitalize">{item._id}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      {stats.topCompanies && stats.topCompanies.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Companies</h2>
          <div className="space-y-2">
            {stats.topCompanies.map((company, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <FiPackage className="text-gray-600" />
                  <span className="font-medium text-gray-800">{company._id}</span>
                </div>
                <span className="text-gray-600">{company.count} jobs</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

