import { useState, useCallback } from 'react';
import apiClient from '../api/client';
import { useRouter } from 'expo-router';

const useCreateRecord = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRecord = useCallback(async (postData = { id: 1 }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post('/api/patients', postData);
      

      const location = response.headers.location;
      if (location) {
        router.push({
          pathname: '/(tabs)/MedicalRecordScreen',
          params: { 
            location: encodeURIComponent(location)
          }
        });
      }

      return location;
    } catch (err) {
      setError(err.response?.data?.message || 'Error desconocido');
      throw err;
      
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { createRecord, isLoading, error };
};

export default useCreateRecord;