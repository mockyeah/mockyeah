const originalFetch = global.fetch;

const proxy = (options = {}) => {
  const {
    serverUrl = 'http://localhost:4001',
    suiteHeader = 'x-mockyeah-suite',
    suiteCookie = 'mockyeahSuite'
  } = options

  global.fetch = (url, options = {}) => {
    // TODO: Support `Request` object.

    if (serverUrl) {
      url = `${serverUrl}/${url.replace('://', '~~~')}`
    }

    let suiteName
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(`\\b${suiteCookie}=([^;]+)\\b`)
      suiteName = m && m[1]
    }

    const newOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...suiteName && {
          [suiteHeader]: suiteName
        }
      }
    }

    return originalFetch(url, newOptions);
  };
}

export default proxy;
