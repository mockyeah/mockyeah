import React, { useCallback } from "react";

const MockActionsCell = ({ row, unmock, editMock }) => {
  const { original } = row;
  const { id } = original;

  const onClickUnmock = useCallback(() => {
    unmock(id);
  }, [id, unmock]);

  const onClickEdit = useCallback(() => {
    editMock(id);
  }, [id, editMock]);

  return (
    <div style={{ display: "flex" }}>
      <button className="btn btn-primary" onClick={onClickEdit}>
        Edit
      </button>
      <span>&nbsp;</span>
      <button className="btn btn-danger" onClick={onClickUnmock}>
        X
      </button>
    </div>
  );
};

export { MockActionsCell };
