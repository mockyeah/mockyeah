import isRegExp from "lodash/isRegExp";

const key = "save";

const inspectEval = (
  ...args: Partial<Parameters<typeof chrome.devtools.inspectedWindow.eval>>
) => {
  const [script, options, callback] = args;
  if (!script) return;

  console.log("eval script", script);

  chrome.devtools.inspectedWindow.eval(
    script,
    options || {},
    (result, exceptionInfo) => {
      console.log("result", result);
      console.log("exceptionInfo", exceptionInfo);

      if (callback) callback(result, exceptionInfo);
    }
  );
};

const sendDevToolsHasLoadedMocks = () => {
  inspectEval(`
      window.__MOCKYEAH_DEVTOOLS_EXTENSION__ = window.__MOCKYEAH_DEVTOOLS_EXTENSION__ || {};
      window.__MOCKYEAH_DEVTOOLS_EXTENSION__.loadedMocks = true;
    `);
};

const getSavedData = (callback?: (...any) => any) => {
  chrome.storage.local.get([key], result => {
    console.log("Value is", result?.[key]);

    const data = {
      ...result?.[key],
      mocks: result?.[key]?.mocks && JSON.parse(result[key].mocks)
    };

    console.log("data", data);

    if (callback) callback(data);
  });
};

const unmock = (id, callback) => {
  const script = `
      window.__MOCKYEAH__.unmock('${id}');
    `;
  inspectEval(script, undefined, result => {
    if (callback) callback({ result });
  });
};

const saveMocks = mocks => {
  const data = {
    lastSaved: Date.now(),
    mocks: JSON.stringify(
      mocks.map(mock => [mock[0].$meta.originalSerialized, mock[1]])
    )
  };
  console.log("saving data", data);

  chrome.storage.local.set({ [key]: data }, () => {
    console.log("Value is set.", "Error?", chrome.runtime.lastError);
  });
};

const escapeForMock = (str, char = "'") =>
  str && str.replace(new RegExp(char, "g"), `\\${char}`);

const saveMock = (id, init, callback) => {
  const {
    match: { method, url },
    response: { raw, text, json }
  } = init;

  const jsonString = JSON.stringify(json);

  const urlRegexSource = isRegExp(url) ? url.source : url?.$regex?.source;
  const urlRegexFlags = isRegExp(url) ? url.flags : url?.$regex?.flags;
  const serializedUrl =
    isRegExp(url) || url?.$regex
      ? `new RegExp('${escapeForMock(urlRegexSource)}', '${urlRegexFlags}')`
      : `'${url}'`;

  const after = () => {
    const script = `
          window.__MOCKYEAH__.mock({
            ${method ? `method: '${method}',` : ""}
            url: ${serializedUrl}
          }, {
            ${raw ? `raw: \`${escapeForMock(raw, "`")}\`` : ""}
            ${text ? `text: \`${escapeForMock(text, "`")}\`` : ""}
            ${json ? `json: ${jsonString}` : ""}
          });
        `;
    // @ts-ignore
    inspectEval(script, undefined, (result: MockReturn) => {
      if (callback) {
        callback({ result });
      }
    });
  };

  if (id) {
    unmock(id, after);
  } else {
    after();
  }
};

const getMocks = callback => {
  const script = `window.__MOCKYEAH__ &&
    window.__MOCKYEAH__.__private &&
    window.__MOCKYEAH__.__private.mocks &&
    window.__MOCKYEAH__.__private.mocks.map(function (mock) {
      return [Object.assign({}, mock[0], mock[0].$meta.originalSerialized), mock[1]];
    })`;

  inspectEval(script, undefined, (result, exceptionInfo) => {
    if (callback) callback({ result, exceptionInfo });
  });
};

const getConnected = callback => {
  const script = `Boolean(window.__MOCKYEAH__)`;

  inspectEval(script, undefined, (result, exceptionInfo) => {
    console.log("result", result);
    console.log("exceptionInfo", exceptionInfo);

    if (callback) callback({ result, exceptionInfo });
  });
};

export {
  inspectEval,
  sendDevToolsHasLoadedMocks,
  getSavedData,
  unmock,
  saveMock,
  saveMocks,
  getMocks,
  getConnected
};
