import apiClient from '../api/recordClient';
import { useState } from 'react';

export default function useUpdateRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateRecord = async (recordId, body)  => {
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/api/records/${recordId}`, body);
      return response.data;

    } catch (err) {
      console.error(err.response?.data?.message || 'Error updating record:');
      // setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateRecord, loading, error };
}
