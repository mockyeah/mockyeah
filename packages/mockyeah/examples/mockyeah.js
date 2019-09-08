const path = require("path");

module.exports = require("../server")({
  name: "mockyeah",
  host: "localhost",
  port: 4001,
  fixturesDir: path.join(__dirname, "./fixtures"),
  suitesDir: path.join(__dirname, "./mockyeah"),
  output: true,
  journal: true,
  verbose: false
});
