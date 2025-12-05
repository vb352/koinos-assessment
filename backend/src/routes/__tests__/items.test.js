const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { createItemsRouter } = require('../items');

// Set timeout for slow CI environments
jest.setTimeout(10000);

// Mock data for tests
const mockItems = [
  { id: 1, name: 'Widget A', price: 10, category: 'Tools' },
  { id: 2, name: 'Widget B', price: 20, category: 'Tools' },
  { id: 3, name: 'Gadget C', price: 30, category: 'Electronics' }
];

describe('Items Routes', () => {
  let app;
  let testDataPath;
  let tempDir;

  // Setup temp directory and test app before all tests
  beforeAll(async () => {
    // Create temporary directory for test data
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'items-test-'));
    testDataPath = path.join(tempDir, 'items.json');
  });

  // Setup fresh data and app before each test
  beforeEach(async () => {
    // Write fresh mock data
    await fs.writeFile(testDataPath, JSON.stringify(mockItems, null, 2));

    // Create fresh app instance with test data path
    app = express();
    app.use(express.json());
    app.use('/api/items', createItemsRouter({ dataPath: testDataPath }));

    // Error handler middleware for tests
    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({ error: err.message });
    });
  });

  // Clean up after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Clean up temp directory after all tests
  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(mockItems);
    });

    it('should return limited items when limit query is provided', async () => {
      const response = await request(app).get('/api/items?limit=2');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual(mockItems[0]);
      expect(response.body[1]).toEqual(mockItems[1]);
    });

    it('should filter items by search query (case insensitive)', async () => {
      const response = await request(app).get('/api/items?q=widget');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Widget A');
      expect(response.body[1].name).toBe('Widget B');
    });

    it('should filter items by search query (case insensitive - uppercase)', async () => {
      const response = await request(app).get('/api/items?q=GADGET');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Gadget C');
    });

    it('should combine limit and search query', async () => {
      const response = await request(app).get('/api/items?q=widget&limit=1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Widget A');
    });

    it('should return empty array when search matches nothing', async () => {
      const response = await request(app).get('/api/items?q=nonexistent');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
      expect(response.body).toEqual([]);
    });

    it('should handle file read errors gracefully', async () => {
      // Mock readFile to throw error
      jest.spyOn(fs, 'readFile').mockRejectedValueOnce(new Error('read failed'));

      const response = await request(app).get('/api/items');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item by id', async () => {
      const response = await request(app).get('/api/items/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItems[0]);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Widget A');
    });

    it('should return another item by different id', async () => {
      const response = await request(app).get('/api/items/3');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItems[2]);
      expect(response.body.id).toBe(3);
      expect(response.body.name).toBe('Gadget C');
    });

    it('should return 404 when item is not found', async () => {
      const response = await request(app).get('/api/items/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app).get('/api/items/abc');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/invalid/i);
    });

    it('should handle file read errors gracefully', async () => {
      // Mock readFile to throw error
      jest.spyOn(fs, 'readFile').mockRejectedValueOnce(new Error('read failed'));

      const response = await request(app).get('/api/items/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'New Widget',
        price: 15,
        category: 'Tools'
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Widget');
      expect(response.body.price).toBe(15);
      expect(response.body.category).toBe('Tools');

      // Verify item was actually written to file
      const raw = await fs.readFile(testDataPath, 'utf-8');
      const items = JSON.parse(raw);
      expect(items).toHaveLength(4);
      expect(items[3].name).toBe('New Widget');
    });

    it('should generate unique id for new item', async () => {
      const newItem1 = { name: 'Item 1', price: 10 };
      const newItem2 = { name: 'Item 2', price: 20 };

      const response1 = await request(app)
        .post('/api/items')
        .send(newItem1);

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const response2 = await request(app)
        .post('/api/items')
        .send(newItem2);

      expect(response1.body.id).toBeDefined();
      expect(response2.body.id).toBeDefined();
      expect(response1.body.id).not.toBe(response2.body.id);
    });

    it('should return 400 for missing required name field', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    });

    it('should return 400 for empty name string', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '   ', price: 100 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    });

    it('should handle file write errors gracefully', async () => {
      // Mock writeFile to throw error
      jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('write failed'));

      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test', price: 100 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    });
  });
});
