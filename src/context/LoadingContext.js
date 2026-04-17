'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Loader from '@/components/Loader';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingConfig, setLoadingConfig] = useState({
    isLoading: false,
    customization: {}
  });

  const showLoader = useCallback((config = {}) => {
    setLoadingConfig({
      isLoading: true,
      customization: config
    });
  }, []);

  const hideLoader = useCallback(() => {
    setLoadingConfig(prev => ({
      ...prev,
      isLoading: false
    }));
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader, isLoading: loadingConfig.isLoading }}>
      {children}
      <Loader isLoading={loadingConfig.isLoading} customization={loadingConfig.customization} />
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
