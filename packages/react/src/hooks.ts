import { useCallback } from 'react';
import { useApiContext } from './provider';

export function useApi() {
  const { client } = useApiContext();
  
  const get = useCallback(<T>(path: string) => {
    return client.get<T>(path);
  }, [client]);

  const post = useCallback(<T>(path: string, data: unknown) => {
    return client.post<T>(path, data);
  }, [client]);

  const put = useCallback(<T>(path: string, data: unknown) => {
    return client.put<T>(path, data);
  }, [client]);

  const del = useCallback(<T>(path: string) => {
    return client.delete<T>(path);
  }, [client]);

  return { get, post, put, delete: del };
}