import React, { useState, useCallback, useEffect, useRef } from "react";
import { Table } from "../Table";
import { NetworkActionsCell } from "./NetworkActionsCell";

const TabNetwork = ({ editMock }) => {
  const [harLog, setHarLog] = useState();
  const mountedRef = useRef(true);

  const refreshNetwork = useCallback(() => {
    chrome.devtools.network.getHAR(_harLog => {
      if (!mountedRef.current) return;
      setHarLog(_harLog);
    });
  }, [setHarLog]);

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener(request => {
      refreshNetwork();
    });

    refreshNetwork();
  }, []);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const columns = [
    {
      Header: () => null,
      id: "actions",
      Cell: ({ row }) => <NetworkActionsCell row={row} editMock={editMock} />
    },
    {
      Header: "Method",
      accessor: "method"
    },
    {
      Header: "URL",
      accessor: "url"
    }
  ];

  const data = harLog?.entries?.map(entry => {
    const { request } = entry;
    const { url, method } = request ?? {};

    return {
      entry,
      method: typeof method === "string" ? method : typeof method,
      url: typeof url === "string" ? url : typeof url
    };
  });

  if (!data) return null;

  return (
    <div>
      <Table data={data} columns={columns} />
    </div>
  );
};

export { TabNetwork };
