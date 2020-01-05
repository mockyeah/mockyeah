import React, { useState, useCallback } from "react";
import isRegExp from "lodash/isRegExp";
import Modal from "react-modal";
import { JsonEditor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";

const EditMockModal = ({ id, init, saveMock, close }) => {
  const match = init?.match;
  const [method, setMethod] = useState(match?.method);
  const [url, setUrl] = useState(
    isRegExp(match?.url)
      ? match?.url?.source
      : match?.url?.$regex?.source || match?.url
  );
  const [body, setBody] = useState(
    init?.response?.json
      ? JSON.stringify(init.response.json, undefined, 2)
      : init?.response?.text || init?.response?.raw
  );
  // eslint-disable-next-line no-nested-ternary
  const [bodyType, setBodyType] = useState(
    init?.response?.json ? "json" : init?.response?.text ? "text" : "raw"
  );
  const [urlType, setUrlType] = useState(
    isRegExp(match?.url) || match?.url?.$regex ? "regex" : "string"
  );

  const onChangeJsonBody = useCallback(
    value => setBody(JSON.stringify(value, null, 2)),
    [setBody]
  );
  const onChangeBody = useCallback(e => setBody(e.target.value), [setBody]);
  const onChangeUrl = useCallback(e => setUrl(e.target.value), [setUrl]);
  const onChangeMethod = useCallback(e => setMethod(e.target.value), [
    setMethod
  ]);
  const onChangeBodyType = useCallback(e => setBodyType(e.target.value), [
    setBodyType
  ]);
  const onChangeUrlType = useCallback(e => setUrlType(e.target.value), [
    setUrlType
  ]);

  const urlRegexFlags = url?.$regex?.flags;
  const urlRegexSource = url?.$regex?.source || url;

  let urlRegex;
  if (urlType === "regex") {
    try {
      urlRegex = new RegExp(urlRegexSource, urlRegexFlags);
    } catch (error) {
      console.error("could not parse url regex");
    }
  }

  const isUrlRegexInvalid = urlType === "regex" && !urlRegex;

  const onClickSubmit = useCallback(
    e => {
      e.preventDefault();

      const matchUrl = urlRegex || url;

      const response: {
        json?: any;
        raw?: string;
        text?: string;
        type?: string;
      } = {};

      if (bodyType === "json") {
        try {
          response.json = JSON.parse(body);
        } catch (error) {
          console.error("response parse error", error);
          response.raw = body;
          response.type = "json";
        }
      } else if (bodyType === "text") {
        response.text = body;
      } else {
        response.raw = body;
      }

      const mockBody = {
        match: {
          method,
          url: matchUrl
        },
        response
      };
      saveMock(id, mockBody);
    },
    [saveMock, id, method, url, body, bodyType]
  );

  let json;

  if (body && bodyType === "json") {
    try {
      json = JSON.parse(body);
    } catch (error) {
      console.error("error json parse body");
      json = {};
    }
  }

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "all"];

  const methodUpperCase = method?.toUpperCase();

  return (
    <Modal isOpen onRequestClose={close}>
      <h2>{id ? <>Edit Mock</> : <>Create Mock</>}</h2>

      <form onSubmit={onClickSubmit}>
        <div className="form-group">
          <label htmlFor="edit_method">Method</label>
          {!method || typeof method === "string" ? (
            <select
              className="form-control"
              id="edit_method"
              value={methodUpperCase}
              onChange={onChangeMethod}
            >
              {methods.map(method => (
                <option key={method}>{method}</option>
              ))}
            </select>
          ) : (
            <>method isn't string</>
          )}
        </div>
        <hr />
        <div className="form-group">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="urlType"
              id="urlTypeString"
              value="string"
              checked={urlType === "string"}
              onChange={onChangeUrlType}
            />
            <label className="form-check-label" htmlFor="urlTypeString">
              text
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="urlType"
              id="urlTypeRegex"
              value="regex"
              checked={urlType === "regex"}
              onChange={onChangeUrlType}
            />
            <label className="form-check-label" htmlFor="urlTypeRegex">
              regex
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="edit_url">URL</label>
          {!url || typeof url === "string" || url?.$regex ? (
            <textarea
              required
              className={`form-control ${
                isUrlRegexInvalid ? "is-invalid" : ""
              }`}
              id="edit_url"
              style={{ width: "100%" }}
              value={url?.$regex?.source || url}
              onChange={onChangeUrl}
            />
          ) : (
            <div>(not a string)</div>
          )}
          {isUrlRegexInvalid && (
            <div className="invalid-feedback">regex error</div>
          )}
        </div>
        <hr />
        <div className="form-group">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="bodyType"
              id="bodyTypeJson"
              value="json"
              checked={bodyType === "json"}
              onChange={onChangeBodyType}
            />
            <label className="form-check-label" htmlFor="bodyTypeJson">
              json
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="bodyType"
              id="bodyTypeText"
              value="text"
              checked={bodyType === "text"}
              onChange={onChangeBodyType}
            />
            <label className="form-check-label" htmlFor="bodyTypeText">
              text
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="bodyType"
              id="bodyTypeRaw"
              value="raw"
              checked={bodyType === "raw"}
              onChange={onChangeBodyType}
            />
            <label className="form-check-label" htmlFor="bodyTypeRaw">
              raw
            </label>
          </div>
        </div>
        {bodyType === "json" ? (
          <div className="form-group">
            <label>Body</label>
            <JsonEditor value={json || {}} onChange={onChangeJsonBody} />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="edit_body">Body</label>
            {!body || typeof body === "string" ? (
              <textarea
                id="edit_body"
                rows={15}
                style={{ width: "100%" }}
                value={body}
                onChange={onChangeBody}
              />
            ) : (
              <span>(not a string)</span>
            )}
          </div>
        )}
        <br />
        <button className="btn btn-primary">Submit</button>
        &nbsp;
        <button className="btn btn-light" onClick={close}>
          Close
        </button>
      </form>
    </Modal>
  );
};

export { EditMockModal };
