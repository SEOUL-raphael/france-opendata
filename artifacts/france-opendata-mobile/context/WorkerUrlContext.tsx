import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'france_opendata_worker_url';

interface WorkerUrlContextValue {
  workerUrl: string;
  loaded: boolean;
  saveWorkerUrl: (url: string) => Promise<void>;
}

const WorkerUrlContext = createContext<WorkerUrlContextValue>({
  workerUrl: '',
  loaded: false,
  saveWorkerUrl: async () => {},
});

export function WorkerUrlProvider({ children }: { children: React.ReactNode }) {
  const [workerUrl, setWorkerUrl] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((url) => {
      setWorkerUrl(url ?? '');
      setLoaded(true);
    });
  }, []);

  const saveWorkerUrl = useCallback(async (url: string) => {
    const trimmed = url.trim().replace(/\/$/, '');
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    setWorkerUrl(trimmed);
  }, []);

  return (
    <WorkerUrlContext.Provider value={{ workerUrl, loaded, saveWorkerUrl }}>
      {children}
    </WorkerUrlContext.Provider>
  );
}

export function useWorkerUrl() {
  return useContext(WorkerUrlContext);
}
