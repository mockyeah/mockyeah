const { isEmpty } = require('lodash');
const { handleContentType } = require('./helpers');

const proxyRecord = ({ app, req, res, reqUrl, startTime, body }) => {
  const { recordMeta } = app.locals;

  const {
    options: { headers: optionsHeaders, only, useHeaders, useLatency, groups } = {}
  } = recordMeta;

  if (!groups && only && !only.some(o => o.test(reqUrl))) return;

  let group;
  if (groups) {
    group = groups.find(g => g.test(reqUrl));

    if (!group) return;
  }

  const { method, body: reqBody } = req;

  const { statusCode: status, _headers: __headers } = res;

  const latency = new Date().getTime() - startTime;

  let match = {
    url: reqUrl
  };

  if (method && method.toLowerCase() !== 'get') {
    match.method = method.toLowerCase();
  }

  if (reqBody && !isEmpty(reqBody)) {
    match.body = reqBody;
  }

  if (optionsHeaders && Object.keys(optionsHeaders).length > 0) {
    match.headers = Object.assign({}, optionsHeaders);
  }

  // If the match has only `url`, we can just serialize that as string.
  if (Object.keys(match).length === 1) {
    match = match.url;
  }

  const headers = Object.assign({}, __headers);

  // Don't forward the suite header onto the proxied service.
  delete headers['x-mockyeah-suite'];

  // Don't record the `transfer-encoding` header since `chunked` value can cause `ParseError`s with `request`.
  delete headers['transfer-encoding'];

  let responseOptions = {};

  if (status !== 200) {
    responseOptions.status = status;
  }

  responseOptions = Object.assign(responseOptions, handleContentType(body, headers));

  if (useHeaders) {
    responseOptions.headers = headers;
  }

  if (useLatency) {
    responseOptions.latency = latency;
  }

  recordMeta.set.push([
    match,
    responseOptions,
    {
      group
    }
  ]);
};

module.exports = proxyRecord;
