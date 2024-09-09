import {
  ReactFlow,
  Node,
  Edge,
  NodeProps,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import { KeyRoundIcon } from "lucide-react";

import "@xyflow/react/dist/style.css";
import { DBRelationship, DBTable, Graph } from "./types";
import { adjustTablePositions } from "./utils";
import { useEffect } from "react";

export type TableNodeType = Node<
  {
    table: DBTable;
  },
  "table"
>;

const makeNodes = (schema: Graph): TableNodeType[] =>
  adjustTablePositions(schema).map((table) => {
    const pos = sessionStorage.getItem(`dbs-t-pos-${table.id}`);
    let position: { x: number; y: number };

    if (pos) {
      position = JSON.parse(pos);
    } else {
      position = { x: table.x, y: table.y };
    }

    return {
      id: table.id,
      type: "table",
      position,
      data: { table },
    };
  });

const makeEdges = (edges: DBRelationship[]): Edge[] =>
  edges.map((relationship) => ({
    id: `${relationship.sourceTableId}-${relationship.targetTableId}`,
    source: relationship.sourceTableId.split(".")[0],
    sourceHandle: relationship.sourceTableId.split(".")[1],
    target: relationship.targetTableId.split(".")[0],
    targetHandle: relationship.targetTableId.split(".")[1],
  }));

const TableNode: React.FC<NodeProps<TableNodeType>> = ({ data: { table } }) => {
  return (
    <div className="bg-white border rounded-lg border-black shadow-[2px_2px_0_black] pb-1">
      <h3 className="p-2 mb-1 font-bold border-b border-dashed border-black text-center">
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
                <div className="border rounded-sm p-0.5 size-5 flex items-center justify-center">
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
  );
};

const nodeTypes = { table: TableNode };

const BASE_URL = import.meta.env.DEV ? "http://localhost:8000/dbstudio/" : "";

const fetchSchema = async () => {
  const response = await fetch(`${BASE_URL}api/schema`);
  const schema = (await response.json()) as Graph;
  return schema;
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    fetchSchema().then((schema) => {
      setNodes(makeNodes(schema));
      setEdges(makeEdges(schema.relationships));
    });
  }, []);

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          changes.forEach((change) => {
            if (change.type === "position" && !change.dragging) {
              sessionStorage.setItem(
                `dbs-t-pos-${change.id}`,
                JSON.stringify(change.position)
              );
            }
          });

          onNodesChange(changes);
        }}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
