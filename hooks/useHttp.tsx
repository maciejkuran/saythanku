import { useState, useCallback } from 'react';

const useHttp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | false>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  const errorAccept = () => {
    setError(false);
  };

  const successAccept = () => {
    setSuccess(false);
  };

  const sendFetchReq = useCallback(async (url: string, config: {} = {}) => {
    try {
      setIsLoading(true);
      setError(false);
      setSuccess(false);
      setData(null);
      const res = await fetch(url, config);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      const data = await res.json();
      setData(data);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    }
    setIsLoading(false);
  }, []);

  return { sendFetchReq, isLoading, data, error, success, errorAccept, successAccept };
};

export default useHttp;
