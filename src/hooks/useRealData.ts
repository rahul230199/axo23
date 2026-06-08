import { useState, useEffect, useCallback } from 'react';
import { realApi } from '../services/realApi';
import { DashboardData, RFQ, Quote, PurchaseOrder, SupplierDashboardData } from '../types/real.types';

export function useRealData<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
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

// Buyer Hooks
export const useDashboardData = () => useRealData<DashboardData>(() => realApi.getDashboardData());
export const useRFQs = (status?: string) => useRealData<RFQ[]>(() => realApi.getRFQs({ status }), [status]);
export const useRFQ = (id: string) => useRealData<RFQ>(() => realApi.getRFQById(id), [id]);
export const useQuotes = (rfqId: string) => useRealData<Quote[]>(() => realApi.getQuotesForRFQ(rfqId), [rfqId]);
export const usePOs = (status?: string) => useRealData<PurchaseOrder[]>(() => realApi.getPOs({ status }), [status]);
export const usePO = (id: string) => useRealData<PurchaseOrder>(() => realApi.getPOById(id), [id]);

// Supplier Hooks
export const useSupplierDashboard = () => useRealData<SupplierDashboardData>(() => realApi.getSupplierDashboard());
export const useAvailableRFQs = () => useRealData<RFQ[]>(() => realApi.getAvailableRFQs());
export const useSupplierRFQ = (id: string) => useRealData<RFQ>(() => realApi.getSupplierRFQById(id), [id]);
export const useSupplierQuotes = () => useRealData<Quote[]>(() => realApi.getSupplierQuotes());
export const useSupplierPOs = () => useRealData<PurchaseOrder[]>(() => realApi.getSupplierPOs());
export const useSupplierPO = (id: string) => useRealData<PurchaseOrder>(() => realApi.getSupplierPOById(id), [id]);

// Shared Hooks
export const useMessages = (poId: string) => useRealData<any[]>(() => realApi.getMessages(poId), [poId]);
export const useSuppliers = (search?: string) => useRealData<any[]>(() => realApi.getSuppliers({ search }), [search]);
export const useProfile = () => useRealData<any>(() => realApi.getProfile());
