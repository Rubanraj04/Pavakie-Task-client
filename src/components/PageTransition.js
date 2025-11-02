import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Component
 * Provides smooth fade and slide animations between page transitions
 */
const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="page-transition"
      style={{
        animation: 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;

