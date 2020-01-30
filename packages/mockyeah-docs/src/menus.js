const menus = {
  main: [
    { title: 'Introduction', url: '' },
    {
      title: 'Getting Started',
      url: 'Getting-Started',
      items: [
        {
          title: 'Client-Side',
          url: 'Getting-Started/Client-Side',
          items: [{ title: 'DevTools Extension', url: 'WebExtension' }]
        },
        { title: 'Node', url: 'Getting-Started/Node' },
        { title: 'Server', url: 'Getting-Started/Server' },
        { title: 'Unit Tests', url: 'Getting-Started/Unit-Tests' }
      ]
    },
    {
      title: 'Suites',
      url: 'Suites',
      items: [
        { title: 'Ad Hoc', url: 'Suites#ad-hoc-suites' },
        { title: 'Dynamic', url: 'Suites#dynamic-suites' }
      ]
    },
    {
      title: 'Packages',
      items: [
        {
          title: '`@mockyeah/fetch`',
          url: 'Packages/mockyeah-fetch',
          items: [
            {
              title: 'Configuration',
              url: 'Packages/mockyeah-fetch/Configuration',
              items: [
                { title: 'Logging', url: 'Packages/mockyeah-fetch/Configuration#logging' },
                { title: 'Options', url: 'Packages/mockyeah-fetch/Configuration#options' },
                { title: 'Defaults', url: 'Packages/mockyeah-fetch/Configuration#defaults' }
              ]
            },
            { title: 'Match Values', url: 'Packages/mockyeah-fetch/API/Match-Values' },
            {
              title: 'Mock API',
              url: 'Packages/mockyeah-fetch/API/Mock-API',
              items: [
                {
                  title: '`get/post/put/patch/delete/all()`',
                  url: 'Packages/mockyeah-fetch/API/Mock-API'
                },
                { title: 'Request Match', url: 'Packages/mockyeah-fetch/API/Mock-API#match' },
                { title: 'Response Options', url: 'Packages/mockyeah-fetch/API/Mock-API#options' }
              ]
            },
            {
              title: 'Expectation API',
              url: 'Packages/mockyeah-fetch/API/Expectation-API',
              items: [
                { title: '`.expect()`', url: 'Packages/mockyeah-fetch/API/Expectation-API#expect' },
                {
                  title: 'Quantitative',
                  url: 'Packages/mockyeah-fetch/API/Expectation-API#quantitative',
                  items: [
                    {
                      title: '`.expect().atLeast()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#atLeast'
                    },
                    {
                      title: '`.expect().atMost()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#atMost'
                    },
                    {
                      title: '`.expect().never()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#never'
                    },
                    {
                      title: '`.expect().once()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#once'
                    },
                    {
                      title: '`.expect().twice()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#twice'
                    },
                    {
                      title: '`.expect().thrice()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#thrice'
                    },
                    {
                      title: '`.expect().exactly()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#exactly'
                    }
                  ]
                },
                {
                  title: 'Structural',
                  url: 'Packages/mockyeah-fetch/API/Expectation-API#structural',
                  items: [
                    {
                      title: '`.expect().path()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#path'
                    },
                    {
                      title: '`.expect().url()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#url'
                    },
                    {
                      title: '`.expect().body()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#body'
                    },
                    {
                      title: '`.expect().params()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#params'
                    },
                    {
                      title: '`.expect().header()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#header'
                    }
                  ]
                },
                {
                  title: 'Execute',
                  url: 'Packages/mockyeah-fetch/API/Expectation-API#execute',
                  items: [
                    {
                      title: '`.expect().run()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#run'
                    },
                    {
                      title: '`.expect().verify()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#verify'
                    },
                    {
                      title: '`.expect().verifier()`',
                      url: 'Packages/mockyeah-fetch/API/Expectation-API#verifier'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          title: '`@mockyeah/server`',
          url: 'Packages/mockyeah-server',
          items: [
            {
              title: 'Configuration',
              url: 'Packages/mockyeah-server/Configuration',
              items: [
                // {title: 'Logging', url: 'Packages/mockyeah-server/Configuration#logging'},
                // {title: 'Options', url: 'Packages/mockyeah-server/Configuration#options'},
                // {title: 'Defaults', url: 'Packages/mockyeah-server/Configuration#defaults'},
                { title: 'Defaults', url: 'Packages/mockyeah-server/Configuration#defaults' },
                { title: 'Options', url: 'Packages/mockyeah-server/Configuration#options' },
                { title: 'HTTPS', url: 'Packages/mockyeah-server/Configuration#https' }
              ]
            },
            {
              title: 'API',
              items: [
                { title: '`close()`', url: 'Packages/mockyeah-server/API/close' },
                { title: '`play()`', url: 'Packages/mockyeah-server/API/play' },
                { title: '`playAll()`', url: 'Packages/mockyeah-server/API/playAll' },
                { title: '`proxy()`', url: 'Packages/mockyeah-server/API/proxy' },
                { title: '`record()`', url: 'Packages/mockyeah-server/API/record' },
                { title: '`recordStop()`', url: 'Packages/mockyeah-server/API/recordStop' },
                { title: '`reset()`', url: 'Packages/mockyeah-server/API/reset' },
                { title: '`start()`', url: 'Packages/mockyeah-server/API/start' },
                { title: '`startedPromise`', url: 'Packages/mockyeah-server/API/startedPromise' },
                { title: '`unwatch()`', url: 'Packages/mockyeah-server/API/unwatch' },
                { title: '`watch()`', url: 'Packages/mockyeah-server/API/watch' },
                { title: '`Server`', url: 'Packages/mockyeah-server/API/Server' }
              ]
            }
          ]
        },
        { title: '`@mockyeah/cli`', url: 'Packages/mockyeah-cli' },
        { title: '`@mockyeah/test-jest`', url: 'Packages/mockyeah-test-jest' },
        { title: '`@mockyeah/test-mocha`', url: 'Packages/mockyeah-test-mocha' }
      ]
    },
    {
      title: 'Recipes & Examples',
      url: 'Recipes-and-Examples'
    },
    { title: 'Compare', url: 'Compare' },
    { title: 'Contributing', url: 'Contributing' }
  ]
};

export { menus };
