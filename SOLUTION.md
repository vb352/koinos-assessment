# Solution Documentation

This document describes the approach and trade-offs for the take-home assessment fixes.

## Backend Fixes

### 1. Blocking I/O → Async Operations
**Problem**: `fs.readFileSync` blocked the event loop, preventing the server from handling other requests.

**Solution**: 
- Converted all file operations to use `fs.promises` (async/await)
- Refactored routes to use `async/await` for non-blocking I/O
- Implemented factory pattern for testability with configurable data paths

**Trade-offs**:
- Slightly more complex error handling
- Need to handle Promise rejections properly
- Better performance and scalability

### 2. Stats Performance & Caching
**Problem**: `GET /api/stats` recalculated statistics on every request.

**Solution**:
- Implemented in-memory caching for computed stats
- Used `fs.watch()` to monitor `items.json` for changes
- Automatically recompute stats when file changes

**Trade-offs**:
- Uses memory for cache
- File watcher has small overhead
- Massive performance improvement for read-heavy workloads

### 3. Unit Tests
**Problem**: No tests existed for items routes.

**Solution**:
- Created comprehensive Jest test suite (17 tests)
- Used supertest for HTTP testing
- Implemented factory pattern for isolated test data
- Used temporary files to avoid corrupting repo data
- Used Jest spies instead of file manipulation for error simulation

**Test Coverage**:
- Happy paths: GET all, GET by ID, POST, search, pagination
- Error cases: Invalid IDs (400), not found (404), file I/O errors (500)
- Query parameters: limit, search, pagination

**Trade-offs**:
- Tests use more tolerant assertions (regex matching) for flexibility
- Slight increase in test execution time due to file I/O
- Much better code reliability and maintenance

### 4. Pagination & Search
**Problem**: No server-side pagination or structured search.

**Solution**:
- Added `page` and `pageSize` query parameters
- Return paginated response with metadata (total, totalPages, hasMore)
- Combined search (`q` param) with pagination
- Maintained backward compatibility with `limit` param

**API Response Format**:
```json
{
  "data": [...items],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 100,
    "totalPages": 2,
    "hasMore": true
  }
}
```

**Trade-offs**:
- More complex response structure
- Requires client-side pagination state management
- Much better performance for large datasets

## Frontend Fixes

### 1. Memory Leak
**Problem**: Component updated state after unmounting if fetch was slow.

**Solution**:
- Implemented AbortController to cancel in-flight requests
- Added abort signal checks before state updates
- Proper cleanup in useEffect return function
- Error handling for AbortError

**Trade-offs**:
- Slightly more complex fetch logic
- Need to handle abort errors separately
- Completely prevents memory leaks and React warnings

### 2. Pagination & Search UI
**Problem**: No pagination or search interface.

**Solution**:
- Added search input with clear functionality
- Implemented pagination controls (Previous/Next)
- Display page info and total count
- Loading and error states
- Automatic page reset on search

**Trade-offs**:
- More state to manage (page, search query)
- Multiple useEffect dependencies
- Better UX for large datasets

### 3. Virtualization
**Problem**: Large lists caused performance issues.

**Solution**:
- Integrated `react-window` for virtual scrolling
- Only renders visible items in viewport
- Increased page size from 10 to 50 items
- Added toggle for virtualized vs regular rendering
- Alternating row colors for better readability

**Performance Benefits**:
- Constant render time regardless of list size
- Lower memory usage (only visible items in DOM)
- Smooth scrolling with thousands of items

**Trade-offs**:
- Added dependency (`react-window`)
- Fixed item height required
- Slightly more complex rendering logic
- Massive performance improvement for large lists

## Architecture Decisions

### Factory Pattern for Testability
Both backend router and tests use factory functions that accept configuration (data paths, etc.). This allows:
- Isolated test environments
- No corruption of production data
- Easy mocking and dependency injection

### Error Handling Strategy
- 400: Client errors (invalid input)
- 404: Resource not found
- 500: Server errors (file I/O, etc.)
- Proper error propagation with Express `next(err)`

### State Management
- Context API for shared state (items, pagination, loading, error)
- Local component state for UI concerns (current page, search input)
- AbortSignal passed through for cancellation

## Testing Strategy
- Unit tests with isolated temporary data
- Jest spies for error simulation
- Supertest for HTTP integration testing
- Tolerant assertions for flexibility

## Performance Optimizations
1. **Backend**: Async I/O, stats caching, file watching
2. **Frontend**: Virtualization, pagination, request cancellation
3. **Combined**: Server-side filtering reduces network payload

## Future Improvements
- Add request debouncing for search
- Implement infinite scroll as alternative to pagination
- Add sorting options
- Cache search results client-side
- Add loading skeletons instead of simple "Loading..."
- Implement proper accessibility (ARIA labels, keyboard navigation)
