import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBriefcase, FiTrendingUp, FiUsers } from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Job with AI
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Get personalized job recommendations based on your skills and experience
            </p>
            {!user && (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/jobs"
                  className="inline-block px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Browse Jobs
                </Link>
              </div>
            )}
            {user && (
              <div className="space-x-4">
                <Link
                  to="/recommended"
                  className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  View Recommendations
                </Link>
                <Link
                  to="/jobs"
                  className="inline-block px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Browse All Jobs
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
          <p className="text-gray-600">AI-powered job matching for better opportunities</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <FiTrendingUp className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
            <p className="text-gray-600">
              Get personalized job recommendations powered by advanced AI and machine learning
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <FiBriefcase className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Wide Range of Jobs</h3>
            <p className="text-gray-600">
              Browse thousands of job openings from top companies across various industries
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <FiUsers className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">For Everyone</h3>
            <p className="text-gray-600">
              Whether you're a candidate looking for opportunities or a recruiter posting jobs
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Join thousands of job seekers finding their perfect match</p>
          {!user && (
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Your Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

