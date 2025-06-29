import WorkflowWorker from './workflow-worker';

const getId = () => String(Date.now());

class WorkflowEngine {
  constructor(workflow) {
    this.id = getId();
    this.script = 'async function startWorkflow() {\n';
    this.script += '  const rpa = new rpaLib.Rpa();\n';
    this.script += '  await rpa.connect($wsEndpoint);\n';
    this.script += '  const fbAPI = new fbApiLib.FbAPI(rpa);\n';
    this.workflow = workflow;
    this.workerId = 0;
    this.connectionsMap = {};
    this.blocks = {};
    this.skipNode = false;
    this.nodeStart = workflow?.triggerId ?? null;
    this.triggerBlockId = null;
    this.debugMode = workflow.debugMode;
    this.fallnextNode = null;
  }

  async init() {
    try {
      const { nodes, edges } = this.workflow.drawflow;
      if (!nodes || nodes.length === 0) {
        console.error("Workflow doesn't have blocks!");
        return;
      }

      if (this.nodeStart) {
        const targetBlockId = this.checkReverse(this.nodeStart, nodes, edges, true);
        if (targetBlockId) {
          this.triggerBlockId = targetBlockId;
          this.skipNode = true;
        } else {
          this.triggerBlockId = this.nodeStart;
        }
      }

      const triggerBlock = nodes.find((node) => node.id === (this.triggerBlockId ?? 'start_node'));

      if (!triggerBlock) {
        console.error("Workflow doesn't have a trigger block!");
        return;
      }

      this.triggerBlockId = triggerBlock.id;

      this.blocks = nodes.reduce((acc, node) => {
        acc[node.id] = node;

        return acc;
      }, {});

      this.connectionsMap = edges.reduce((acc, { source, sourceHandle, target, targetHandle }) => {
        if (!acc[source]) acc[source] = new Map();
        acc[source].set(target, {
          id: target,
          targetHandle,
          sourceHandle,
        });

        return acc;
      }, {});

      this.addWorker({ blockId: triggerBlock.id });
    } catch (error) {
      console.error(error);
    }
  }

  addWorker(detail) {
    this.workerId += 1;

    const workerId = `worker-${this.workerId}`;
    const worker = new WorkflowWorker(workerId, this);
    worker.init(detail);
  }

  setScript(script) {
    this.script += script;
  }

  // eslint-disable-next-line class-methods-use-this
  checkReverse(nodeId, listNodes, listEdges, skip = false) {
    const currentNode = listNodes.find((node) => node.id === nodeId);

    if (currentNode?.data?.alias === 'diem_cuoi_vong_lap') {
      if (skip) {
        this.setScript('\n  {');
      }
      return '';
    }

    if (listEdges.find((edge) => edge.target === nodeId && edge.sourceHandle === 'fallnext')?.id) {
      return '';
    }

    if (!skip) {
      if (currentNode?.data?.alias === 'dieu_kien') {
        const fallnextNode = listEdges.find(
          (edge) => edge.source === nodeId && edge.sourceHandle === 'fallnext'
        )?.target;

        if (fallnextNode) {
          this.setScript('\n  {');
          this.fallnextNode = fallnextNode;
        }
        return '';
      }

      if (['lap_co_dieu_kien', 'lap_phan_tu', 'lap_du_lieu'].includes(currentNode?.data?.alias)) {
        return nodeId;
      }
    }

    const parents = listEdges.filter((edge) => edge.target === nodeId);

    // eslint-disable-next-line no-restricted-syntax
    for (const child of parents) {
      const result = this.checkReverse(child?.source, listNodes, listEdges);
      if (result) {
        return result;
      }
    }

    return '';
  }
}

export default WorkflowEngine;
