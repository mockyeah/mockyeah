const menus = {
  main: [
    { title: 'Introduction', url: '' },
    {
      title: 'Getting Started',
      url: 'Getting-Started',
      items: [
        { title: 'Install', url: 'Getting-Started#install' },
        { title: 'Introductory tutorial', url: 'Getting-Started#introductory-tutorial' }
      ]
    },
    {
      title: 'Configuration',
      url: 'Configuration',
      items: [
        { title: 'Defaults', url: 'Configuration#default-configuration' },
        { title: 'Options', url: 'Configuration#options' },
        { title: 'HTTPS', url: 'Configuration#https' }
      ]
    },
    {
      title: 'API',
      items: [
        { title: 'Match Values', url: './API/Match-Values' },
        {
          title: 'Mock API',
          url: 'API/Mock-API',
          items: [
            { title: '`get/post/put/patch/delete/all()`', url: 'API/Mock-API' },
            { title: 'Request Match', url: 'API/Mock-API#match' },
            { title: 'Response Options', url: 'API/Mock-API#options' },
            { title: '`close()`', url: 'API/close' },
            { title: '`play()`', url: 'API/play' },
            { title: '`playAll()`', url: 'API/playAll' },
            { title: '`proxy()`', url: 'API/proxy' },
            { title: '`record()`', url: 'API/record' },
            { title: '`recordStop()`', url: 'API/recordStop' },
            { title: '`reset()`', url: 'API/reset' },
            { title: '`start()`', url: 'API/start' },
            { title: '`startedPromise`', url: 'API/startedPromise' },
            { title: '`unwatch()`', url: 'API/unwatch' },
            { title: '`watch()`', url: 'API/watch' }
          ]
        },
        {
          title: 'Expectation API',
          url: 'API/Expectation-API',
          items: [
            { title: '`.expect()`', url: 'API/Expectation-API#expect' },
            {
              title: 'Quantitative',
              url: 'API/Expectation-API#quantitative',
              items: [
                { title: '`.expect().atLeast()`', url: 'API/Expectation-API#atLeast' },
                { title: '`.expect().atMost()`', url: 'API/Expectation-API#atMost' },
                { title: '`.expect().never()`', url: 'API/Expectation-API#never' },
                { title: '`.expect().once()`', url: 'API/Expectation-API#once' },
                { title: '`.expect().twice()`', url: 'API/Expectation-API#twice' },
                { title: '`.expect().thrice()`', url: 'API/Expectation-API#thrice' },
                { title: '`.expect().exactly()`', url: 'API/Expectation-API#exactly' }
              ]
            },
            {
              title: 'Structural',
              url: 'API/Expectation-API#structural',
              items: [
                { title: '`.expect().path()`', url: 'API/Expectation-API#path' },
                { title: '`.expect().url()`', url: 'API/Expectation-API#url' },
                { title: '`.expect().body()`', url: 'API/Expectation-API#body' },
                { title: '`.expect().params()`', url: 'API/Expectation-API#params' },
                { title: '`.expect().header()`', url: 'API/Expectation-API#header' }
              ]
            },
            {
              title: 'Execute',
              url: 'API/Expectation-API#execute',
              items: [
                { title: '`.expect().run()`', url: 'API/Expectation-API#run' },
                { title: '`.expect().verify()`', url: 'API/Expectation-API#verify' },
                { title: '`.expect().verifier()`', url: 'API/Expectation-API#verifier' }
              ]
            }
          ]
        }
      ]
    },
    { title: 'Classes', items: [{ title: '`Server`', url: 'API/Server' }] },
    {
      title: 'Suites',
      url: 'Suites/Overview',
      items: [
        { title: 'Suites Overview', url: 'Suites/Overview#suites-overview' },
        { title: 'Ad Hoc Suites', url: 'Suites/Overview#ad-hoc-suites' }
      ]
    },
    { title: 'CLI', url: 'CLI/CLI' },
    { title: 'Testing', url: 'Testing' },
    { title: 'Integration', url: 'Integration' },
    { title: 'Web Extension', url: 'WebExtension' },
    {
      title: 'Recipes & Examples',
      url: 'Recipes-and-Examples'
    },
    { title: 'Contributing', url: 'Contributing' }
  ]
};

export { menus };
