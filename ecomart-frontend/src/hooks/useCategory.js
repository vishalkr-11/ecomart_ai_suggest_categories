import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateCategory, listCategoryResults } from '@/api/categoryApi';
import useAppStore from '@/store/appStore';

export function useCategoryGenerator() {
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const setLastCategoryResult   = useAppStore((s) => s.setLastCategoryResult);

  const generate = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateCategory(payload);
      setResult(res.data);
      setLastCategoryResult(res.data);
      toast.success('Product categorised successfully!');
      return res.data;
    } catch (err) {
      const msg = err.message || 'Failed to generate category';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [setLastCategoryResult]);

  return { generate, loading, result, error, setResult };
}

export function useCategoryList() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage]     = useState(1);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await listCategoryResults(p);
      setData(res.data);
      setPage(p);
    } catch {
      toast.error('Failed to load category results');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, page, fetch, setPage };
}
