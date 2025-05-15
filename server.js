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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      data TEXT
    )
  `);
});

app.use(express.static(__dirname));
app.use(bodyParser.json());

// Получить список всех персонажей
app.get('/characters', (req, res) => {
  db.all(`SELECT * FROM characters`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Загрузить конкретного персонажа
app.post('/load', (req, res) => {
  const { name } = req.body;
  db.get(`SELECT * FROM characters WHERE name = ?`, [name], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row ? JSON.parse(row.data) : null);
  });
});

// Сохранить персонажа
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

// Удалить персонажа
app.post('/delete', (req, res) => {
  const { name } = req.body;
  db.run(`DELETE FROM characters WHERE name = ?`, [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});