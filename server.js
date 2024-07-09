const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from both localhost and your Heroku app
const allowedOrigins = [
  'http://localhost:3000',
  'https://boiling-sea-64676.herokuapp.com',
  'https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      dancer TEXT,
      videolink TEXT,
      assignment TEXT,
      timestamp TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      assignment TEXT,
      timestamp TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS critiques (
      id SERIAL PRIMARY KEY,
      videoLink TEXT,
      critique TEXT,
      time FLOAT,
      timestamp TIMESTAMP
    );


  `, (err) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to the PostgreSQL database.');
  });
});

app.get('/submissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM submissions');
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/submit', async (req, res) => {
  const { dancer, videolink, assignment } = req.body;
  const timestamp = new Date().toISOString();
  try {
    const result = await pool.query(
      'INSERT INTO submissions (dancer, videolink, assignment, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [dancer, videolink, assignment, timestamp]
    );
    res.json({ message: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error submitting video link:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/assignments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments');
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/assignments', async (req, res) => {
  const { assignment } = req.body;
  const timestamp = new Date().toISOString();
  try {
    const result = await pool.query(
      'INSERT INTO assignments (assignment, timestamp) VALUES ($1, $2) RETURNING *',
      [assignment, timestamp]
    );
    res.json({ message: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error adding assignment:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addCritique', async (req, res) => {
  const { videoLink, critique, time } = req.body;
  const timestamp = new Date().toISOString();
  try {
    const result = await pool.query(
      'INSERT INTO critiques (videoLink, critique, time, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [videoLink, critique, time, timestamp]
    );
    res.json({ message: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error adding critique:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/deleteCritique', async (req, res) => {
  const { videoLink, time } = req.body;
  try {
    await pool.query('DELETE FROM critiques WHERE videoLink = $1 AND time = $2', [videoLink, time]);
    res.json({ message: 'success' });
  } catch (err) {
    console.error('Error deleting critique:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/critiques', async (req, res) => {
  const { videoLink } = req.query;
  try {
    const result = await pool.query('SELECT * FROM critiques WHERE videoLink = $1', [videoLink]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error fetching critiques:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/reset', async (req, res) => {
  try {
    await pool.query('DELETE FROM submissions');
    await pool.query('DELETE FROM assignments');
    res.json({ message: 'success' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Catch-all handler to serve React's index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
