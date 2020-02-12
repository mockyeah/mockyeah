import React from "react";
import { useTable, useFilters, useGlobalFilter } from "react-table";

const Table = ({ columns, data }) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    rows,
    preGlobalFilteredRows,
    setGlobalFilter
  } = useTable(
    {
      columns,
      data
    },
    useFilters,
    useGlobalFilter
  );

  if (!columns) return null;
  if (!data) return null;

  // Render the UI for your table
  return (
    <div>
      <span>
        Search:{" "}
        <input
          value={state.globalFilter || ""}
          onChange={e => {
            setGlobalFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
          }}
        />
      </span>
      <table {...getTableProps()} style={{ width: "100%" }}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps()}
                  className={`table-head-${column.id}`}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={`table-cell-${cell.column.id}`}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export { Table };
