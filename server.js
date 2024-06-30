const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DBSOURCE = "db.sqlite";

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

app.use(cors({
  origin: 'https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com'  // Replace with your frontend's origin
}));
app.use(bodyParser.json());

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
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
