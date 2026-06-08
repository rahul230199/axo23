import { useState, useEffect, useCallback } from 'react';
import { buyerApi } from '../services/buyerApi';

export function useBuyerData<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
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
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDashboardStats() {
  return useBuyerData(() => buyerApi.getStats());
}

export function useDashboardCharts() {
  return useBuyerData(() => buyerApi.getChartData());
}

export function useRecentActivity() {
  return useBuyerData(() => buyerApi.getRecentActivity());
}

export function useRFQs(status?: string) {
  return useBuyerData(() => buyerApi.getRFQs(), [status]);
}

export function useRFQ(id: string) {
  return useBuyerData(() => buyerApi.getRFQById(id), [id]);
}

export function useQuotes(rfqId: string) {
  return useBuyerData(() => buyerApi.getQuotesForRFQ(rfqId), [rfqId]);
}

export function usePOs(status?: string) {
  return useBuyerData(() => buyerApi.getPOs(), [status]);
}

export function usePO(id: string) {
  return useBuyerData(() => buyerApi.getPOById(id), [id]);
}

export function useMessages(poId: string) {
  return useBuyerData(() => buyerApi.getMessages(poId), [poId]);
}

export function useSuppliers(search?: string) {
  return useBuyerData(() => buyerApi.getSuppliers(), [search]);
}

export function useProfile() {
  return useBuyerData(() => buyerApi.getProfile());
}
