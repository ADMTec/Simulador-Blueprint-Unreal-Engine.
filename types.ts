export enum DataType {
  EXEC = 'EXEC',
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  ANY = 'ANY',
}

export enum PinDirection {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface Pin {
  id: string;
  nodeId: string;
  label: string;
  dataType: DataType;
  direction: PinDirection;
}

export enum NodeType {
  BeginPlay = 'BeginPlay',
  PrintString = 'PrintString',
  SetVariable = 'SetVariable',
  GetVariable = 'GetVariable',
  AddInteger = 'AddInteger',
  Branch = 'Branch',
  StringLiteral = 'StringLiteral',
  IntegerLiteral = 'IntegerLiteral',
  BooleanLiteral = 'BooleanLiteral',
  ClearVariable = 'ClearVariable',
}

export interface Node {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  inputs: Pin[];
  outputs: Pin[];
  properties: Record<string, any>;
  comment: string;
}

export interface Wire {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
  dataType: DataType;
}
