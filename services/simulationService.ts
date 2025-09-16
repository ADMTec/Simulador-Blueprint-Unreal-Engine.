import { Node, Wire, NodeType, DataType } from '../types';

export const executeBlueprint = (nodes: Node[], wires: Wire[]): string[] => {
  const output: string[] = [];
  const variables: Record<string, any> = {};
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const wiresToPin = new Map(wires.map(w => [w.toPinId, w]));
  const wiresFromPin = new Map<string, Wire[]>();
  for (const wire of wires) {
    const existing = wiresFromPin.get(wire.fromPinId);
    if (existing) {
      existing.push(wire);
    } else {
      wiresFromPin.set(wire.fromPinId, [wire]);
    }
  }

  const getInputValue = (node: Node, pinLabel: string, pinDataType: DataType): any => {
    const pin = node.inputs.find(p => p.label === pinLabel && p.dataType === pinDataType);
    if (!pin) return undefined;
    return evaluatePinValue(node.id, pin.id);
  };

  const parseNumericInput = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (typeof value === 'bigint') {
      return Number(value);
    }
    return null;
  };

  const getNumericInputs = (node: Node): { a: number; b: number } | null => {
    const rawA = getInputValue(node, 'A', DataType.INTEGER);
    const rawB = getInputValue(node, 'B', DataType.INTEGER);
    const parsedA = parseNumericInput(rawA);
    const parsedB = parseNumericInput(rawB);

    if (parsedA === null || parsedB === null) {
      const describe = (value: unknown) => String(value);
      output.push(
        `Warning: ${node.title} expected numeric inputs but received ${describe(rawA)} and ${describe(rawB)}.`
      );
      return null;
    }

    return { a: parsedA, b: parsedB };
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
            case NodeType.DivideInteger:
            case NodeType.GreaterThanInteger:
            case NodeType.LessThanInteger:
            case NodeType.EqualsInteger: {
                const numericInputs = getNumericInputs(fromNode);
                const expectsBooleanResult =
                    fromNode.type === NodeType.GreaterThanInteger ||
                    fromNode.type === NodeType.LessThanInteger ||
                    fromNode.type === NodeType.EqualsInteger;

                if (!numericInputs) {
                    return expectsBooleanResult ? false : 0;
                }

                const { a, b } = numericInputs;

                switch (fromNode.type) {
                    case NodeType.AddInteger:
                        return a + b;
                    case NodeType.SubtractInteger:
                        return a - b;
                    case NodeType.MultiplyInteger:
                        return a * b;
                    case NodeType.DivideInteger:
                        if (b === 0) {
                            output.push(`Warning: ${fromNode.title} attempted to divide by zero. Returning 0.`);
                            return 0;
                        }
                        return Math.trunc(a / b);
                    case NodeType.GreaterThanInteger:
                        return a > b;
                    case NodeType.LessThanInteger:
                        return a < b;
                    case NodeType.EqualsInteger:
                        return a === b;
                }
                return 0;
            }

            case NodeType.StringLiteral:
            case NodeType.IntegerLiteral:
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
  
  const findNextExecNodes = (fromPinId: string): Node[] => {
    const connectedWires = wiresFromPin.get(fromPinId);
    if (!connectedWires) return [];

    const nextNodes: Node[] = [];
    for (const wire of connectedWires) {
      const nextNode = nodeMap.get(wire.toNodeId);
      if (nextNode) {
        nextNodes.push(nextNode);
      }
    }
    return nextNodes;
  };

  const getNextNodesFromSingleExecOutput = (node: Node): Node[] => {
    const execPins = node.outputs.filter(p => p.dataType === DataType.EXEC && p.label === '');
    if (execPins.length === 0) return [];
    return execPins.flatMap(pin => findNextExecNodes(pin.id));
  };

  const startNode = nodes.find(n => n.type === NodeType.BeginPlay);
  if (!startNode) {
    return ['Error: "Begin Play" node not found.'];
  }

  const executionQueue: Node[] = [startNode];
  let executionCount = 0;
  const maxExecutions = 1000; // Infinite loop guard

  const enqueueNextNodes = (nodesToEnqueue: Node[]) => {
    for (const nextNode of nodesToEnqueue) {
      executionQueue.push(nextNode);
    }
  };

  while (executionQueue.length > 0 && executionCount < maxExecutions) {
    const currentNode = executionQueue.shift();
    if (!currentNode) continue;

    executionCount++;

    switch (currentNode.type) {
      case NodeType.BeginPlay:
        enqueueNextNodes(getNextNodesFromSingleExecOutput(currentNode));
        break;

      case NodeType.Sequence:
        for (const execOutPin of currentNode.outputs.filter(p => p.dataType === DataType.EXEC)) {
          enqueueNextNodes(findNextExecNodes(execOutPin.id));
        }
        break;

      case NodeType.PrintString: {
        const textPin = currentNode.inputs.find(p => p.dataType === DataType.STRING);
        if (textPin) {
          const value = evaluatePinValue(currentNode.id, textPin.id);
          output.push(String(value ?? ''));
        }
        enqueueNextNodes(getNextNodesFromSingleExecOutput(currentNode));
        break;
      }
      case NodeType.SetVariable: {
        const valuePin = currentNode.inputs.find(p => p.label === 'Value');
        if (valuePin) {
          const value = evaluatePinValue(currentNode.id, valuePin.id);
          variables[currentNode.properties.name] = value;
        }
        enqueueNextNodes(getNextNodesFromSingleExecOutput(currentNode));
        break;
      }
      case NodeType.ClearVariable: {
        const varName = currentNode.properties.name;
        if (varName) {
          delete variables[varName];
        }
        enqueueNextNodes(getNextNodesFromSingleExecOutput(currentNode));
        break;
      }
      case NodeType.Branch: {
        const conditionPin = currentNode.inputs.find(p => p.dataType === DataType.BOOLEAN);
        const condition = conditionPin ? !!evaluatePinValue(currentNode.id, conditionPin.id) : false;
        const outPinLabel = condition ? 'True' : 'False';
        const matchingOutputs = currentNode.outputs.filter(
          p => p.dataType === DataType.EXEC && p.label === outPinLabel
        );
        for (const execOutPin of matchingOutputs) {
          enqueueNextNodes(findNextExecNodes(execOutPin.id));
        }
        break;
      }
      default:
        enqueueNextNodes(getNextNodesFromSingleExecOutput(currentNode));
        break;
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
