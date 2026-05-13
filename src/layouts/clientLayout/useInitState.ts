import { useAppDispatch } from '@/store';
import { setNetwork } from '@/store/feature/gateway/gatewaySlice';
import { useEffect } from 'react';

export const useInitState = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleNetworkChange = () => {
      dispatch(setNetwork(navigator.onLine));
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);
};
