import { DataType, Node, NodeType, Pin, PinDirection } from './types';

// This defines the shape of a node template, which is used to create new nodes.
// It's a partial Node, without properties that are generated at runtime (like id, x, y).
type PinTemplate = Omit<Pin, 'id' | 'nodeId'>;

interface NodeTemplate {
  type: NodeType;
  title: string;
  inputs: PinTemplate[];
  outputs: PinTemplate[];
  properties: Record<string, any>;
  comment: string;
}

export const PIN_COLORS: Record<DataType, string> = {
  [DataType.EXEC]: 'stroke-white',
  [DataType.STRING]: 'stroke-pink-500',
  [DataType.INTEGER]: 'stroke-cyan-400',
  [DataType.FLOAT]: 'stroke-indigo-400',
  [DataType.BOOLEAN]: 'stroke-red-500',
  [DataType.ANY]: 'stroke-gray-400',
};

export const PIN_BACKGROUND_COLORS: Record<DataType, string> = {
    [DataType.EXEC]: 'bg-white',
    [DataType.STRING]: 'bg-pink-500',
    [DataType.INTEGER]: 'bg-cyan-400',
    [DataType.FLOAT]: 'bg-indigo-400',
    [DataType.BOOLEAN]: 'bg-red-500',
    [DataType.ANY]: 'bg-gray-400',
};

export const NODE_TEMPLATES: Record<NodeType, NodeTemplate> = {
  [NodeType.BeginPlay]: {
    type: NodeType.BeginPlay,
    title: 'Begin Play',
    comment: '',
    inputs: [],
    outputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
    ],
    properties: {},
  },
  [NodeType.Sequence]: {
    type: NodeType.Sequence,
    title: 'Sequence',
    comment: '',
    inputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.INPUT },
    ],
    outputs: [
      { label: 'Then 0', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
      { label: 'Then 1', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
    ],
    properties: {},
  },
  [NodeType.PrintString]: {
    type: NodeType.PrintString,
    title: 'Print String',
    comment: '',
    inputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.INPUT },
      { label: 'In String', dataType: DataType.STRING, direction: PinDirection.INPUT },
    ],
    outputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
    ],
    properties: { text: 'Hello World' },
  },
  [NodeType.SetVariable]: {
    type: NodeType.SetVariable,
    title: 'Set Variable',
    comment: '',
    inputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.INPUT },
      { label: 'Value', dataType: DataType.ANY, direction: PinDirection.INPUT },
    ],
    outputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
    ],
    properties: { name: 'myVar' },
  },
  [NodeType.GetVariable]: {
    type: NodeType.GetVariable,
    title: 'Get Variable',
    comment: '',
    inputs: [],
    outputs: [
      { label: 'Value', dataType: DataType.ANY, direction: PinDirection.OUTPUT },
    ],
    properties: { name: 'myVar' },
  },
    [NodeType.ClearVariable]: {
    type: NodeType.ClearVariable,
    title: 'Clear Variable',
    comment: '',
    inputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.INPUT },
    ],
    outputs: [
      { label: '', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
    ],
    properties: { name: 'myVar' },
  },
  [NodeType.AddInteger]: {
      type: NodeType.AddInteger,
      title: 'Add Integer (+)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.AddFloat]: {
      type: NodeType.AddFloat,
      title: 'Add Float (+)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.SubtractInteger]: {
      type: NodeType.SubtractInteger,
      title: 'Subtract Integer (-)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.SubtractFloat]: {
      type: NodeType.SubtractFloat,
      title: 'Subtract Float (-)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.MultiplyInteger]: {
      type: NodeType.MultiplyInteger,
      title: 'Multiply Integer (*)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.MultiplyFloat]: {
      type: NodeType.MultiplyFloat,
      title: 'Multiply Float (*)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.DivideInteger]: {
      type: NodeType.DivideInteger,
      title: 'Divide Integer (/)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.DivideFloat]: {
      type: NodeType.DivideFloat,
      title: 'Divide Float (/)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.GreaterThanInteger]: {
      type: NodeType.GreaterThanInteger,
      title: 'Greater Than (>)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.BOOLEAN, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.GreaterThanFloat]: {
      type: NodeType.GreaterThanFloat,
      title: 'Greater Than Float (>)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.BOOLEAN, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.LessThanInteger]: {
      type: NodeType.LessThanInteger,
      title: 'Less Than (<)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.BOOLEAN, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.LessThanFloat]: {
      type: NodeType.LessThanFloat,
      title: 'Less Than Float (<)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.BOOLEAN, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.EqualsInteger]: {
      type: NodeType.EqualsInteger,
      title: 'Equals (==)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.BOOLEAN, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.EqualsFloat]: {
      type: NodeType.EqualsFloat,
      title: 'Equals Float (==)',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.BOOLEAN, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.Branch]: {
      type: NodeType.Branch,
      title: 'Branch',
      comment: '',
      inputs: [
          { label: '', dataType: DataType.EXEC, direction: PinDirection.INPUT },
          { label: 'Condition', dataType: DataType.BOOLEAN, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'True', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
          { label: 'False', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.ForLoop]: {
      type: NodeType.ForLoop,
      title: 'For Loop',
      comment: '',
      inputs: [
          { label: '', dataType: DataType.EXEC, direction: PinDirection.INPUT },
          { label: 'Start', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'End', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'Step', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Loop Body', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
          { label: 'Completed', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
          { label: 'Index', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: { start: 0, end: 0, step: 1 },
  },
  [NodeType.While]: {
      type: NodeType.While,
      title: 'While Loop',
      comment: '',
      inputs: [
          { label: '', dataType: DataType.EXEC, direction: PinDirection.INPUT },
          { label: 'Condition', dataType: DataType.BOOLEAN, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Loop Body', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
          { label: 'Completed', dataType: DataType.EXEC, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.StringLiteral]: {
      type: NodeType.StringLiteral,
      title: 'String Literal',
      comment: '',
      inputs: [],
      outputs: [
          { label: 'Value', dataType: DataType.STRING, direction: PinDirection.OUTPUT },
      ],
      properties: { value: '' },
  },
  [NodeType.IntegerLiteral]: {
      type: NodeType.IntegerLiteral,
      title: 'Integer Literal',
      comment: '',
      inputs: [],
      outputs: [
          { label: 'Value', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: { value: 0 },
  },
  [NodeType.FloatLiteral]: {
      type: NodeType.FloatLiteral,
      title: 'Float Literal',
      comment: '',
      inputs: [],
      outputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: { value: 0 },
  },
  [NodeType.BooleanLiteral]: {
      type: NodeType.BooleanLiteral,
      title: 'Boolean Literal',
      comment: '',
      inputs: [],
      outputs: [
          { label: 'Value', dataType: DataType.BOOLEAN, direction: PinDirection.OUTPUT },
      ],
      properties: { value: false },
  },
};
