import { Node, Wire, NodeType, Pin, DataType } from '../types';

export const executeBlueprint = (nodes: Node[], wires: Wire[]): string[] => {
  const output: string[] = [];
  const variables: Record<string, any> = {};
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const wiresToPin = new Map(wires.map(w => [w.toPinId, w]));
  const wiresFromPin = new Map(wires.map(w => [w.fromPinId, w]));

  const getInputValue = (node: Node, pinLabel: string, pinDataType: DataType): any => {
      const pin = node.inputs.find(p => p.label === pinLabel && p.dataType === pinDataType);
      if (!pin) return undefined;
      return evaluatePinValue(node.id, pin.id);
  };
  
  const evaluatePinValue = (nodeId: string, pinId: string): any => {
    const wire = wiresToPin.get(pinId);
    const node = nodeMap.get(nodeId);

    if (wire) {
        const fromNode = nodeMap.get(wire.fromNodeId);
        if (!fromNode) return undefined;
        
        switch (fromNode.type) {
            case NodeType.GetVariable:
                return variables[fromNode.properties.name];
            case NodeType.AddInteger:
            case NodeType.SubtractInteger:
            case NodeType.MultiplyInteger:
            case NodeType.DivideInteger: {
                const a = getInputValue(fromNode, 'A', DataType.INTEGER);
                const b = getInputValue(fromNode, 'B', DataType.INTEGER);
                if (typeof a !== 'number' || typeof b !== 'number') return 0;

                if (fromNode.type === NodeType.AddInteger) return a + b;
                if (fromNode.type === NodeType.SubtractInteger) return a - b;
                if (fromNode.type === NodeType.MultiplyInteger) return a * b;
                if (fromNode.type === NodeType.DivideInteger) return b !== 0 ? Math.floor(a / b) : 0;
                return 0;
            }
            case NodeType.ModuloInteger: {
                const a = getInputValue(fromNode, 'A', DataType.INTEGER);
                const b = getInputValue(fromNode, 'B', DataType.INTEGER);
                if (typeof a !== 'number' || typeof b !== 'number' || b === 0) return 0;
                const remainder = a % b;
                return remainder < 0 ? remainder + Math.abs(b) : remainder;
            }
            case NodeType.ClampInteger: {
                const value = getInputValue(fromNode, 'Value', DataType.INTEGER);
                const min = getInputValue(fromNode, 'Min', DataType.INTEGER);
                const max = getInputValue(fromNode, 'Max', DataType.INTEGER);
                if (typeof value !== 'number') return 0;
                const low = typeof min === 'number' ? min : value;
                const high = typeof max === 'number' ? max : value;
                const [clampMin, clampMax] = low <= high ? [low, high] : [high, low];
                return Math.min(Math.max(value, clampMin), clampMax);
            }
            case NodeType.RandomInteger: {
                const minValue = getInputValue(fromNode, 'Min', DataType.INTEGER);
                const maxValue = getInputValue(fromNode, 'Max', DataType.INTEGER);
                const min = typeof minValue === 'number' ? minValue : 0;
                const max = typeof maxValue === 'number' ? maxValue : 1;
                const low = Math.min(min, max);
                const high = Math.max(min, max);
                const range = high - low + 1;
                if (!Number.isFinite(range) || range <= 0) {
                    return low;
                }
                return low + Math.floor(Math.random() * range);
            }
            case NodeType.AbsoluteInteger: {
                const value = getInputValue(fromNode, 'Value', DataType.INTEGER);
                if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                return Math.abs(Math.trunc(value));
            }
            case NodeType.MinInteger:
            case NodeType.MaxInteger: {
                const aValue = getInputValue(fromNode, 'A', DataType.INTEGER);
                const bValue = getInputValue(fromNode, 'B', DataType.INTEGER);
                const a = typeof aValue === 'number' && Number.isFinite(aValue) ? Math.trunc(aValue) : undefined;
                const b = typeof bValue === 'number' && Number.isFinite(bValue) ? Math.trunc(bValue) : undefined;
                if (a === undefined && b === undefined) return 0;
                if (a === undefined) return b ?? 0;
                if (b === undefined) return a;
                return fromNode.type === NodeType.MinInteger ? Math.min(a, b) : Math.max(a, b);
            }
            case NodeType.GreaterThanInteger:
            case NodeType.LessThanInteger:
            case NodeType.EqualsInteger: {
                const a = getInputValue(fromNode, 'A', DataType.INTEGER);
                const b = getInputValue(fromNode, 'B', DataType.INTEGER);
                if (typeof a !== 'number' || typeof b !== 'number') return false;

                if (fromNode.type === NodeType.GreaterThanInteger) return a > b;
                if (fromNode.type === NodeType.LessThanInteger) return a < b;
                if (fromNode.type === NodeType.EqualsInteger) return a === b;
                return false;
            }
            case NodeType.AddFloat:
            case NodeType.SubtractFloat:
            case NodeType.MultiplyFloat:
            case NodeType.DivideFloat: {
                const a = getInputValue(fromNode, 'A', DataType.FLOAT);
                const b = getInputValue(fromNode, 'B', DataType.FLOAT);
                if (typeof a !== 'number' || typeof b !== 'number') return 0;

                if (fromNode.type === NodeType.AddFloat) return a + b;
                if (fromNode.type === NodeType.SubtractFloat) return a - b;
                if (fromNode.type === NodeType.MultiplyFloat) return a * b;
                if (fromNode.type === NodeType.DivideFloat) return b !== 0 ? a / b : 0;
                return 0;
            }
            case NodeType.ModuloFloat: {
                const a = getInputValue(fromNode, 'A', DataType.FLOAT);
                const b = getInputValue(fromNode, 'B', DataType.FLOAT);
                if (typeof a !== 'number' || typeof b !== 'number' || b === 0) return 0;
                return a % b;
            }
            case NodeType.ClampFloat: {
                const value = getInputValue(fromNode, 'Value', DataType.FLOAT);
                const min = getInputValue(fromNode, 'Min', DataType.FLOAT);
                const max = getInputValue(fromNode, 'Max', DataType.FLOAT);
                if (typeof value !== 'number') return 0;
                const low = typeof min === 'number' ? min : value;
                const high = typeof max === 'number' ? max : value;
                const [clampMin, clampMax] = low <= high ? [low, high] : [high, low];
                return Math.min(Math.max(value, clampMin), clampMax);
            }
            case NodeType.RandomFloat: {
                const minValue = getInputValue(fromNode, 'Min', DataType.FLOAT);
                const maxValue = getInputValue(fromNode, 'Max', DataType.FLOAT);
                const min = typeof minValue === 'number' ? minValue : 0;
                const max = typeof maxValue === 'number' ? maxValue : 1;
                const low = Math.min(min, max);
                const high = Math.max(min, max);
                const range = high - low;
                if (!Number.isFinite(range) || range === 0) {
                    return low;
                }
                return low + Math.random() * range;
            }
            case NodeType.AbsoluteFloat: {
                const value = getInputValue(fromNode, 'Value', DataType.FLOAT);
                if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                return Math.abs(value);
            }
            case NodeType.MinFloat:
            case NodeType.MaxFloat: {
                const aValue = getInputValue(fromNode, 'A', DataType.FLOAT);
                const bValue = getInputValue(fromNode, 'B', DataType.FLOAT);
                const a = typeof aValue === 'number' && Number.isFinite(aValue) ? aValue : undefined;
                const b = typeof bValue === 'number' && Number.isFinite(bValue) ? bValue : undefined;
                if (a === undefined && b === undefined) return 0;
                if (a === undefined) return b ?? 0;
                if (b === undefined) return a;
                return fromNode.type === NodeType.MinFloat ? Math.min(a, b) : Math.max(a, b);
            }
            case NodeType.PowerFloat: {
                const baseValue = getInputValue(fromNode, 'Base', DataType.FLOAT);
                const exponentValue = getInputValue(fromNode, 'Exponent', DataType.FLOAT);
                const base = typeof baseValue === 'number' && Number.isFinite(baseValue) ? baseValue : 0;
                const exponent = typeof exponentValue === 'number' && Number.isFinite(exponentValue) ? exponentValue : 0;
                return Math.pow(base, exponent);
            }
            case NodeType.SquareRootFloat: {
                const value = getInputValue(fromNode, 'Value', DataType.FLOAT);
                if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                return value < 0 ? NaN : Math.sqrt(value);
            }
            case NodeType.FloorFloat: {
                const value = getInputValue(fromNode, 'Value', DataType.FLOAT);
                if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                return Math.floor(value);
            }
            case NodeType.CeilFloat: {
                const value = getInputValue(fromNode, 'Value', DataType.FLOAT);
                if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                return Math.ceil(value);
            }
            case NodeType.RoundFloat: {
                const value = getInputValue(fromNode, 'Value', DataType.FLOAT);
                if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                return Math.round(value);
            }
            case NodeType.LerpFloat: {
                const aValue = getInputValue(fromNode, 'A', DataType.FLOAT);
                const bValue = getInputValue(fromNode, 'B', DataType.FLOAT);
                const alphaValue = getInputValue(fromNode, 'Alpha', DataType.FLOAT);
                const hasA = typeof aValue === 'number' && Number.isFinite(aValue);
                const hasB = typeof bValue === 'number' && Number.isFinite(bValue);
                const start = hasA ? (aValue as number) : 0;
                const end = hasB ? (bValue as number) : start;
                const alpha = typeof alphaValue === 'number' && Number.isFinite(alphaValue) ? (alphaValue as number) : 0;
                return start + (end - start) * alpha;
            }
            case NodeType.IntToFloat: {
                const value = getInputValue(fromNode, 'Value', DataType.INTEGER);
                if (value === undefined || value === null) return 0;
                return Number(value);
            }
            case NodeType.FloatToInt: {
                const value = getInputValue(fromNode, 'Value', DataType.FLOAT);
                if (typeof value !== 'number') return 0;
                return Math.trunc(value);
            }
            case NodeType.GreaterThanFloat:
            case NodeType.LessThanFloat:
            case NodeType.EqualsFloat: {
                const a = getInputValue(fromNode, 'A', DataType.FLOAT);
                const b = getInputValue(fromNode, 'B', DataType.FLOAT);
                if (typeof a !== 'number' || typeof b !== 'number') return false;

                if (fromNode.type === NodeType.GreaterThanFloat) return a > b;
                if (fromNode.type === NodeType.LessThanFloat) return a < b;
                if (fromNode.type === NodeType.EqualsFloat) return a === b;
                return false;
            }

            case NodeType.StringConcat: {
                const a = getInputValue(fromNode, 'A', DataType.STRING);
                const b = getInputValue(fromNode, 'B', DataType.STRING);
                return `${a ?? ''}${b ?? ''}`;
            }
            case NodeType.StringLength: {
                const value = getInputValue(fromNode, 'Value', DataType.STRING);
                return String(value ?? '').length;
            }
            case NodeType.ToString: {
                const value = getInputValue(fromNode, 'Value', DataType.ANY);
                return value === undefined || value === null ? '' : String(value);
            }
            case NodeType.BooleanNot: {
                const value = getInputValue(fromNode, 'Value', DataType.BOOLEAN);
                return !value;
            }

            case NodeType.StringLiteral:
            case NodeType.IntegerLiteral:
            case NodeType.FloatLiteral:
            case NodeType.BooleanLiteral:
                return fromNode.properties.value;

            default:
              const outputPin = fromNode.outputs.find(p => p.id === wire.fromPinId);
              if (outputPin) {
                // This is a generic case, might need expansion for more complex data nodes
                return evaluatePinValue(fromNode.id, outputPin.id);
              }
              return undefined;
        }
    } else {
        // No wire connected, use node's internal properties for specific cases
        if (node?.type === NodeType.PrintString) {
             return node.properties.text;
        }
    }
    return undefined;
  };
  
  const findNextExecNode = (fromNode: Node, fromPinId: string): Node | undefined => {
      const wire = wiresFromPin.get(fromPinId);
      return wire ? nodeMap.get(wire.toNodeId) : undefined;
  };

  let currentNode = nodes.find(n => n.type === NodeType.BeginPlay);
  if (!currentNode) {
    return ['Error: "Begin Play" node not found.'];
  }

  let executionQueue: (Node | undefined)[] = [currentNode];
  let executionCount = 0;
  const maxExecutions = 1000; // Infinite loop guard

  while (executionQueue.length > 0 && executionCount < maxExecutions) {
    currentNode = executionQueue.shift();
    if (!currentNode) continue;

    executionCount++;
    let nextNode: Node | undefined = undefined;
    
    const getNextNodeFromSingleExecOutput = (node: Node): Node | undefined => {
        const execOutPin = node.outputs.find(p => p.dataType === DataType.EXEC && p.label === '');
        return execOutPin ? findNextExecNode(node, execOutPin.id) : undefined;
    };

    switch (currentNode.type) {
      case NodeType.BeginPlay:
        nextNode = getNextNodeFromSingleExecOutput(currentNode);
        break;
      
      case NodeType.Sequence:
        // Add all sequence outputs to the execution queue
        for (const execOutPin of currentNode.outputs) {
          if (execOutPin.dataType === DataType.EXEC) {
            const nextNodeInSequence = findNextExecNode(currentNode, execOutPin.id);
            if (nextNodeInSequence) {
              executionQueue.push(nextNodeInSequence);
            }
          }
        }
        // Don't set nextNode directly, as we're using a queue now
        break;
        
      case NodeType.PrintString: {
        const textPin = currentNode.inputs.find(p => p.dataType === DataType.STRING);
        if (textPin) {
          const value = evaluatePinValue(currentNode.id, textPin.id);
          output.push(String(value ?? ''));
        }
        nextNode = getNextNodeFromSingleExecOutput(currentNode);
        break;
      }
      case NodeType.SetVariable: {
          const valuePin = currentNode.inputs.find(p => p.label === 'Value');
          if (valuePin) {
            const value = evaluatePinValue(currentNode.id, valuePin.id);
            variables[currentNode.properties.name] = value;
          }
          nextNode = getNextNodeFromSingleExecOutput(currentNode);
          break;
      }
      case NodeType.ClearVariable: {
          const varName = currentNode.properties.name;
          if (varName) {
            delete variables[varName];
          }
          nextNode = getNextNodeFromSingleExecOutput(currentNode);
          break;
      }
      case NodeType.Branch: {
          const conditionPin = currentNode.inputs.find(p => p.dataType === DataType.BOOLEAN);
          const condition = conditionPin ? !!evaluatePinValue(currentNode.id, conditionPin.id) : false;
          const outPinLabel = condition ? 'True' : 'False';
          const outPin = currentNode.outputs.find(p => p.label === outPinLabel);
          if (outPin) {
            nextNode = findNextExecNode(currentNode, outPin.id);
          }
          break;
      }
      default:
        nextNode = undefined;
        break;
    }
    
    if (nextNode) {
      executionQueue.push(nextNode);
    }
  }
   if (executionCount >= maxExecutions) {
    output.push('Error: Maximum execution limit reached. Possible infinite loop.');
  }

  output.push('---');
  output.push('Final Variable States:');
  if (Object.keys(variables).length > 0) {
    for (const [name, value] of Object.entries(variables)) {
      output.push(`  ${name}: ${JSON.stringify(value)}`);
    }
  } else {
    output.push('  (No variables in memory)');
  }

  return output;
};
