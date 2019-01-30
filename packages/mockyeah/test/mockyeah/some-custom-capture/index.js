module.exports = [
  [
    {
      method: 'get',
      path: '/path+includes+problem+characters'
    },
    {
      text: 'it worked!'
    }
  ],
  [
    {
      method: 'get',
      path: '/say-hello'
    },
    {
      text: 'Well, hello there.'
    }
  ],
  [
    {
      method: 'get',
      path: 'http://localhost/say-hello'
    },
    {
      text: 'Well, hello absolute.'
    }
  ],
  [
    {
      method: 'get',
      path: '/say-oh-noes'
    },
    {
      text: 'Oh noes!',
      status: 500
    }
  ],
  [
    {
      method: 'get',
      path: '/say-your-lost'
    },
    {
      text: "I'm lost.",
      status: 404
    }
  ],
  [
    {
      method: 'get',
      path: '/respond-with-a-file'
    },
    {
      filePath: './fixtures/some-data.json'
    }
  ],
  [
    {
      method: 'get',
      path: '/respond-with-a-fixture'
    },
    {
      fixture: 'some-data.json'
    }
  ],
  [
    {
      method: 'get',
      path: '/wait-to-respond'
    },
    {
      text: 'Oh, hey there.',
      latency: 1000
    }
  ]
];
