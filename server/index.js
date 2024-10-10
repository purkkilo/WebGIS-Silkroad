const express = require("express");
const cors = require("cors");
const history = require("connect-history-api-fallback");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  history({
    verbose: true,
  })
);
// Handle production

// Static folder
app.use(express.static(__dirname + "/public"));

//Handle single page application
app.get(/.*/), (req, res) => res.sendFile(__dirname + "/public/index.html");

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));

module.exports = app;
