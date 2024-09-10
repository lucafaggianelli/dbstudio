import { NodeProps, Handle, Position, Node } from '@xyflow/react'
import { KeyRoundIcon } from 'lucide-react'
import React from 'react'

import { DBTable } from '../types'

export type TableNodeType = Node<
  {
    table: DBTable
  },
  'table'
>

const TableNode: React.FC<NodeProps<TableNodeType>> = ({ data: { table } }) => {
  return (
    <div className="bg-white dark:bg-black border rounded-lg border-black dark:border-zinc-300 shadow-[2px_2px_0] dark:shadow-zinc-300 pb-1">
      <h3 className="p-2 mb-1 font-bold border-b border-dashed border-black dark:border-zinc-300 text-center">
        {table.name}
      </h3>

      <div>
        {table.columns.map((column) => (
          <div
            key={column.id}
            className="relative flex px-2 py-1 items-center text-sm gap-2"
            title={column.comments}
          >
            <div className="truncate font-medium flex-grow">{column.name}</div>

            <div className="flex-shrink-0 flex gap-2 text-xs items-center text-zinc-400">
              {column.primaryKey && (
                <KeyRoundIcon size={16} className="text-amber-400" />
              )}

              {column.nullable && (
                <div className="border dark:border-zinc-700 rounded-sm p-0.5 size-5 flex items-center justify-center">
                  N
                </div>
              )}

              {column.unique && (
                <div className="border rounded-sm p-0.5 size-5 flex items-center justify-center text-emerald-600 border-emerald-600/50">
                  U
                </div>
              )}

              {column.type}
            </div>

            <Handle type="target" id={column.name} position={Position.Left} />
            <Handle type="source" id={column.name} position={Position.Right} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableNode
