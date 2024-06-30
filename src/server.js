const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/submissions', (req, res) => {
  db.all('SELECT * FROM submissions', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/submit', (req, res) => {
  const { dancer, videoLink } = req.body;
  const timestamp = new Date().toISOString();

  db.run(
    'INSERT INTO submissions (dancer, videoLink, timestamp) VALUES (?, ?, ?)',
    [dancer, videoLink, timestamp],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Submission successful', id: this.lastID });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
