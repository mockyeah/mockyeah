import React, { useCallback, useState, useEffect } from "react";

const NetworkActionsCell = ({ row, editMock }) => {
  const { original } = row;
  const { url, method, entry } = original;
  const [cancelled, setCancelled] = useState(false);

  const onClickMock = useCallback(() => {
    entry.getContent((content, encoding) => {
      if (cancelled) return;
      editMock(null, {
        match: {
          url,
          method
        },
        response: {
          raw: content
        }
      });
    });
  }, [entry, editMock, url, method, cancelled]);

  useEffect(() => () => setCancelled(true), []);

  return (
    <>
      <button className="btn btn-primary" onClick={onClickMock}>
        Mock
      </button>
    </>
  );
};

export { NetworkActionsCell };
