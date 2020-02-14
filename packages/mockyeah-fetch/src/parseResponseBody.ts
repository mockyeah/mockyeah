import qs from 'qs';

const parseResponseBody = (headers: Headers, body?: string | null) => {
  // TODO: Does this handle lowercase `content-type`?
  const contentType = headers && headers.get('Content-Type');
  // TODO: More robust content-type parsing.
  const isJson = contentType?.includes('application/json');
  const isForm = contentType?.includes('application/x-www-form-urlencoded');

  if (body) {
    if (isJson) {
      return JSON.parse(body);
    }

    if (isForm) {
      return qs.parse(body);
    }
  }

  return body;
};

export { parseResponseBody };
