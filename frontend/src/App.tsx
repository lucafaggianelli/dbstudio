import {
  ReactFlow,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  Controls,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect } from 'react'

import TableNode, { TableNodeType } from './components/TableNode'
import { DBRelationship, Schema } from './types'
import { adjustTablePositions } from './utils'

const makeNodes = (schema: Schema): TableNodeType[] =>
  adjustTablePositions(schema).map((table) => {
    const pos = sessionStorage.getItem(`dbs-t-pos-${table.id}`)
    let position: { x: number; y: number }

    if (pos) {
      position = JSON.parse(pos)
    } else {
      position = { x: table.x, y: table.y }
    }

    return {
      id: table.id,
      type: 'table',
      position,
      data: { table },
    }
  })

const makeEdges = (edges: DBRelationship[]): Edge[] =>
  edges.map((relationship) => ({
    id: `${relationship.sourceTableId}-${relationship.targetTableId}`,
    source: relationship.sourceTableId.split('.')[0],
    sourceHandle: relationship.sourceTableId.split('.')[1],
    target: relationship.targetTableId.split('.')[0],
    targetHandle: relationship.targetTableId.split('.')[1],
  }))

const nodeTypes = { table: TableNode }

const BASE_URL = import.meta.env.DEV ? 'http://localhost:8000/dbstudio/' : ''

const fetchSchema = async () => {
  const response = await fetch(`${BASE_URL}api/schema`)
  const schema = (await response.json()) as Schema
  return schema
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeType>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    fetchSchema().then((schema) => {
      setNodes(makeNodes(schema))
      setEdges(makeEdges(schema.relationships))
    })
  }, [])

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          changes.forEach((change) => {
            if (change.type === 'position' && !change.dragging) {
              sessionStorage.setItem(
                `dbs-t-pos-${change.id}`,
                JSON.stringify(change.position)
              )
            }
          })

          onNodesChange(changes)
        }}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        colorMode="system"
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
