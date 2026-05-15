import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export const useFetch = (request, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request();
      setData(result.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refetch: load, setData };
};
