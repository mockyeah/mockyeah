const parseResponseBody = (headers: Headers, body?: string | null) => {
  // TODO: Does this handle lowercase `content-type`?
  const contentType = headers && headers.get('Content-Type');
  // TODO: More robust content-type parsing.
  const isJson = contentType && contentType.includes('application/json');

  return body && isJson
    ? JSON.parse(body)
    : // TODO: Support forms as key/value object (see https://expressjs.com/en/api.html#req.body)
      body;
};

export { parseResponseBody };
