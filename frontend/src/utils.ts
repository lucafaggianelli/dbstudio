import { DBRelationship, DBTable } from "./types";

export const adjustTablePositions = ({
  relationships,
  tables,
}: {
  tables: DBTable[];
  relationships: DBRelationship[];
}): DBTable[] => {
  const tableWidth = 200;
  const tableHeight = 300; // Approximate height of each table, adjust as needed
  const gapX = 55;
  const gapY = 42;
  const maxTablesPerRow = 6; // Maximum number of tables per row
  const startX = 100;
  const startY = 100;

  let currentX = startX;
  let currentY = startY;
  let tablesInCurrentRow = 0;

  // Step 1: Identify the most connected table and sort the tables by their connectivity
  const tableConnections = new Map<string, number>();
  relationships.forEach((rel) => {
    tableConnections.set(
      rel.sourceTableId,
      (tableConnections.get(rel.sourceTableId) || 0) + 1
    );
    tableConnections.set(
      rel.targetTableId,
      (tableConnections.get(rel.targetTableId) || 0) + 1
    );
  });

  const sortedTableIds = [...tableConnections.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  const positionedTables = new Set<string>();

  const positionTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || positionedTables.has(tableId)) {
      return;
    }

    // Set the X and Y positions
    table.x = currentX;
    table.y = currentY;
    positionedTables.add(tableId);

    // Update position for the next table
    tablesInCurrentRow++;
    if (tablesInCurrentRow >= maxTablesPerRow) {
      tablesInCurrentRow = 0;
      currentX = startX;
      currentY += tableHeight + gapY;
    } else {
      currentX += tableWidth + gapX;
    }

    // Position connected tables recursively
    const connectedTables = relationships
      .filter(
        (rel) => rel.sourceTableId === tableId || rel.targetTableId === tableId
      )
      .map((rel) =>
        rel.sourceTableId === tableId ? rel.targetTableId : rel.sourceTableId
      );

    connectedTables.forEach(positionTable);
  };

  // Step 2: Start positioning with the most connected tables first
  sortedTableIds.forEach((tableId) => {
    if (!positionedTables.has(tableId)) {
      positionTable(tableId);
    }
  });

  // Step 3: Handle any remaining unpositioned tables
  tables.forEach((table) => {
    if (!positionedTables.has(table.id)) {
      positionTable(table.id);
    }
  });

  return tables;
};
