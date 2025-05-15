const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к SQLite
const db = new sqlite3.Database('./database.db');

// Создание таблицы, если её нет
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS characters (
      name TEXT PRIMARY KEY,
      data TEXT
    )
  `);
});

app.use(express.static(__dirname));
app.use(bodyParser.json());

// Получить данные персонажа
app.post('/load', (req, res) => {
  const { name } = req.body;
  db.get(`SELECT * FROM characters WHERE name = ?`, [name], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row ? JSON.parse(row.data) : null);
  });
});

// Сохранить данные персонажа
app.post('/save', (req, res) => {
  const { name, data } = req.body;
  const json = JSON.stringify(data);

  db.run(
    `INSERT OR REPLACE INTO characters (name, data) VALUES (?, ?)`,
    [name, json],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});