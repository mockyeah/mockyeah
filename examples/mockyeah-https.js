const path = require("path");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = require("../server")({
  name: "mockyeah",
  host: "localhost",
  port: 4001,
  portHttps: 4443,
  fixturesDir: path.join(__dirname, "./fixtures"),
  suitesDir: path.join(__dirname, "./mockyeah"),
  output: true,
  journal: true,
  verbose: false
});
