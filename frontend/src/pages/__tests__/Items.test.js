import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Items from '../Items';
import { DataProvider } from '../../state/DataContext';

// Mock fetch
global.fetch = jest.fn();

const mockItems = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Ergonomic Chair', category: 'Furniture', price: 799 }
];

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <DataProvider>
        {component}
      </DataProvider>
    </BrowserRouter>
  );
};

describe('Items Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders Items heading', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 }
      })
    });

    renderWithProviders(<Items />);
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    
    renderWithProviders(<Items />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('displays items grouped by category', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockItems,
        pagination: { page: 1, pageSize: 50, total: 2, totalPages: 1 }
      })
    });

    renderWithProviders(<Items />);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Furniture')).toBeInTheDocument();
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      expect(screen.getByText('Ergonomic Chair')).toBeInTheDocument();
    });
  });

  test('search form is rendered', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 }
      })
    });

    renderWithProviders(<Items />);
    expect(screen.getByPlaceholderText('Search items by name...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('handles search input changes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockItems,
        pagination: { page: 1, pageSize: 50, total: 2, totalPages: 1 }
      })
    });

    renderWithProviders(<Items />);

    const searchInput = screen.getByPlaceholderText('Search items by name...');
    fireEvent.change(searchInput, { target: { value: 'Laptop' } });
    
    expect(searchInput.value).toBe('Laptop');
  });

  test('displays empty state when no items found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 }
      })
    });

    renderWithProviders(<Items />);

    await waitFor(() => {
      expect(screen.getByText('No items available')).toBeInTheDocument();
    });
  });

  test('displays item prices correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockItems,
        pagination: { page: 1, pageSize: 50, total: 2, totalPages: 1 }
      })
    });

    renderWithProviders(<Items />);

    await waitFor(() => {
      expect(screen.getByText('$2499.00')).toBeInTheDocument();
      expect(screen.getByText('$799.00')).toBeInTheDocument();
    });
  });

  test('category sections can be toggled', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockItems,
        pagination: { page: 1, pageSize: 50, total: 2, totalPages: 1 }
      })
    });

    renderWithProviders(<Items />);

    await waitFor(() => {
      const electronicsButton = screen.getByRole('button', { name: /electronics/i });
      expect(electronicsButton).toBeInTheDocument();
      
      // Category should be expanded by default
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      
      // Click to collapse
      fireEvent.click(electronicsButton);
    });
  });

  test('displays pagination when multiple pages exist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockItems,
        pagination: { page: 1, pageSize: 50, total: 100, totalPages: 2 }
      })
    });

    renderWithProviders(<Items />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });
  });

  test('displays item count in header', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockItems,
        pagination: { page: 1, pageSize: 50, total: 2, totalPages: 1 }
      })
    });

    renderWithProviders(<Items />);

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 items/i)).toBeInTheDocument();
    });
  });
});
