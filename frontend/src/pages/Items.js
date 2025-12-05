// src/pages/Items.js
import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  // get context (default in provider ensures this is never undefined)
  const context = useData() || {};
  const {
    items = [],
    pagination = null,
    loading = false,
    error = null,
    fetchItems = () => Promise.resolve()
  } = context;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  const pageSize = 50;

  // Fetch items whenever page or search changes
  useEffect(() => {
    const controller = new AbortController();

    fetchItems({
      signal: controller.signal,
      page: currentPage,
      pageSize,
      q: searchQuery
    }).catch(err => {
      if (err && err.name !== 'AbortError') {
        console.error(err);
      }
    });

    return () => controller.abort();
  }, [fetchItems, currentPage, searchQuery]);

  // Group items by category (defensive: items may be empty or not an array)
  const itemsByCategory = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return {};
    return items.reduce((acc, item) => {
      const category = item?.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [items]);

  // Initialize expandedCategories when categories change (all expanded by default)
  useEffect(() => {
    const categories = Object.keys(itemsByCategory || {});
    const initial = categories.reduce((acc, cat) => {
      acc[cat] = true;
      return acc;
    }, {});
    setExpandedCategories(initial);
  }, [itemsByCategory]);

  const toggleCategory = (cat) =>
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (!pagination) return;
    const np = Math.max(1, Math.min(newPage, pagination.totalPages));
    setCurrentPage(np);
    window.scrollTo(0, 0);
  };

  // Render error
  if (error) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff5f5',
          border: '2px solid #feb2b2',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#c53030', margin: '0 0 12px 0', fontSize: '20px' }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: '#742a2a', marginBottom: '20px' }}>
            {error}
          </p>
          <button 
            onClick={() => fetchItems({ page: currentPage, pageSize, q: searchQuery })}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#fff',
              backgroundColor: '#c53030',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#9b2c2c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#c53030'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
    }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: '#1a1a1a',
          margin: '0 0 10px 0'
        }}>
          Items
        </h1>

        {!loading && pagination && (
          <p style={{ 
            color: '#666', 
            fontSize: '14px',
            margin: 0
          }} aria-live="polite">
            Showing {items.length} of {pagination.total} items
          </p>
        )}
      </header>

      {/* Search Form */}
      <form 
        onSubmit={handleSearch} 
        role="search"
        aria-label="Search items"
        style={{ 
          marginBottom: '30px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: '1', minWidth: '250px', maxWidth: '500px' }}>
          <input
            id="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search items by name..."
            disabled={loading}
            style={{ 
              padding: '12px 16px',
              width: '100%',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
              backgroundColor: loading ? '#f5f5f5' : '#fff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0066cc';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,102,204,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#fff',
            backgroundColor: loading ? '#ccc' : '#0066cc',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: loading ? 'none' : '0 2px 4px rgba(0,102,204,0.2)'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#0052a3')}
          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#0066cc')}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            disabled={loading}
            style={{ 
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              color: loading ? '#999' : '#666',
              backgroundColor: loading ? '#f0f0f0' : '#f5f5f5',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#e8e8e8';
                e.target.style.borderColor = '#ccc';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.borderColor = '#e0e0e0';
              }
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div role="status" aria-live="polite" aria-label="Loading items">
          <div style={{ marginBottom: '12px' }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#f8f8f8',
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  height: '60px',
                  animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}</style>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!Array.isArray(items) || items.length === 0) && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #e0e0e0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {searchQuery ? '🔍' : '📦'}
          </div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#374151',
            margin: '0 0 8px 0'
          }}>
            {searchQuery ? 'No items found' : 'No items available'}
          </h2>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {searchQuery 
              ? `No results for "${searchQuery}". Try a different search term.`
              : 'There are no items to display at the moment.'}
          </p>
        </div>
      )}

      {!loading && Array.isArray(items) && items.length > 0 && (
        <>
          {/* Grouped list */}
          {Object.keys(itemsByCategory || {})
            .sort()
            .map((category) => {
              const categoryItems = itemsByCategory[category] || [];
              const isExpanded = !!expandedCategories[category];
              const categoryEmoji = category === 'Electronics' ? '💻' : category === 'Furniture' ? '🪑' : '📦';

              return (
                <section key={category} style={{ marginBottom: 24 }}>
                  <button
                    onClick={() => toggleCategory(category)}
                    aria-expanded={isExpanded}
                    aria-controls={`category-${category}`}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: '#fff',
                      border: '2px solid #e8e8e8',
                      borderRadius: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0066cc';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e8e8e8';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{categoryEmoji}</span>
                      <span style={{ color: '#1a1a1a' }}>{category}</span>
                      <span style={{ 
                        color: '#6b7280', 
                        fontWeight: 500, 
                        fontSize: '14px',
                        backgroundColor: '#f3f4f6',
                        padding: '4px 12px',
                        borderRadius: '12px'
                      }}>
                        {categoryItems.length}
                      </span>
                    </div>
                    <div style={{ 
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: '#0066cc',
                      fontSize: '14px'
                    }}>
                      ▶
                    </div>
                  </button>

                  {isExpanded && (
                    <ul
                      id={`category-${category}`}
                      role="list"
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '12px 0 0 0',
                      }}
                    >
                      {categoryItems.map((item, index) => (
                        <li
                          key={item.id}
                          style={{
                            marginBottom: '8px',
                            animation: `fadeIn 0.3s ease-in ${index * 0.03}s both`
                          }}
                        >
                          <Link
                            to={'/items/' + item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '16px 20px',
                              fontSize: '16px',
                              textDecoration: 'none',
                              color: '#1a1a1a',
                              backgroundColor: '#fff',
                              border: '1px solid #e8e8e8',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#0066cc';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.15)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e8e8e8';
                              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <span style={{ fontWeight: '500', flex: 1 }}>
                              {item.name}
                            </span>
                            {item.price && (
                              <span style={{
                                color: '#0066cc',
                                fontWeight: '600',
                                fontSize: '16px',
                                marginLeft: '16px'
                              }}>
                                ${Number(item.price).toFixed(2)}
                              </span>
                            )}
                            <span style={{
                              marginLeft: '12px',
                              color: '#999',
                              fontSize: '20px'
                            }}>
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <nav 
              aria-label="Pagination navigation"
              style={{ 
                marginTop: '32px',
                padding: '24px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                style={{ 
                  padding: '10px 20px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: currentPage === 1 ? '#999' : '#374151',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.borderColor = '#0066cc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                <span>←</span> Previous
              </button>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ 
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <span style={{ 
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  {pagination.total} total items
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                aria-label="Go to next page"
                style={{ 
                  padding: '10px 20px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: currentPage === pagination.totalPages ? '#999' : '#374151',
                  backgroundColor: currentPage === pagination.totalPages ? '#f5f5f5' : '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== pagination.totalPages) {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.borderColor = '#0066cc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== pagination.totalPages) {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                Next <span>→</span>
              </button>
            </nav>
          )}

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

export default Items;
