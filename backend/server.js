const express = require("express");
const app = express();
const port = 3000;
const db = require("./src/config/dbConfig");

app.get("/", (req, res) => {
  db.query("desc USERS", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
