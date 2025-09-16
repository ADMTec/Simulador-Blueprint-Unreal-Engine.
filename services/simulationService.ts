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

  const valueCache = new Map<string, any>();
  let cacheVersion = 0;
  const invalidateCache = () => {
    cacheVersion += 1;
    valueCache.clear();
  };
  type ForLoopState = {
    next: number;
    end: number;
    step: number;
    direction: 1 | -1;
    iterations: number;
    current: number | null;
  };
  const forLoopStates = new Map<string, ForLoopState>();
  const whileIterationCounts = new Map<string, number>();
  const LOOP_ITERATION_LIMIT = 1000;

  const getInputValue = (node: Node, pinLabel: string): any => {
    const pin = node.inputs.find(p => p.label === pinLabel);
    if (!pin) return undefined;
    return evaluatePinValue(node.id, pin.id);
  };

  const describeValue = (value: unknown): string => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
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

  const getNumericInputs = (node: Node, mode: 'integer' | 'float'): { a: number; b: number } | null => {
    const pinA = node.inputs.find(p => p.label === 'A');
    const pinB = node.inputs.find(p => p.label === 'B');
    if (!pinA || !pinB) return null;

    const rawA = evaluatePinValue(node.id, pinA.id);
    const rawB = evaluatePinValue(node.id, pinB.id);
    const parsedA = parseNumericInput(rawA);
    const parsedB = parseNumericInput(rawB);

    if (parsedA === null || parsedB === null) {
      output.push(
        `Warning: ${node.title} expected numeric inputs but received ${describeValue(rawA)} and ${describeValue(rawB)}.`
      );
      return null;
    }

    if (mode === 'integer') {
      return { a: Math.trunc(parsedA), b: Math.trunc(parsedB) };
    }

    return { a: parsedA, b: parsedB };
  };
  
  const evaluatePinValue = (nodeId: string, pinId: string): any => {
    const wire = wiresToPin.get(pinId);
    const node = nodeMap.get(nodeId);

    if (wire) {
      const cacheKey = `${cacheVersion}:${wire.fromNodeId}:${wire.fromPinId}`;
      if (valueCache.has(cacheKey)) {
        return valueCache.get(cacheKey);
      }

      const fromNode = nodeMap.get(wire.fromNodeId);
      if (!fromNode) return undefined;

      let shouldCache = true;
      let result: any;

      switch (fromNode.type) {
        case NodeType.GetVariable:
          shouldCache = false;
          result = variables[fromNode.properties.name];
          break;
        case NodeType.AddInteger:
        case NodeType.SubtractInteger:
        case NodeType.MultiplyInteger:
        case NodeType.DivideInteger:
        case NodeType.GreaterThanInteger:
        case NodeType.LessThanInteger:
        case NodeType.EqualsInteger: {
          const numericInputs = getNumericInputs(fromNode, 'integer');
          const expectsBooleanResult =
            fromNode.type === NodeType.GreaterThanInteger ||
            fromNode.type === NodeType.LessThanInteger ||
            fromNode.type === NodeType.EqualsInteger;

          if (!numericInputs) {
            result = expectsBooleanResult ? false : 0;
            break;
          }

          const { a, b } = numericInputs;

          switch (fromNode.type) {
            case NodeType.AddInteger:
              result = a + b;
              break;
            case NodeType.SubtractInteger:
              result = a - b;
              break;
            case NodeType.MultiplyInteger:
              result = a * b;
              break;
            case NodeType.DivideInteger:
              if (b === 0) {
                output.push(`Warning: ${fromNode.title} attempted to divide by zero. Returning 0.`);
                result = 0;
                break;
              }
              result = Math.trunc(a / b);
              break;
            case NodeType.GreaterThanInteger:
              result = a > b;
              break;
            case NodeType.LessThanInteger:
              result = a < b;
              break;
            case NodeType.EqualsInteger:
              result = a === b;
              break;
          }
          break;
        }
        case NodeType.AddFloat:
        case NodeType.SubtractFloat:
        case NodeType.MultiplyFloat:
        case NodeType.DivideFloat:
        case NodeType.GreaterThanFloat:
        case NodeType.LessThanFloat:
        case NodeType.EqualsFloat: {
          const numericInputs = getNumericInputs(fromNode, 'float');
          const expectsBooleanResult =
            fromNode.type === NodeType.GreaterThanFloat ||
            fromNode.type === NodeType.LessThanFloat ||
            fromNode.type === NodeType.EqualsFloat;

          if (!numericInputs) {
            result = expectsBooleanResult ? false : 0;
            break;
          }

          const { a, b } = numericInputs;

          switch (fromNode.type) {
            case NodeType.AddFloat:
              result = a + b;
              break;
            case NodeType.SubtractFloat:
              result = a - b;
              break;
            case NodeType.MultiplyFloat:
              result = a * b;
              break;
            case NodeType.DivideFloat:
              if (b === 0) {
                output.push(`Warning: ${fromNode.title} attempted to divide by zero. Returning 0.`);
                result = 0;
                break;
              }
              result = a / b;
              break;
            case NodeType.GreaterThanFloat:
              result = a > b;
              break;
            case NodeType.LessThanFloat:
              result = a < b;
              break;
            case NodeType.EqualsFloat:
              result = a === b;
              break;
          }
          break;
        }
        case NodeType.StringLiteral:
        case NodeType.IntegerLiteral:
        case NodeType.FloatLiteral:
        case NodeType.BooleanLiteral:
          result = fromNode.properties.value;
          break;
        case NodeType.ForLoop: {
          const state = forLoopStates.get(fromNode.id);
          shouldCache = false;
          result = state?.current ?? 0;
          break;
        }
        default: {
          const outputPin = fromNode.outputs.find(p => p.id === wire.fromPinId);
          if (outputPin) {
            shouldCache = false;
            result = evaluatePinValue(fromNode.id, outputPin.id);
          } else {
            shouldCache = false;
            result = undefined;
          }
          break;
        }
      }

      if (shouldCache) {
        valueCache.set(cacheKey, result);
      }

      return result;
    }

    if (node?.type === NodeType.PrintString) {
      return node.properties.text;
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

  const findExecNodesByLabel = (node: Node, label: string): Node[] => {
    const execPins = node.outputs.filter(p => p.dataType === DataType.EXEC && p.label === label);
    return execPins.flatMap(pin => findNextExecNodes(pin.id));
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
          invalidateCache();
        }
        enqueueNextNodes(getNextNodesFromSingleExecOutput(currentNode));
        break;
      }
      case NodeType.ForLoop: {
        let state = forLoopStates.get(currentNode.id);
        if (!state) {
          const rawStart = getInputValue(currentNode, 'Start');
          const rawEnd = getInputValue(currentNode, 'End');
          const rawStep = getInputValue(currentNode, 'Step');

          const parsedStart = parseNumericInput(rawStart);
          const parsedEnd = parseNumericInput(rawEnd);
          let parsedStep = parseNumericInput(rawStep);

          if (parsedStart === null || parsedEnd === null) {
            output.push(
              `Warning: ${currentNode.title} requires numeric Start and End inputs.`
            );
            enqueueNextNodes(findExecNodesByLabel(currentNode, 'Completed'));
            break;
          }

          let start = Math.trunc(parsedStart);
          const end = Math.trunc(parsedEnd);
          let step = parsedStep === null ? 0 : Math.trunc(parsedStep);

          if (step === 0) {
            const defaultStep = start <= end ? 1 : -1;
            output.push(
              `Warning: ${currentNode.title} received an invalid Step value (${describeValue(rawStep)}). Using ${defaultStep} instead.`
            );
            step = defaultStep;
          }

          const direction: 1 | -1 = step >= 0 ? 1 : -1;
          step = direction === 1 ? Math.abs(step) : -Math.abs(step);

          if ((direction === 1 && start > end) || (direction === -1 && start < end)) {
            enqueueNextNodes(findExecNodesByLabel(currentNode, 'Completed'));
            break;
          }

          state = {
            next: start,
            end,
            step,
            direction,
            iterations: 0,
            current: null,
          };
          forLoopStates.set(currentNode.id, state);
        }

        if (!state) {
          break;
        }

        if (
          (state.direction === 1 && state.next > state.end) ||
          (state.direction === -1 && state.next < state.end)
        ) {
          forLoopStates.delete(currentNode.id);
          enqueueNextNodes(findExecNodesByLabel(currentNode, 'Completed'));
          break;
        }

        if (state.iterations >= LOOP_ITERATION_LIMIT) {
          output.push(`Error: ${currentNode.title} exceeded ${LOOP_ITERATION_LIMIT} iterations. Aborting loop.`);
          forLoopStates.delete(currentNode.id);
          enqueueNextNodes(findExecNodesByLabel(currentNode, 'Completed'));
          break;
        }

        state.current = state.next;
        state.next += state.step;
        state.iterations += 1;
        invalidateCache();

        enqueueNextNodes(findExecNodesByLabel(currentNode, 'Loop Body'));
        executionQueue.push(currentNode);
        break;
      }
      case NodeType.While: {
        const conditionPin = currentNode.inputs.find(p => p.label === 'Condition');
        const condition = conditionPin ? !!evaluatePinValue(currentNode.id, conditionPin.id) : false;

        if (condition) {
          const iterations = whileIterationCounts.get(currentNode.id) ?? 0;
          if (iterations >= LOOP_ITERATION_LIMIT) {
            output.push(`Error: ${currentNode.title} exceeded ${LOOP_ITERATION_LIMIT} iterations. Aborting loop.`);
            whileIterationCounts.delete(currentNode.id);
            enqueueNextNodes(findExecNodesByLabel(currentNode, 'Completed'));
            break;
          }

          whileIterationCounts.set(currentNode.id, iterations + 1);
          enqueueNextNodes(findExecNodesByLabel(currentNode, 'Loop Body'));
          executionQueue.push(currentNode);
        } else {
          whileIterationCounts.delete(currentNode.id);
          enqueueNextNodes(findExecNodesByLabel(currentNode, 'Completed'));
        }
        break;
      }
      case NodeType.ClearVariable: {
        const varName = currentNode.properties.name;
        if (varName) {
          delete variables[varName];
          invalidateCache();
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
