from pydantic import BaseModel, Field
from sqlalchemy import MetaData


class Relationship(BaseModel):
    sourceTableId: str
    targetTableId: str


class Column(BaseModel):
    id: str
    name: str
    type: str
    primaryKey: bool
    unique: bool
    nullable: bool
    createdAt: int
    characterMaximumLength: str | None
    precision: int | None
    scale: int | None
    default: str | None
    collation: str | None
    comments: str | None


class Node(BaseModel):
    id: str
    name: str
    x: int = 0
    y: int = 0
    columns: list[Column] = Field(default_factory=list)


class Schema(BaseModel):
    tables: list[Node] = Field(default_factory=list)
    relationships: list[Relationship] = Field(default_factory=list)


def get_db_schema(metadata: MetaData) -> Schema:
    tables = metadata.tables
    graph = Schema()

    for name, table in tables.items():
        columns: list[Column] = []

        for col in table.columns:
            columns.append(
                Column(
                    id=f"{col.table.name}.{col.name}",
                    name=col.name,
                    type=str(col.type),
                    primaryKey=col.primary_key,
                    unique=col.unique or False,
                    nullable=col.nullable or False,
                    createdAt=0,
                    characterMaximumLength=None,
                    precision=None,
                    scale=None,
                    default=str(col.default),
                    collation=None,
                    comments=col.comment,
                )
            )

        graph.tables.append(Node(id=name, name=name, columns=columns))

        for fk in table.foreign_keys:
            graph.relationships.append(
                Relationship(
                    sourceTableId=f"{fk.column.table.name}.{fk.column.name}",
                    targetTableId=f"{fk.parent.table.name}.{fk.parent.name}",
                )
            )

    return graph
