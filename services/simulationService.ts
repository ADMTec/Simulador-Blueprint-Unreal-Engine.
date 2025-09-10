import { Node, Wire, NodeType, Pin, DataType } from '../types';

export const executeBlueprint = (nodes: Node[], wires: Wire[]): string[] => {
  const output: string[] = [];
  const variables: Record<string, any> = {};
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const wiresToPin = new Map(wires.map(w => [w.toPinId, w]));
  
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
                const a = evaluatePinValue(fromNode.id, fromNode.inputs.find(p => p.label === 'A')!.id);
                const b = evaluatePinValue(fromNode.id, fromNode.inputs.find(p => p.label === 'B')!.id);
                return (typeof a === 'number' && typeof b === 'number') ? a + b : 0;
            case NodeType.StringLiteral:
                return fromNode.properties.value;
            case NodeType.IntegerLiteral:
                return fromNode.properties.value;
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
        // No wire connected, use node's internal properties
        if (!node) return undefined;
        switch (node.type) {
            case NodeType.PrintString:
                return node.properties.text;
        }
    }
    return undefined;
  };
  
  const findNextExecNode = (fromNode: Node, fromPinId: string): Node | undefined => {
      const wire = wires.find(w => w.fromNodeId === fromNode.id && w.fromPinId === fromPinId);
      return wire ? nodeMap.get(wire.toNodeId) : undefined;
  };

  let currentNode = nodes.find(n => n.type === NodeType.BeginPlay);
  if (!currentNode) {
    return ['Error: "Begin Play" node not found.'];
  }

  let executionCount = 0;
  const maxExecutions = 500; // Infinite loop guard

  while (currentNode && executionCount < maxExecutions) {
    executionCount++;
    let nextNode: Node | undefined = undefined;
    
    // Fix: A helper to find the next node from a single exec output pin.
    const getNextNodeFromSingleExecOutput = (node: Node): Node | undefined => {
        const execOutPin = node.outputs.find(p => p.dataType === DataType.EXEC);
        if (execOutPin) {
            const wire = wires.find(w => w.fromPinId === execOutPin.id);
            return wire ? nodeMap.get(wire.toNodeId) : undefined;
        }
        return undefined;
    };

    switch (currentNode.type) {
      case NodeType.PrintString: {
        const textPin = currentNode.inputs.find(p => p.dataType === DataType.STRING);
        if (textPin) {
          const value = evaluatePinValue(currentNode.id, textPin.id);
          output.push(String(value));
        }
        // Fix: Correctly find the next execution node.
        nextNode = getNextNodeFromSingleExecOutput(currentNode);
        break;
      }
      case NodeType.SetVariable: {
          const valuePin = currentNode.inputs.find(p => p.label === 'Value');
          if (valuePin) {
            const value = evaluatePinValue(currentNode.id, valuePin.id);
            variables[currentNode.properties.name] = value;
          }
          // Fix: Correctly find the next execution node.
          nextNode = getNextNodeFromSingleExecOutput(currentNode);
          break;
      }
      case NodeType.ClearVariable: {
          const varName = currentNode.properties.name;
          if (varName) {
            delete variables[varName];
          }
          // Fix: Correctly find the next execution node.
          nextNode = getNextNodeFromSingleExecOutput(currentNode);
          break;
      }
      case NodeType.Branch: {
          const conditionPin = currentNode.inputs.find(p => p.dataType === DataType.BOOLEAN);
          let condition = false;
          if (conditionPin) {
            condition = !!evaluatePinValue(currentNode.id, conditionPin.id);
          }
          const outPinId = condition ? currentNode.outputs.find(p => p.label === 'True')!.id : currentNode.outputs.find(p => p.label === 'False')!.id;
          const wire = wires.find(w => w.fromPinId === outPinId);
          const nextNodeId = wire ? wire.toNodeId : null;
          nextNode = nextNodeId ? nodeMap.get(nextNodeId) : undefined;
          break;
      }
      case NodeType.BeginPlay: {
        // Fix: Correctly find the next execution node.
        nextNode = getNextNodeFromSingleExecOutput(currentNode);
        break;
      }
      default:
        // A non-executable node was reached in the exec chain, stop.
        nextNode = undefined;
        break;
    }
    
    currentNode = nextNode;
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
