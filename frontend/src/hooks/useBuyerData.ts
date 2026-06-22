import { useRealData } from './useRealData';
import { realApi } from '../services/realApi';

export const useRFQs = () => useRealData<any[]>(() => realApi.getRFQs());
export const useDashboardData = () => useRealData<any>(() => realApi.getDashboard());
export const useRFQ = (id: string) => useRealData<any>(() => realApi.getRFQById(id), [id]);
export const usePOs = () => useRealData<any[]>(() => realApi.getPOs());
export const usePO = (id: string) => useRealData<any>(() => realApi.getPOById(id), [id]);
export const useProfile = () => useRealData<any>(() => realApi.getProfile());
