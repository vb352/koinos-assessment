const express = require('express');
const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

// Allow CORS from both port 3000 and 3002
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true 
}));
// Basic middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

app.listen(port, () => console.log('Backend running on http://localhost:' + port));