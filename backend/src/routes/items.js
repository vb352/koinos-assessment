const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Factory function that accepts configurable data path for testing
function createItemsRouter({ dataPath } = {}) {
  const router = express.Router();
  const DATA_PATH = dataPath || path.join(__dirname, '../../../data/items.json');

  // Utility to read data (async I/O runs in the background without blocking the server)
  async function readData() {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  }

  // GET /api/items
  router.get('/', async (req, res, next) => {
    try {
      const data = await readData();
      const { limit, q, page, pageSize } = req.query;

      let results = data;

      // Apply search filter if query provided
      if (q) {
        results = results.filter(item =>
          item.name.toLowerCase().includes(q.toLowerCase())
        );
      }

      // Calculate total count after filtering
      const total = results.length;

      // Apply pagination if page and pageSize are provided
      if (page && pageSize) {
        const pageNum = parseInt(page);
        const pageSizeNum = parseInt(pageSize);
        
        // Validate pagination params
        if (pageNum < 1 || pageSizeNum < 1) {
          const err = new Error('Page and pageSize must be positive integers');
          err.status = 400;
          throw err;
        }

        const startIndex = (pageNum - 1) * pageSizeNum;
        const endIndex = startIndex + pageSizeNum;
        
        results = results.slice(startIndex, endIndex);

        // Return paginated response with metadata
        return res.json({
          data: results,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total,
            totalPages: Math.ceil(total / pageSizeNum),
            hasMore: endIndex < total
          }
        });
      }

      // Apply limit for backward compatibility (deprecated in favor of pagination)
      if (limit) {
        results = results.slice(0, parseInt(limit));
      }

      // Return simple array for non-paginated requests
      res.json(results);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/items/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate ID format
      if (Number.isNaN(id)) {
        const err = new Error('Invalid item ID format');
        err.status = 400;
        throw err;
      }

      const data = await readData();
      const item = data.find(i => i.id === id);
      
      if (!item) {
        const err = new Error('Item not found');
        err.status = 404;
        throw err;
      }
      
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/items
  router.post('/', async (req, res, next) => {
    try {
      const item = req.body;
      
      // Validate required fields
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        const err = new Error('Item name is required');
        err.status = 400;
        throw err;
      }

      const data = await readData();

      item.id = Date.now();
      data.push(item);

      await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));

      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// Export factory for testing, but also export default instance for production
module.exports = createItemsRouter();
module.exports.createItemsRouter = createItemsRouter;