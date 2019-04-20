module.exports = [
  [
    {
      method: 'post',
      url: 'http://httpbin.org/get?ok=yes',
      body: {}
    },
    {
      headers: {
        'x-powered-by': 'Express',
        'access-control-allow-origin': '*',
        connection: 'close',
        server: 'gunicorn/19.9.0',
        date: 'Sat, 25 Aug 2018 21:41:59 GMT',
        'content-type': 'application/json',
        'content-length': '240',
        'access-control-allow-credentials': 'true',
        via: '1.1 vegur'
      },
      status: 200,
      raw:
        '{\n  "args": {\n    "ok": "yes"\n  }, \n  "headers": {\n    "Accept": "*/*", \n    "Connection": "close", \n    "Host": "httpbin.org", \n    "User-Agent": "curl/7.54.0"\n  }, \n  "origin": "73.37.129.121", \n  "url": "http://httpbin.org/get?ok=yes"\n}\n',
      latency: 144
    }
  ]
];
