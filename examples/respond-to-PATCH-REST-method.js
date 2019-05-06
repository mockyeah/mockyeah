const http = require("http");
const log = require("./log");
const mockyeah = require("./mockyeah");

mockyeah.patch("/", { text: "it worked!" });

http.get(
  {
    hostname: "localhost",
    port: 4001,
    path: "/",
    method: "PATCH"
  },
  res => {
    log(res);
    mockyeah.close();
  }
);
