const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DBSOURCE = "db.sqlite";

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

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dancer TEXT,
      videoLink TEXT,
      timestamp TEXT
    )`, (err) => {
      if (err) {
        // Table already created
      } else {
        // Table just created, creating some rows
        const insert = 'INSERT INTO submissions (dancer, videoLink, timestamp) VALUES (?,?,?)';
        db.run(insert, ["Dancer 1", "https://example.com/video1", new Date().toISOString()]);
        db.run(insert, ["Dancer 2", "https://example.com/video2", new Date().toISOString()]);
      }
    });
  }
});

app.get('/submissions', (req, res) => {
  const sql = 'SELECT * FROM submissions';
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      data: rows
    });
  });
});

app.post('/submit', (req, res) => {
  const { dancer, videoLink } = req.body;
  const timestamp = new Date().toISOString();
  const sql = 'INSERT INTO submissions (dancer, videoLink, timestamp) VALUES (?,?,?)';
  const params = [dancer, videoLink, timestamp];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, dancer, videoLink, timestamp }
    });
  });
  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dancer TEXT,
    videoLink TEXT,
    timestamp TEXT,
    assignment_id INTEGER,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
  )`);
});
app.get('/assignments', (req, res) => {
  const sql = 'SELECT * FROM assignments';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      data: rows
    });
  });
});

app.post('/assignments', (req, res) => {
  const { name } = req.body;
  const sql = 'INSERT INTO assignments (name) VALUES (?)';
  const params = [name];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, name }
    });
  });
});

app.post('/reset', (req, res) => {
  const { password } = req.body;
  if (password === 'edifier') {
    const sql = 'DELETE FROM submissions';
    db.run(sql, [], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success'
      });
    });
  } else {
    res.status(403).json({ error: 'Incorrect password' });
  }
});

// Handle any requests that don't match the API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
