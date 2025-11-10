import { useState, useEffect, useCallback } from 'react';
import { cityApi, categoryApi, serviceApi, eventsApi } from '../services/api';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    execute();
  }, dependencies);

  const refetch = () => {
    execute();
  };

  return { data, loading, error, refetch };
};

// Specific hooks for each API endpoint
export const useCities = () => {
  return useApi(cityApi.getAll);
};

export const useCity = (id) => {
  return useApi(() => cityApi.getById(id), [id]);
};

export const useCategories = () => {
  return useApi(categoryApi.getAll);
};

export const useCategory = (id) => {
  return useApi(() => categoryApi.getById(id), [id]);
};

export const useServices = () => {
  return useApi(serviceApi.getAll);
};

export const useService = (id) => {
  return useApi(() => serviceApi.getById(id), [id]);
};

export const useEvents = () => {
  return useApi(eventsApi.getAll);
};

export const useEvent = (id) => {
  return useApi(() => eventsApi.getById(id), [id]);
};

export const useEventsByCategory = (category) => {
  return useApi(() => eventsApi.getByCategory(category), [category]);
};

export const useEventFeed = () => {
  return useApi(eventsApi.getFeed);
};

export const useEventDetails = (id) => {
  return useApi(() => eventsApi.getDetails(id), [id]);
};

export const usePopularEvents = () => {
  return useApi(eventsApi.getPopular);
};

export const useFeaturedEvents = () => {
  return useApi(eventsApi.getFeatured);
};

// Hook for mutations (create, update, delete)
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeMutation = useCallback(async (mutationFunction) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutationFunction();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('API mutation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, executeMutation };
}; 