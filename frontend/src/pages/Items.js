import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, pagination, loading, error, fetchItems } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const pageSize = 10;

  useEffect(() => {
    const abortController = new AbortController();

    fetchItems({
      signal: abortController.signal,
      page: currentPage,
      pageSize,
      q: searchQuery
    }).catch((err) => {
      // Ignore abort errors; log other unexpected errors
      if (err && err.name !== 'AbortError') {
        console.error(err);
      }
    });

    return () => {
      abortController.abort();
    };
  }, [fetchItems, currentPage, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => fetchItems({ page: currentPage, pageSize, q: searchQuery })}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Items</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search items..."
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Search</button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            style={{ padding: '8px 16px', marginLeft: '10px' }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Loading State */}
      {loading && <p>Loading...</p>}

      {/* Items List */}
      {!loading && items.length === 0 && (
        <p>No items found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
      )}

      {!loading && items.length > 0 && (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{ marginBottom: '10px' }}>
                <Link to={'/items/' + item.id} style={{ fontSize: '16px' }}>
                  {item.name}
                </Link>
                {item.price && <span style={{ marginLeft: '10px', color: '#666' }}>
                  ${item.price}
                </span>}
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px' }}
              >
                Previous
              </button>
              
              <span>
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.total} total items)
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                style={{ padding: '8px 16px' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Items;
