module.exports = [
  [
    "http://httpbin.org/get?ok=yes",
    {
      "status": 200,
      "headers": {
        "x-powered-by": "Express",
        "access-control-allow-origin": "*",
        "connection": "close",
        "server": "gunicorn/19.9.0",
        "date": "Tue, 08 Jan 2019 05:09:45 GMT",
        "content-type": "application/json",
        "content-length": "240",
        "access-control-allow-credentials": "true",
        "via": "1.1 vegur"
      },
      "latency": 155,
      "fixture": "foo-use/0.json"
    }
  ]
];