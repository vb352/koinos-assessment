import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  // fetchItems accepts an AbortSignal
  const fetchItems = useCallback(async (signal) => {
    try {
      const res = await fetch("http://localhost:3001/api/items?limit=500", {
        signal
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const json = await res.json();

      // Only set state if not aborted
      if (!signal?.aborted) {
        setItems(json);
        setError(null);
      }
    } catch (err) {
      // Ignore abort errors - they're expected when component unmounts
      if (err.name === "AbortError") return;
      
      // Only update error state if not aborted
      if (!signal?.aborted) {
        setError(err.message);
        console.error(err);
      }
    }
  }, []);


  return (
    <DataContext.Provider value={{ items, fetchItems, error }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
