import { useAppSelector } from '@/store';
import { isLoading } from '@/store/feature/loading';

export const useLoading = (key: string | string[]) => {
  const loginLoading = useAppSelector((state) => isLoading(state, key));
  return loginLoading;
};
