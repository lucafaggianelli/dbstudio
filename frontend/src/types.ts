export interface DBColumn {
  id: string;
  name: string;
  type: string;
  primaryKey: boolean;
  unique: boolean;
  nullable: boolean;
  createdAt: number;
  characterMaximumLength?: string;
  precision?: number;
  scale?: number;
  default?: string;
  collation?: string;
  comments?: string;
}

export interface DBTable {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: DBColumn[];
}

export interface DBRelationship {
  sourceTableId: string;
  targetTableId: string;
}

export interface Schema {
  tables: DBTable[];
  relationships: DBRelationship[];
}
