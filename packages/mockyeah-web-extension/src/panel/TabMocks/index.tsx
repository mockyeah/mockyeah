import React, { useCallback } from "react";
import { Table } from "../Table";
import { MockActionsCell } from "./MockActionsCell";

const TabMocks = ({
  connected,
  connectErrored,
  mocks,
  managedMockIds,
  unmock,
  editMock
}) => {
  const onClickCreate = useCallback(() => {
    editMock(undefined, {});
  }, []);

  if (connectErrored) {
    return <div>Error connecting to mockyeah on host tab?</div>;
  }

  if (!connected) {
    return <div>Trying to connect...</div>;
  }

  if (!mocks) return null;

  const columns = [
    {
      Header: () => null,
      id: "actions",
      Cell: ({ row }) => (
        <MockActionsCell row={row} unmock={unmock} editMock={editMock} />
      )
    },
    // {
    //     Header: 'ID',
    //     accessor: 'id'
    // },
    // {
    //     Header: 'Managed',
    //     accessor: row => row.isManaged ? 'true' : 'false'
    // },
    {
      Header: "Method",
      accessor: "method"
    },
    {
      Header: "URL",
      accessor: "url"
    },
    {
      Header: "URL Type",
      accessor: "urlType"
    },
    {
      Header: "Body",
      accessor: "body"
    }
  ];

  const data = mocks.map(mock => {
    const [match, response] = mock;
    const { id } = match.$meta;
    const { url, method } = match.$meta.originalSerialized;
    const { raw, text, json } = response;

    const body = json ? JSON.stringify(json) : text || raw;

    const isManaged = managedMockIds.includes(id);

    return {
      id,
      isManaged,
      method: typeof method === "string" ? method.toUpperCase() : typeof method,
      // eslint-disable-next-line no-nested-ternary
      url:
        typeof url === "string"
          ? url
          : url?.$regex
          ? `/${url?.$regex?.source}/${url?.$regex?.flags || ""}`
          : typeof url,
      urlType: url?.$regex?.source ? "regex" : typeof url,
      body: typeof body === "string" ? body : typeof body
    };
  });

  return (
    <div>
      <div style={{ margin: "8px 0" }}>
        <button className="btn btn-primary" onClick={onClickCreate}>
          Add Mock
        </button>
      </div>
      <Table data={data} columns={columns} />
    </div>
  );
};

export { TabMocks };
