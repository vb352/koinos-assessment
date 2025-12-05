import React, { createContext, useCallback, useContext, useState } from 'react';

// Default value ensures useData() never returns undefined
const defaultValue = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  fetchItems: () => Promise.resolve()
};

const DataContext = createContext(defaultValue);

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // fetchItems accepts options: signal, page, pageSize, search query
  const fetchItems = useCallback(async (options = {}) => {
    const { signal, page = 1, pageSize = 10, q = '' } = options;
    
    try {
      setLoading(true);
      
      // Build query string
      const params = new URLSearchParams();
      if (page && pageSize) {
        params.append('page', page);
        params.append('pageSize', pageSize);
      }
      if (q) {
        params.append('q', q);
      }

      const url = `http://localhost:3001/api/items?${params.toString()}`;
      const res = await fetch(url, { signal });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const json = await res.json();

      // Only set state if not aborted
      if (!signal?.aborted) {
        // Handle paginated response
        if (json.data && json.pagination) {
          setItems(json.data);
          setPagination(json.pagination);
        } else {
          // Handle non-paginated response (backward compatibility)
          setItems(json);
          setPagination(null);
        }
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      // Ignore abort errors - they're expected when component unmounts
      if (err.name === "AbortError") return;
      
      // Only update error state if not aborted
      if (!signal?.aborted) {
        setError(err.message);
        setLoading(false);
        console.error(err);
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, pagination, loading, error, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
