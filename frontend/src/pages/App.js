import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
      }}>
        <nav 
          role="navigation"
          aria-label="Main navigation"
          style={{
            backgroundColor: '#fff',
            borderBottom: '1px solid #e8e8e8',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link 
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#0066cc',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#0052a3'}
              onMouseLeave={(e) => e.target.style.color = '#0066cc'}
            >
              <span style={{ fontSize: '24px' }}>📦</span>
              <span>Items Store</span>
            </Link>
            
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Koinos Assessment</span>
            </div>
          </div>
        </nav>

        <main role="main" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
          </Routes>
        </main>

        <footer 
          role="contentinfo"
          style={{
            marginTop: '60px',
            padding: '24px 20px',
            backgroundColor: '#fff',
            borderTop: '1px solid #e8e8e8',
            textAlign: 'center'
          }}
        >
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Built with React • Node.js • Express
          </p>
        </footer>
      </div>
    </DataProvider>
  );
}

export default App;