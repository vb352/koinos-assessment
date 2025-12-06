import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock fetch
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 }
      })
    });
  });

  test('renders navigation with Items Store branding', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Items Store')).toBeInTheDocument();
  });

  test('renders footer with technology stack', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Built with React • Node.js • Express/i)).toBeInTheDocument();
  });

  test('renders Items page by default', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  test('has Koinos label in header', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Koinos')).toBeInTheDocument();
  });
});
