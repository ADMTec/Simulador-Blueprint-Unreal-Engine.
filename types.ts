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
  // Flow Control
  BeginPlay = 'BeginPlay',
  Branch = 'Branch',
  Sequence = 'Sequence',

  // Variable
  SetVariable = 'SetVariable',
  GetVariable = 'GetVariable',
  ClearVariable = 'ClearVariable',
  
  // Literals
  StringLiteral = 'StringLiteral',
  IntegerLiteral = 'IntegerLiteral',
  BooleanLiteral = 'BooleanLiteral',

  // Operations
  PrintString = 'PrintString',
  AddInteger = 'AddInteger',
  SubtractInteger = 'SubtractInteger',
  MultiplyInteger = 'MultiplyInteger',
  DivideInteger = 'DivideInteger',
  
  // Comparison
  GreaterThanInteger = 'GreaterThanInteger',
  LessThanInteger = 'LessThanInteger',
  EqualsInteger = 'EqualsInteger',
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
