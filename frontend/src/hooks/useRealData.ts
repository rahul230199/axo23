import { useState, useEffect, useCallback } from 'react';
import { realApi } from '../services/realApi';

export function useRealData<T>(fetchFn: () => Promise<T>, deps: any[] = [], pollInterval?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
    if (pollInterval) {
      const interval = setInterval(fetchData, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollInterval]);

  return { data, loading, error, refetch: fetchData };
}

// Buyer hooks
export const useDashboardData = () => useRealData(() => realApi.getDashboard(), [], 10000);
export const useRFQs = () => useRealData(() => realApi.getRFQs(), [], 10000);
export const useRFQ = (id: string) => useRealData(() => realApi.getRFQById(id), [id], 10000);
export const usePOs = () => useRealData(() => realApi.getPOs(), [], 10000);
export const usePO = (id: string) => useRealData(() => realApi.getPOById(id), [id], 10000);

// Supplier hooks
export const useSupplierDashboard = () => useRealData(() => realApi.getDashboard(), [], 10000);
export const useAvailableRFQs = () => useRealData(() => realApi.getSupplierRFQs(), [], 10000);
export const useSupplierQuotes = () => useRealData(() => realApi.getSupplierQuotes(), [], 10000);
export const useSupplierPOs = () => useRealData(() => realApi.getSupplierPOs(), [], 10000);
export const useSupplierPO = (id: string) => useRealData(() => realApi.getSupplierPOById(id), [id], 10000);

// Shared hooks
export const useMessages = (poId: string) => useRealData(() => realApi.getMessages(poId), [poId], 10000);
export const useDocuments = (entityId?: string, entityType?: string) =>
  useRealData(() => realApi.getDocuments({ entityId, entityType }), [entityId, entityType], 5000);
export const useNotifications = () => useRealData(() => realApi.getNotifications(), [], 10000);
export const useProfile = () => useRealData(() => realApi.getProfile(), [], 10000);
