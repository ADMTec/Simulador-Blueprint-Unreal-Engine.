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
  }
  
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
            case NodeType.EqualsInteger:
                const a = getInputValue(fromNode, 'A', DataType.INTEGER);
                const b = getInputValue(fromNode, 'B', DataType.INTEGER);
                if (typeof a !== 'number' || typeof b !== 'number') return fromNode.type.includes('Integer') ? 0 : false;
                
                if (fromNode.type === NodeType.AddInteger) return a + b;
                if (fromNode.type === NodeType.SubtractInteger) return a - b;
                if (fromNode.type === NodeType.MultiplyInteger) return a * b;
                if (fromNode.type === NodeType.DivideInteger) return b !== 0 ? Math.floor(a / b) : 0;
                if (fromNode.type === NodeType.GreaterThanInteger) return a > b;
                if (fromNode.type === NodeType.LessThanInteger) return a < b;
                if (fromNode.type === NodeType.EqualsInteger) return a === b;
                return 0;

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
