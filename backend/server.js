require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MySQL Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database!');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// API Endpoints

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new customer
app.post('/api/customers', async (req, res) => {
  const { name, phone } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO customer (customer_name, contact_number) VALUES (?, ?)',
      [name, phone]
    );
    res.json({ customerId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Place an order
app.post('/api/orders', async (req, res) => {
  const { customerId, itemId } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO orderDetails (customer_id, item_id) VALUES (?, ?)',
      [customerId, itemId]
    );
    
    // Get the updated order details
    const [order] = await pool.query(
      'SELECT * FROM orderDetails WHERE order_id = ?',
      [result.insertId]
    );
    
    res.json(order[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get customer bill
app.get('/api/bill/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const [result] = await pool.query(
      'CALL GetTotalBill(?, @total)',
      [customerId]
    );
    const [[{ total_amount }]] = await pool.query('SELECT @total as total_amount');
    res.json({ total: total_amount || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate bill' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});