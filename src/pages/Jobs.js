import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiDollarSign, FiBriefcase, FiSearch, FiZap, FiExternalLink } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProcessing, setSearchProcessing] = useState(false);
  const [processedSearch, setProcessedSearch] = useState(null);
  const [externalLinks, setExternalLinks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    skills: '',
  });

  useEffect(() => {
    // Only fetch all jobs if no search has been performed
    if (!filters.search || filters.search.trim() === '') {
      fetchJobs();
    }
  }, [filters.location, filters.skills]); // Don't auto-search on search text change

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.skills) params.append('skills', filters.skills);

      const response = await axios.get(`${API_URL}/jobs?${params}`);
      setJobs(response.data);
      setProcessedSearch(null);
      setExternalLinks([]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!filters.search || filters.search.trim() === '') {
      fetchJobs();
      setProcessedSearch(null);
      return;
    }

    try {
      setSearchProcessing(true);
      setLoading(true);
      setProcessedSearch(null); // Clear previous search

      const params = new URLSearchParams();
      params.append('q', filters.search.trim());
      if (filters.location) params.append('location', filters.location);
      if (filters.skills) params.append('skills', filters.skills);

      console.log('Searching with:', filters.search);
      const response = await axios.get(`${API_URL}/jobs/search?${params}`);
      console.log('Search response:', response.data);
      
      setJobs(response.data.jobs || []);
      setProcessedSearch(response.data.processedSearch || null);
      setExternalLinks(response.data.externalLinks || []);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
      setProcessedSearch({
        originalQuery: filters.search,
        intent: 'Search error - please try again',
        useAI: false
      });
      setExternalLinks([]);
    } finally {
      setSearchProcessing(false);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Browse Jobs</h1>

      {/* AI-Powered Search Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search with AI... (e.g., 'remote python developer', 'senior software engineer in New York')"
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              value={filters.search}
              onChange={handleFilterChange}
            />
            <button
              type="submit"
              disabled={searchProcessing}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {searchProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <FiZap className="h-5 w-5 text-blue-600 hover:text-blue-800" />
              )}
            </button>
          </div>

          {/* Additional Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="location"
              placeholder="Location (optional)"
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filters.location}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="skills"
              placeholder="Skills (optional)"
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filters.skills}
              onChange={handleFilterChange}
            />
          </div>
        </form>

        {/* AI Processing Results Display */}
        {processedSearch && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <FiZap className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-blue-800">
                {processedSearch.useAI ? 'AI Processed Your Search' : 'Search Results'}
              </h3>
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <p><span className="font-medium">Searching for:</span> <span className="italic">"{processedSearch.intent}"</span></p>
              
              {processedSearch.keywords && processedSearch.keywords.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-gray-800">Click keywords to search:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {processedSearch.keywords.map((keyword, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          const newFilters = { ...filters, search: keyword };
                          setFilters(newFilters);
                          
                          try {
                            setSearchProcessing(true);
                            setLoading(true);
                            const params = new URLSearchParams();
                            params.append('q', keyword);
                            if (newFilters.location) params.append('location', newFilters.location);
                            if (newFilters.skills) params.append('skills', newFilters.skills);
                            
                            const response = await axios.get(`${API_URL}/jobs/search?${params}`);
                            setJobs(response.data.jobs || []);
                            setProcessedSearch(response.data.processedSearch || null);
                            setExternalLinks(response.data.externalLinks || []);
                          } catch (error) {
                            console.error('Error searching:', error);
                          } finally {
                            setSearchProcessing(false);
                            setLoading(false);
                          }
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 hover:text-blue-800 transition cursor-pointer border border-blue-300 pointer-events-auto"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {processedSearch.skills && processedSearch.skills.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-gray-800">Click skills to search:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {processedSearch.skills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          const newFilters = { ...filters, search: skill, skills: skill };
                          setFilters(newFilters);
                          
                          try {
                            setSearchProcessing(true);
                            setLoading(true);
                            const params = new URLSearchParams();
                            params.append('q', skill);
                            params.append('skills', skill);
                            if (newFilters.location) params.append('location', newFilters.location);
                            
                            const response = await axios.get(`${API_URL}/jobs/search?${params}`);
                            setJobs(response.data.jobs || []);
                            setProcessedSearch(response.data.processedSearch || null);
                            setExternalLinks(response.data.externalLinks || []);
                          } catch (error) {
                            console.error('Error searching:', error);
                          } finally {
                            setSearchProcessing(false);
                            setLoading(false);
                          }
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 hover:text-green-800 transition cursor-pointer border border-green-300 pointer-events-auto"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {processedSearch.jobTitle && (
                <div className="mt-3">
                  <span className="font-medium text-gray-800">Job Title Detected:</span>
                  <button
                    onClick={async () => {
                      const newFilters = { ...filters, search: processedSearch.jobTitle };
                      setFilters(newFilters);
                      
                      try {
                        setSearchProcessing(true);
                        setLoading(true);
                        const params = new URLSearchParams();
                        params.append('q', processedSearch.jobTitle);
                        if (newFilters.location) params.append('location', newFilters.location);
                        if (newFilters.skills) params.append('skills', newFilters.skills);
                        
                        const response = await axios.get(`${API_URL}/jobs/search?${params}`);
                        setJobs(response.data.jobs || []);
                        setProcessedSearch(response.data.processedSearch || null);
                      } catch (error) {
                        console.error('Error searching:', error);
                      } finally {
                        setSearchProcessing(false);
                        setLoading(false);
                      }
                    }}
                    className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 hover:text-purple-800 transition cursor-pointer border border-purple-300 pointer-events-auto"
                  >
                    {processedSearch.jobTitle}
                  </button>
                </div>
              )}

              {processedSearch.searchTerms && processedSearch.searchTerms.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-gray-800">Related searches:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {processedSearch.searchTerms.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          const newFilters = { ...filters, search: term };
                          setFilters(newFilters);
                          
                          try {
                            setSearchProcessing(true);
                            setLoading(true);
                            const params = new URLSearchParams();
                            params.append('q', term);
                            if (newFilters.location) params.append('location', newFilters.location);
                            if (newFilters.skills) params.append('skills', newFilters.skills);
                            
                            const response = await axios.get(`${API_URL}/jobs/search?${params}`);
                            setJobs(response.data.jobs || []);
                            setProcessedSearch(response.data.processedSearch || null);
                            setExternalLinks(response.data.externalLinks || []);
                          } catch (error) {
                            console.error('Error searching:', error);
                          } finally {
                            setSearchProcessing(false);
                            setLoading(false);
                          }
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 hover:text-gray-800 transition cursor-pointer border border-gray-300 pointer-events-auto"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Results Summary */}
      {processedSearch && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-gray-700">
              {jobs.length > 0 ? (
                <>
                  Found <span className="font-semibold text-blue-600">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} matching: <span className="font-medium">"{processedSearch.originalQuery}"</span>
                </>
              ) : (
                <span>No jobs found for: <span className="font-medium">"{processedSearch.originalQuery}"</span></span>
              )}
            </div>
            {!processedSearch.useAI && (
              <span className="text-xs text-gray-500">Fast Search</span>
            )}
          </div>
        </div>
      )}

      {/* External Links Description Box */}
      {externalLinks && externalLinks.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiExternalLink className="mr-2 text-blue-600" />
            Search External Job Sites
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Explore more opportunities from popular job search platforms:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {externalLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition mb-1">
                      {link.source}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {link.description}
                    </p>
                    {link.relevance && (
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        link.relevance === 'high' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {link.relevance === 'high' ? 'Highly Relevant' : 'Relevant'}
                      </span>
                    )}
                  </div>
                  <FiExternalLink className="ml-2 text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {loading && !processedSearch ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No jobs found.</p>
            <p className="text-gray-500 text-sm">
              {processedSearch 
                ? "Try adjusting your search description or filters."
                : "Try searching with AI or adjusting your filters."
              }
            </p>
          </div>
        ) : (
          <>
            {jobs.map((job) => {
              if (!job) return null;
              return (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-transparent hover:border-blue-500 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition">
                          {job.title}
                        </h2>
                      </div>
                      <p className="text-gray-600 font-medium mb-2">{job.company}</p>
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
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
                          {job.experience || 0} years exp.
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skills?.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 text-blue-600 flex items-center">
                      <span className="text-sm font-medium">View Details</span>
                      <span className="ml-1">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;

