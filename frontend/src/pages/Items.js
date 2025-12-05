import React, { useEffect } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, fetchItems } = useData();

  useEffect(() => {
    // Create AbortController to cancel fetch on unmount
    const abortController = new AbortController();

    // Pass abort signal to fetchItems
    fetchItems(abortController.signal).catch((error) => {
      // Ignore abort errors
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });

    // Clean up: abort fetch when component unmounts
    return () => {
      abortController.abort();
    };
  }, [fetchItems]);

  if (!items.length) return <p>Loading...</p>;

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <Link to={'/items/' + item.id}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Items;