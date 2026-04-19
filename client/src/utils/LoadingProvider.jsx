import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { registerLoader } from './LoadingService';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingTasks, setLoadingTasks] = useState(0);

  const showLoader = useCallback(() => {
    setLoadingTasks(prev => prev + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setLoadingTasks(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    registerLoader(showLoader, hideLoader);
  }, [showLoader, hideLoader]);

  const isLoading = loadingTasks > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
