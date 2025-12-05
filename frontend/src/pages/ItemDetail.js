import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    
    setLoading(true);
    setError(null);
    
    fetch('http://localhost:3001/api/items/' + id, { signal: abortController.signal })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Item not found');
          }
          throw new Error('Failed to load item');
        }
        return res.json();
      })
      .then(data => {
        if (!abortController.signal.aborted) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError' && !abortController.signal.aborted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => abortController.abort();
  }, [id]);

  if (loading) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#f8f8f8',
          borderRadius: '12px',
          padding: '32px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <div style={{
            width: '60%',
            height: '32px',
            backgroundColor: '#e0e0e0',
            borderRadius: '8px',
            marginBottom: '24px'
          }} />
          <div style={{
            width: '40%',
            height: '20px',
            backgroundColor: '#e0e0e0',
            borderRadius: '6px',
            marginBottom: '16px'
          }} />
          <div style={{
            width: '30%',
            height: '20px',
            backgroundColor: '#e0e0e0',
            borderRadius: '6px'
          }} />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#fff5f5',
          border: '2px solid #feb2b2',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#c53030',
            margin: '0 0 12px 0'
          }}>
            {error}
          </h2>
          <p style={{ color: '#742a2a', marginBottom: '24px' }}>
            The item you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#fff',
              backgroundColor: '#0066cc',
              border: 'none',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0052a3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#0066cc'}
          >
            ← Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
    }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          fontSize: '15px',
          color: '#0066cc',
          textDecoration: 'none',
          fontWeight: '500',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = '#0052a3'}
        onMouseLeave={(e) => e.target.style.color = '#0066cc'}
      >
        <span>←</span> Back to Items
      </Link>

      <article style={{
        backgroundColor: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        animation: 'fadeIn 0.4s ease-in'
      }}>
        <header style={{ marginBottom: '32px', borderBottom: '2px solid #f0f0f0', paddingBottom: '24px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: '0 0 8px 0'
          }}>
            {item.name}
          </h1>
          {item.category && (
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: '#e6f3ff',
              color: '#0066cc',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {item.category}
            </span>
          )}
        </header>

        <dl style={{ margin: 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 1fr',
            gap: '16px',
            padding: '20px 0',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <dt style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Item ID
            </dt>
            <dd style={{
              margin: 0,
              fontSize: '16px',
              color: '#374151',
              fontFamily: 'monospace'
            }}>
              {item.id}
            </dd>
          </div>

          {item.price && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '16px',
              padding: '20px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <dt style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Price
              </dt>
              <dd style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: '#0066cc'
              }}>
                ${Number(item.price).toFixed(2)}
              </dd>
            </div>
          )}

          {item.category && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '16px',
              padding: '20px 0'
            }}>
              <dt style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Category
              </dt>
              <dd style={{
                margin: 0,
                fontSize: '16px',
                color: '#374151'
              }}>
                {item.category}
              </dd>
            </div>
          )}
        </dl>
      </article>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ItemDetail;