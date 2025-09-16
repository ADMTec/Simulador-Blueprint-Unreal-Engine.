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
  [DataType.FLOAT]: 'stroke-emerald-400',
  [DataType.BOOLEAN]: 'stroke-red-500',
  [DataType.ANY]: 'stroke-gray-400',
};

interface WireColorPalette {
  start: string;
  mid: string;
  end: string;
  inner: string;
  glow: string;
}

export const WIRE_COLORS: Record<DataType, WireColorPalette> = {
  [DataType.EXEC]: {
    start: '#f8fafc',
    mid: '#dbeafe',
    end: '#93c5fd',
    inner: '#ffffff',
    glow: 'rgba(191, 219, 254, 0.85)',
  },
  [DataType.STRING]: {
    start: '#f9a8d4',
    mid: '#f472b6',
    end: '#ec4899',
    inner: '#fdf2f8',
    glow: 'rgba(244, 114, 182, 0.55)',
  },
  [DataType.INTEGER]: {
    start: '#67e8f9',
    mid: '#22d3ee',
    end: '#0e7490',
    inner: '#ecfeff',
    glow: 'rgba(34, 211, 238, 0.55)',
  },
  [DataType.FLOAT]: {
    start: '#6ee7b7',
    mid: '#34d399',
    end: '#047857',
    inner: '#d1fae5',
    glow: 'rgba(52, 211, 153, 0.55)',
  },
  [DataType.BOOLEAN]: {
    start: '#fca5a5',
    mid: '#f87171',
    end: '#dc2626',
    inner: '#fee2e2',
    glow: 'rgba(248, 113, 113, 0.55)',
  },
  [DataType.ANY]: {
    start: '#e2e8f0',
    mid: '#94a3b8',
    end: '#475569',
    inner: '#f8fafc',
    glow: 'rgba(148, 163, 184, 0.45)',
  },
};

export const PIN_BACKGROUND_COLORS: Record<DataType, string> = {
    [DataType.EXEC]: 'bg-white',
    [DataType.STRING]: 'bg-pink-500',
    [DataType.INTEGER]: 'bg-cyan-400',
    [DataType.FLOAT]: 'bg-emerald-400',
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
  [NodeType.ModuloInteger]: {
      type: NodeType.ModuloInteger,
      title: 'Integer Modulo (%)',
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
  [NodeType.ClampInteger]: {
      type: NodeType.ClampInteger,
      title: 'Clamp Integer',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'Min', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'Max', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.RandomInteger]: {
      type: NodeType.RandomInteger,
      title: 'Random Integer',
      comment: '',
      inputs: [
          { label: 'Min', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
          { label: 'Max', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.AbsoluteInteger]: {
      type: NodeType.AbsoluteInteger,
      title: 'Abs Int (|A|)',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.MinInteger]: {
      type: NodeType.MinInteger,
      title: 'Min Int (A, B)',
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
  [NodeType.MaxInteger]: {
      type: NodeType.MaxInteger,
      title: 'Max Int (A, B)',
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
  [NodeType.ModuloFloat]: {
      type: NodeType.ModuloFloat,
      title: 'Float Modulo (%)',
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
  [NodeType.ClampFloat]: {
      type: NodeType.ClampFloat,
      title: 'Clamp Float',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'Min', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'Max', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.RandomFloat]: {
      type: NodeType.RandomFloat,
      title: 'Random Float',
      comment: '',
      inputs: [
          { label: 'Min', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'Max', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.AbsoluteFloat]: {
      type: NodeType.AbsoluteFloat,
      title: 'Abs Float (|A|)',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.MinFloat]: {
      type: NodeType.MinFloat,
      title: 'Min Float (A, B)',
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
  [NodeType.MaxFloat]: {
      type: NodeType.MaxFloat,
      title: 'Max Float (A, B)',
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
  [NodeType.PowerFloat]: {
      type: NodeType.PowerFloat,
      title: 'Float Power (A^B)',
      comment: '',
      inputs: [
          { label: 'Base', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'Exponent', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.SquareRootFloat]: {
      type: NodeType.SquareRootFloat,
      title: 'Float Square Root (√)',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.FloorFloat]: {
      type: NodeType.FloorFloat,
      title: 'Floor (⌊A⌋)',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.CeilFloat]: {
      type: NodeType.CeilFloat,
      title: 'Ceil (⌈A⌉)',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.RoundFloat]: {
      type: NodeType.RoundFloat,
      title: 'Round',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.LerpFloat]: {
      type: NodeType.LerpFloat,
      title: 'Lerp Float',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
          { label: 'Alpha', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.IntToFloat]: {
      type: NodeType.IntToFloat,
      title: 'Int → Float',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.INTEGER, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.FLOAT, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.FloatToInt]: {
      type: NodeType.FloatToInt,
      title: 'Float → Int',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.FLOAT, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
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
  [NodeType.GreaterThanFloat]: {
      type: NodeType.GreaterThanFloat,
      title: 'Float Greater Than (>)',
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
  [NodeType.LessThanFloat]: {
      type: NodeType.LessThanFloat,
      title: 'Float Less Than (<)',
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
  [NodeType.EqualsFloat]: {
      type: NodeType.EqualsFloat,
      title: 'Float Equals (==)',
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
  [NodeType.BooleanNot]: {
      type: NodeType.BooleanNot,
      title: 'Boolean NOT',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.BOOLEAN, direction: PinDirection.INPUT },
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
      properties: { value: 0.0 },
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
  [NodeType.StringConcat]: {
      type: NodeType.StringConcat,
      title: 'Append String',
      comment: '',
      inputs: [
          { label: 'A', dataType: DataType.STRING, direction: PinDirection.INPUT },
          { label: 'B', dataType: DataType.STRING, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.STRING, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.StringLength]: {
      type: NodeType.StringLength,
      title: 'String Length',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.STRING, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Length', dataType: DataType.INTEGER, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
  [NodeType.ToString]: {
      type: NodeType.ToString,
      title: 'To String',
      comment: '',
      inputs: [
          { label: 'Value', dataType: DataType.ANY, direction: PinDirection.INPUT },
      ],
      outputs: [
          { label: 'Result', dataType: DataType.STRING, direction: PinDirection.OUTPUT },
      ],
      properties: {},
  },
};

export const NODE_LIBRARY_GROUPS: { label: string; types: NodeType[] }[] = [
  {
    label: 'Flow Control',
    types: [NodeType.BeginPlay, NodeType.Sequence, NodeType.Branch],
  },
  {
    label: 'Variables',
    types: [NodeType.GetVariable, NodeType.SetVariable, NodeType.ClearVariable],
  },
  {
    label: 'Literals',
    types: [
      NodeType.StringLiteral,
      NodeType.IntegerLiteral,
      NodeType.FloatLiteral,
      NodeType.BooleanLiteral,
    ],
  },
  {
    label: 'Math · Integer',
    types: [
      NodeType.AddInteger,
      NodeType.SubtractInteger,
      NodeType.MultiplyInteger,
      NodeType.DivideInteger,
      NodeType.ModuloInteger,
      NodeType.ClampInteger,
      NodeType.RandomInteger,
      NodeType.AbsoluteInteger,
      NodeType.MinInteger,
      NodeType.MaxInteger,
    ],
  },
  {
    label: 'Math · Float',
    types: [
      NodeType.AddFloat,
      NodeType.SubtractFloat,
      NodeType.MultiplyFloat,
      NodeType.DivideFloat,
      NodeType.ModuloFloat,
      NodeType.ClampFloat,
      NodeType.RandomFloat,
      NodeType.AbsoluteFloat,
      NodeType.MinFloat,
      NodeType.MaxFloat,
      NodeType.PowerFloat,
      NodeType.SquareRootFloat,
      NodeType.FloorFloat,
      NodeType.CeilFloat,
      NodeType.RoundFloat,
      NodeType.LerpFloat,
    ],
  },
  {
    label: 'Math · Conversion',
    types: [NodeType.IntToFloat, NodeType.FloatToInt],
  },
  {
    label: 'Comparison & Logic',
    types: [
      NodeType.GreaterThanInteger,
      NodeType.LessThanInteger,
      NodeType.EqualsInteger,
      NodeType.GreaterThanFloat,
      NodeType.LessThanFloat,
      NodeType.EqualsFloat,
      NodeType.BooleanNot,
    ],
  },
  {
    label: 'String & Output',
    types: [
      NodeType.PrintString,
      NodeType.StringConcat,
      NodeType.StringLength,
      NodeType.ToString,
    ],
  },
];

const groupedTypes = new Set<NodeType>(NODE_LIBRARY_GROUPS.flatMap(group => group.types));

export const ORDERED_NODE_TYPES: NodeType[] = [
  ...NODE_LIBRARY_GROUPS.flatMap(group => group.types),
  ...((Object.keys(NODE_TEMPLATES) as NodeType[]).filter(type => !groupedTypes.has(type))),
];
