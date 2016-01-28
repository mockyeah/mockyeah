'use strict';

module.exports = [
  {
    method: 'get',
    path: '/say-hello',
    options: {
      text: 'Well, hello there.'
    }
  },
  {
    method: 'get',
    path: '/say-your-lost',
    options: {
      text: 'I\'m lost.',
      status: 404
    }
  },
  {
    method: 'get',
    path: '/say-oh-noes',
    options: {
      text: 'Oh noes!',
      status: 500
    }
  },
  {
    method: 'get',
    path: '/respond-with-a-file',
    options: {
      filePath: './test/fixtures/some-data.json'
    }
  },
  {
    method: 'get',
    path: '/respond-with-a-fixture',
    options: {
      fixture: 'some-data.json'
    }
  },
  {
    method: 'get',
    path: '/wait-to-respond',
    options: {
      text: 'Oh, hey there.',
      latency: 1000
    }
  },
  {
    method: 'get',
    path: '/say-anything-you-want',
    options: (req, res) => {
      res.status(200);
      res.send('Inversion of service control enables you to respond with whatever you want.');
    }
  }
];