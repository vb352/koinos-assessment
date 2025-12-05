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
      const { limit, q } = req.query;

      let results = data;

      if (q) {
        results = results.filter(item =>
          item.name.toLowerCase().includes(q.toLowerCase())
        );
      }

      if (limit) {
        results = results.slice(0, parseInt(limit));
      }

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