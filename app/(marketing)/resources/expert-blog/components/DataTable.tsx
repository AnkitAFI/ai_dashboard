// "use client";

// import React from "react";

// export interface TableChip {
//   type: "chip";
//   label: string;
//   className?: string;
// }

// export interface TableText {
//   value: React.ReactNode;
//   className?: string;
// }

// export type TableCell =
//   | string
//   | number
//   | TableChip
//   | TableText
//   | React.ReactNode;

// export interface TableColumn {
//   key: string;
//   label: string;
//   headerClassName?: string;
//   cellClassName?: string;
// }

// export type TableRow = {
//   rowClassName?: string;
// } & Record<string, TableCell>;

// interface DataTableProps {
//   columns: TableColumn[];
//   rows: TableRow[];
//   className?: string;
// }

// function isChip(value: unknown): value is TableChip {
//   return (
//     typeof value === "object" &&
//     value !== null &&
//     "type" in value &&
//     (value as TableChip).type === "chip"
//   );
// }

// function isText(value: unknown): value is TableText {
//   return (
//     typeof value === "object" &&
//     value !== null &&
//     "value" in value &&
//     !("type" in value)
//   );
// }

// export default function DataTable({
//   columns,
//   rows,
//   className = "",
// }: DataTableProps) {
//   const renderCell = (cell: TableCell): React.ReactNode => {
//     if (typeof cell === "string" || typeof cell === "number") {
//       return cell;
//     }

//     if (isChip(cell)) {
//       return (
//         <span
//           className={`inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold ${cell.className ?? ""}`}
//         >
//           {cell.label}
//         </span>
//       );
//     }

//     if (isText(cell)) {
//       return <span className={cell.className}>{cell.value}</span>;
//     }

//     return cell;
//   };

//   return (
//     <div
//       className={`overflow-x-auto rounded-2xl border border-gray-200 mb-8 dark:border-gray-800 shadow-sm ${className}`}
//     >
//       <table className="w-full border-collapse">
//         <thead>
//           <tr>
//             {columns.map((column) => (
//               <th
//                 key={column.key}
//                 className={`
//                   px-4 sm:px-6
//                   py-3 sm:py-4
//                   text-left
//                   font-bold
//                   text-xs sm:text-base
//                   ${column.headerClassName ?? ""}
//                 `}
//               >
//                 {column.label}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {rows.map((row, rowIndex) => (
//             <tr
//               key={rowIndex}
//               className={`
//                 border-b
//                 border-gray-200
//                 dark:border-gray-800
//                 ${row.rowClassName ?? ""}
//               `}
//             >
//               {columns.map((column) => (
//                 <td
//                   key={column.key}
//                   className={`
//                     px-4 sm:px-6
//                     py-3 sm:py-4
//                     text-sm sm:text-base
//                     ${column.cellClassName ?? ""}
//                   `}
//                 >
//                   {renderCell(row[column.key])}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

import React from "react";

export interface TableChip {
  type: "chip";
  label: string;
  className?: string;
}

export interface TableText {
  value: React.ReactNode;
  className?: string;
}

export type TableCell =
  | string
  | number
  | TableChip
  | TableText
  | React.ReactNode;

export interface TableColumn {
  key: string;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
}

export type TableRow = {
  rowClassName?: string;
} & Record<string, TableCell>;

interface DataTableProps {
  columns: TableColumn[];
  rows: TableRow[];
  className?: string;
}

function isChip(value: unknown): value is TableChip {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as TableChip).type === "chip"
  );
}

function isText(value: unknown): value is TableText {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    !("type" in value)
  );
}

export default function DataTable({
  columns,
  rows,
  className = "",
}: DataTableProps) {
  const renderCell = (cell: TableCell): React.ReactNode => {
    if (typeof cell === "string" || typeof cell === "number") {
      return cell;
    }

    if (isChip(cell)) {
      return (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold ${cell.className ?? ""}`}
        >
          {cell.label}
        </span>
      );
    }

    if (isText(cell)) {
      return <span className={cell.className}>{cell.value}</span>;
    }

    return cell;
  };

  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 shadow-sm ${className}`}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-[#0f172a]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 sm:px-6
                  py-3 sm:py-4
                  text-left
                  font-bold
                  text-xs sm:text-base
                  text-gray-900 dark:text-gray-100
                  ${column.headerClassName ?? ""}
                `}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`
                border-b
                border-gray-200
                dark:border-gray-700
                odd:bg-white even:bg-gray-50
                dark:odd:bg-[#1e293b] dark:even:bg-[#0f172a]
                text-gray-800 dark:text-gray-200
                ${row.rowClassName ?? ""}
              `}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`
                    px-4 sm:px-6
                    py-3 sm:py-4
                    text-sm sm:text-base
                    ${column.cellClassName ?? ""}
                  `}
                >
                  {renderCell(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
