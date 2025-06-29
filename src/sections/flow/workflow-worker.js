import { cloneDeep } from 'lodash';
import {
  extractBracedValues,
  generateCondition,
  generateLogicScript,
} from 'src/utils/handle-bar-support';
import { handleLoopElement } from './control-flow-script/loop-element';
import { handleLoopBreak } from './control-flow-script/loop-break';
import { handleLoopData } from './control-flow-script/loop-data';
import {
  cleanedJSCode,
  generateScriptLogVariable,
  replaceObjectValuesWithKeys,
} from '../../utils/rpa';

class WorkflowWorker {
  constructor(id, engine) {
    this.id = id;
    this.engine = engine;
    this.level = 0;
    this.breakNode = null;
    this.listBreakId = {};
    this.listIndexLoop = {};
    this.listErrorNode = [];
    this.stop = false;
    this.hasBreakpoint = false;
    this.currentLoopId = [];
    this.currentIfId = [];
    this.listTryCatchId = [];
  }

  async init({ blockId }) {
    const block = this.engine.blocks[blockId];
    this.executeBlock(block);

    if (this?.engine?.fallnextNode) {
      const fallnextNode = this.engine.blocks[this.engine.fallnextNode];
      this.executeBlock(fallnextNode);
    }
  }

  getBlockConnections(blockId, outputIndex = 1) {
    const connections = this.engine.connectionsMap[blockId];

    if (!connections) return null;

    return [...connections.values()];
  }

  // eslint-disable-next-line class-methods-use-this
  getLetterFromRank(rank) {
    return String.fromCharCode(64 + rank);
  }

  isValidEndLoop(path, endLoopId) {
    return path.some((nodeId) =>
      this.engine.workflow.drawflow.nodes.find(
        (node) => node.id === nodeId && ['lap_phan_tu', 'lap_du_lieu'].includes(node?.data?.alias)
      )
    );
  }

  addBreakpoint(isBreakpoint, nodeId) {
    if (!this.engine.debugMode) return;

    if (this.hasBreakpoint || this.level !== 0) {
      this.engine.setScript(`\n await checkpoint("nextStep", ${nodeId});`);
    }

    if (isBreakpoint) {
      this.engine.setScript(`\n await checkpoint("breakpoint", ${nodeId});`);
      this.hasBreakpoint = true;
    }
  }

  traverseAndCheck(nodeId, path = []) {
    path.push(nodeId);

    const children = this.engine.workflow.drawflow.edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target);

    // eslint-disable-next-line no-restricted-syntax
    for (const childId of children) {
      const childNode = this.engine.workflow.drawflow.nodes.find((node) => node.id === childId);

      if (childNode.type === 'diem_cuoi_vong_lap') {
        if (!this.isValidEndLoop(path, childId)) {
          this.listErrorNode.push(childId);
        }
      } else {
        this.traverseAndCheck(childId, [...path]);
      }
    }
  }

  generateHandleVariableNode(block) {
    this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);

    switch (block?.dataFields?.method) {
      case 'find':
        this.engine.setScript(
          `\n ${block?.dataFields?.variable_output} = handleVariableProxy(${
            block?.dataFields?.variable
          }, "${block?.dataFields?.variable}", "list_${
            block?.dataFields?.method
          }", [ITEM => ${this.applySyntax(generateCondition(block?.dataFields?.conditions))}]);`
        );
        break;
      case 'filter':
        // if (block?.dataFields?.method === 'find') {
        //   this.engine.setScript(
        //     `\n  ${block?.dataFields?.variable_output} = ${block?.dataFields?.variable}.find((obj) => {`
        //   );
        // } else {
        //   this.engine.setScript(
        //     `\n ${block?.dataFields?.variable_output} = ${block?.dataFields?.variable}.filter((obj) => {`
        //   );
        // }

        this.engine.setScript(
          `\n ${block?.dataFields?.variable_output} = handleVariableProxy(${
            block?.dataFields?.variable
          }, "${block?.dataFields?.variable}", "list_${
            block?.dataFields?.method
          }", [obj => ${this.applySyntax(generateCondition(block?.dataFields?.conditions))}]);`
        );

        // this.engine.setScript(`\n  });`);
        break;

      // case 'concat':
      //   this.engine.setScript(
      //     `\n  const ${block?.dataFields?.variable_output} = String(${
      //       block?.dataFields?.variable
      //     })${block?.dataFields?.listString.map((item) => `.concat('${item}')`).join('')};`
      //   );
      //   break;

      default:
        break;
    }

    this.addBreakpoint(block?.dataFields?.breakpoint, block.id);
  }

  static splitAndReplaceTemplate(
    str,
    regex = /(loop(?:\?.|\.)\w+(?:\?.|\.)?(?:loop_order|data|\w+)(?:\?.|\.)?\w*(\[\d+\])?(?:\?.\w+)*|\|\|)/g
  ) {
    const parts = str.split(regex);

    return parts.filter((part) => part && part.trim()).map((part) => part.trim());
  }

  static extractContent(str) {
    const regex = /{{(.*?)}}/;
    const match = str.match(regex);
    return match ? match[1] : null;
  }

  static formatFields(array) {
    return array.reduce((obj, item) => {
      if (item.key) obj[item.key] = item.value;
      return obj;
    }, {});
  }

  formatFieldsAndApplySyntax(array) {
    return array.reduce((obj, item) => {
      if (item.key) obj[this.applySyntax(item.key)] = this.applySyntax(item.value);
      return obj;
    }, {});
  }

  applySyntax(value) {
    const parts = WorkflowWorker.splitAndReplaceTemplate(value);
    if (parts) {
      const result = parts.map((part) => {
        const matchPattern = part.match(/(loop\.\w+\.(?:loop_order|data)(?:\.\w+(\[\d+\])?)*)/g);
        const matchExistPattern = part.match(
          /(loop\?.\w+\?.(?:loop_order|data)(?:\?.\w+(\[\d+\])?)*)/g
        );

        if (matchPattern) {
          const [, loopId, type, ...objKeys] = part.split('.');

          let res = '';

          if (type === 'loop_order') {
            res = `$\{${this.listIndexLoop[loopId]}}`;
          } else if (objKeys.length > 0) {
            res = `$\{(listEl_${this.listIndexLoop[loopId]}[${
              this.listIndexLoop[loopId]
            } - 1]).${objKeys.join('.')}}`;
          } else
            res = `$\{listEl_${this.listIndexLoop[loopId]}[${this.listIndexLoop[loopId]} - 1]}`;

          return res;
        }
        if (matchExistPattern) {
          const [, loopId, type, ...objKeys] = part.split('?.');

          let res = '';

          if (type === 'loop_order') {
            res = this.listIndexLoop[loopId];
          } else if (objKeys.length > 0) {
            res = `(listEl_${this.listIndexLoop[loopId]}[${
              this.listIndexLoop[loopId]
            } - 1])?.${objKeys.join('?.')}`;
          } else res = `listEl_${this.listIndexLoop[loopId]}[${this.listIndexLoop[loopId]} - 1]`;

          return part[0] === '!' ? `!(${res})` : res;
        }
        return part;
      });
      return result.join('').replace(/{{|}}/g, '');
    }
    return value;
  }

  formatFieldsSyntax(dataFields, aliasBlock) {
    if (aliasBlock !== 'log') {
      const keys = Object.keys(dataFields);
      keys.forEach((key) => {
        const value = dataFields[key];
        if (typeof value === 'string') {
          const parts = WorkflowWorker.splitAndReplaceTemplate(
            value,
            /({{loop\.\w+\.(?:loop_order|data)(?:\.\w+(\[\d+\])?)*}})/g
          );
          if (parts) {
            const result = parts.map((part) => {
              if (part.match(/({{loop\.\w+\.(?:loop_order|data)(?:\.\w+(\[\d+\])?)*}})/g)) {
                const content = WorkflowWorker.extractContent(part);
                if (content) {
                  const [, loopId, type, ...objKeys] = content.split('.');

                  const currentLoop = this.engine.workflow.drawflow.nodes.find(
                    (item) => item.type === 'loop' && item.dataFields.loop_id === loopId
                  );

                  if (currentLoop?.dataFields?.loop_through === 'numbers') {
                    if (type === 'loop_order') {
                      return `$\{${this.getLetterFromRank(this.level)} - ${
                        currentLoop?.dataFields?.from
                      } + 1}`;
                    }
                    if (type === 'data') {
                      return `$\{${this.getLetterFromRank(this.level)}}`;
                    }
                  } else {
                    let res = '';
                    if (type === 'loop_order') {
                      res = `$\{${this.listIndexLoop[loopId]}}`;
                    } else if (objKeys.length > 0) {
                      if (
                        aliasBlock === 'gan_bien' &&
                        value.startsWith('{{loop') &&
                        value.endsWith('}}')
                      ) {
                        res = `(listEl_${this.listIndexLoop[loopId]}[${
                          this.listIndexLoop[loopId]
                        } - 1]).${objKeys.join('.')}`;
                      } else {
                        res = `$\{(listEl_${this.listIndexLoop[loopId]}[${
                          this.listIndexLoop[loopId]
                        } - 1]).${objKeys.join('.')}}`;
                      }
                    } else {
                      // eslint-disable-next-line no-lonely-if
                      if (
                        aliasBlock === 'gan_bien' &&
                        value.startsWith('{{loop') &&
                        value.endsWith('}}')
                      ) {
                        res = `listEl_${this.listIndexLoop[loopId]}[${this.listIndexLoop[loopId]} - 1]`;
                      } else {
                        res = `$\{listEl_${this.listIndexLoop[loopId]}[${this.listIndexLoop[loopId]} - 1]}`;
                      }
                    }
                    return res;
                  }
                }
              }
              return part;
            });
            dataFields[key] = result.join('');
          }
        }
      });
    }
  }

  updateBlockDataFields(block, dataFields) {
    switch (block?.data?.alias) {
      case 'http_request':
        dataFields = {
          ...dataFields,
          headers: WorkflowWorker.formatFields(dataFields.headers),
          params: WorkflowWorker.formatFields(dataFields.params),
          ...(dataFields.content_type === 'text'
            ? { data: typeof dataFields.data === 'string' ? dataFields.data : '' }
            : {
                data:
                  typeof dataFields.data === 'string'
                    ? {}
                    : WorkflowWorker.formatFields(dataFields.data),
              }),
        };
        break;

      case 'bang_tinh':
        dataFields = {
          ...dataFields,
          data_update: this.formatFieldsAndApplySyntax(dataFields.data_update),
        };
        break;

      case 'cap_nhat_tai_nguyen':
        dataFields = {
          is_create_when_not_exists: dataFields.is_create_when_not_exists,
          platform_type: dataFields.platform_type,
          ...WorkflowWorker.formatFields(dataFields.data),
        };
        break;
      case 'chay_ma_javascript':
        dataFields = {
          ...dataFields,
          script: cleanedJSCode(dataFields.script),
        };
        break;
      case 'code': {
        const regex = /(loop\.\w+\.data)/g;
        const parts = dataFields.js_code.split(regex).filter((part) => part && part.trim());
        const result = parts.map((part) => {
          const matchPattern = part.match(/(loop\.\w+\.data)/g);

          if (matchPattern) {
            const [, loopId] = part.split('.');

            let res = '';

            res = `(listEl_${this.listIndexLoop[loopId]}[${this.listIndexLoop[loopId]} - 1])`;

            return res;
          }

          return part;
        });

        dataFields = {
          ...dataFields,
          js_code: result.join(''),
        };
        break;
      }
      case 'nhan_chuot':
      case 'nhap_van_ban':
      case 'luu_media':
      case 'du_lieu_phan_tu':
      case 'tai_tep_len':
      case 'di_chuyen_chuot':
        dataFields = {
          ...dataFields,
          selector: dataFields.selector?.replace(/^(['"`])(.*?)(\1)$/, '$2'),
        };
        break;
      case 'lay_van_ban':
      case 'cuon_chuot':
      case 'lap_du_lieu':
      case 'lap_phan_tu':
      case 'element_exists':
        dataFields = {
          ...dataFields,
          element_selector: dataFields.element_selector?.replace(/^(['"`])(.*?)(\1)$/, '$2'),
        };
        break;
      case 'chuyen_frame':
        dataFields = {
          ...dataFields,
          selector_val: dataFields.selector_val?.replace(/^(['"`])(.*?)(\1)$/, '$2'),
        };
        break;

      case 'log': {
        dataFields.message = dataFields.message.replaceAll('$', '');
        const listVar = extractBracedValues(dataFields.message);
        dataFields = {
          ...dataFields,
          args: this.engine.workflow?.variables.reduce((acc, item) => {
            if (listVar.includes(item.key)) {
              if (item.type === 'object' || item.type === 'list') {
                acc[item.key] = JSON.parse(item.jsonValue);
              } else {
                acc[item.key] = item.value;
              }
            }
            return acc;
          }, {}),
        };

        // eslint-disable-next-line consistent-return
        listVar.forEach((item) => {
          if (item.includes('loop.')) {
            // eslint-disable-next-line no-unused-vars
            const [_, loopId, type, ...objKeys] = item.split('.');
            let res = `listEl_${this.listIndexLoop[loopId]}[${this.listIndexLoop[loopId]} - 1]`;
            if (type === 'data' && objKeys) {
              objKeys.forEach((objKey) => {
                if (objKey) {
                  res += `?.${objKey}`;
                }
              });
            }
            dataFields.args[item] = res;
          }
        });
        break;
      }

      case 'facebook_api':
        dataFields = {
          ...dataFields,
          category_ids: dataFields.category_ids?.map((item) => item.category_id),
        };
        break;

      default:
        break;
    }

    return dataFields;
  }

  executeNextBlocks(connections, prevBlockData) {
    // pre check
    // eslint-disable-next-line no-restricted-syntax
    for (const connection of connections) {
      const id = typeof connection === 'string' ? connection : connection.id;

      const block = this.engine.blocks[id];

      if (!block) {
        console.error(`Block ${id} doesn't exist`);
        return;
      }
    }

    const successHandle = connections.find((connection) => connection?.sourceHandle === 'success');

    if (successHandle?.id) {
      this.executeBlock(this.engine.blocks[successHandle.id]);
    }
  }

  generateNodeScript(block, connections) {
    switch (block?.data?.alias) {
      case 'lap_co_dieu_kien':
        this.countLoop += 1;
        this.currentLoopId.unshift(
          this.currentIfId?.[0]
            ? {
                [this.currentIfId?.[0]]: block?.dataFields?.loop_id,
              }
            : block?.dataFields?.loop_id
        );

        this.engine.setScript(generateScriptLogVariable(this.engine.workflow?.variables, block.id));
        this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);
        this.engine.setScript(
          `\n  showLogRunTask("Bắt đầu vòng lặp điều kiện có ID : ${block?.dataFields?.loop_id}")`
        );
        this.engine.setScript(
          `\n while (${this.applySyntax(generateCondition(block?.dataFields?.conditions))}) {`
        );
        this.level += 1;

        this.addBreakpoint(block?.dataFields?.breakpoint, block.id);

        break;

      case 'lap_phan_tu':
        this.countLoop += 1;
        this.currentLoopId.unshift(
          this.currentIfId?.[0]
            ? {
                [this.currentIfId?.[0]]: block?.dataFields?.loop_id,
              }
            : block?.dataFields?.loop_id
        );

        this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);
        this.engine.setScript(
          `\n  showLogRunTask("Bắt đầu vòng lặp phần tử có ID : ${block?.dataFields?.loop_id}")`
        );
        this.engine.setScript(generateScriptLogVariable(this.engine.workflow?.variables, block.id));
        this.level = handleLoopElement(this.engine, block, this.level, this.getLetterFromRank);

        this.listIndexLoop = {
          ...this.listIndexLoop,
          [block?.dataFields?.loop_id]: this.getLetterFromRank(this.level),
        };

        break;

      case 'lap_du_lieu':
        this.countLoop += 1;
        this.currentLoopId.unshift(
          this.currentIfId?.[0]
            ? {
                [this.currentIfId?.[0]]: block?.dataFields?.loop_id,
              }
            : block?.dataFields?.loop_id
        );

        this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);
        this.engine.setScript(
          `\n  showLogRunTask("Bắt đầu vòng lặp dữ liệu có ID : ${block?.dataFields?.loop_id}")`
        );
        this.engine.setScript(generateScriptLogVariable(this.engine.workflow?.variables, block.id));
        this.level = handleLoopData(
          this.engine,
          block,
          this.level,
          this.getLetterFromRank,
          this.countLoop
        );
        this.engine.setScript(generateScriptLogVariable(this.engine.workflow?.variables, block.id));

        this.listIndexLoop = {
          ...this.listIndexLoop,
          [block?.dataFields?.loop_id]: this.getLetterFromRank(this.level),
        };

        break;

      case 'diem_cuoi_vong_lap':
        if (!this.listErrorNode.includes(block.id)) {
          const cond = this.currentIfId?.[0]
            ? this.currentLoopId?.[0]?.[this.currentIfId?.[0]]
            : this.currentLoopId?.[0];
          if (cond) {
            this.engine.setScript(
              generateScriptLogVariable(this.engine.workflow?.variables, block.id)
            );
            this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);
            // this.addBreakpoint(block?.dataFields?.breakpoint);

            this.level = handleLoopBreak(this.engine, this.level);
            this.engine.setScript(
              `\n  showLogRunTask("Kết thúc vòng lặp có ID : ${block?.dataFields?.loop_id}")`
            );

            this.currentLoopId.splice(0, 1);
          }
        } else {
          this.engine.setScript(
            generateScriptLogVariable(this.engine.workflow?.variables, block.id)
          );
          this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);
          this.engine.setScript(`\n  // Error: End loop ${block.id} node is not valid`);
          this.engine.setScript(`\n\``);
        }
        break;

      case 'dieu_kien': {
        this.currentIfId.unshift(block.id);
        const paths = connections?.nextBlockId?.filter(
          (connection) =>
            connection?.sourceHandle !== 'fallback' && connection?.sourceHandle !== 'fallnext'
        );
        const fallback = connections?.nextBlockId?.find(
          (connection) => connection?.sourceHandle === 'fallback'
        );
        const fallnext = connections?.nextBlockId?.find(
          (connection) => connection?.sourceHandle === 'fallnext'
        );
        this.engine.setScript(generateScriptLogVariable(this.engine.workflow?.variables, block.id));
        this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);
        this.addBreakpoint(block?.dataFields?.breakpoint, block.id);

        this.engine.setScript(`\n  showLogRunTask("Kiểm tra điều kiện")`);

        if (paths?.length === 0) {
          this.engine.setScript(`\n  try {`);
          this.engine.setScript(
            `\nif (${this.applySyntax(
              generateCondition(block?.dataFields?.conditions[0]?.conditions)
            )}) {}`
          );
        } else {
          this.engine.setScript(`\n  try {`);

          paths?.forEach((path, index) => {
            const conditionBlock = this.engine.blocks[path.id];
            if (conditionBlock?.id) {
              this.traverseAndCheck(conditionBlock.id);

              const pathData = block?.dataFields?.conditions.find(
                (item) => item.id === path.sourceHandle
              );

              this.engine.setScript(
                `\n ${index !== 0 ? 'else' : ''}  if (${this.applySyntax(
                  generateCondition(pathData?.conditions)
                )}) {`
              );
              this.executeBlock(conditionBlock);
            }
          });
        }

        if (fallback?.id) {
          this.engine.setScript(`\n  else {`);
          this.executeBlock(this.engine.blocks[fallback.id]);
        }

        this.currentIfId.splice(0, 1);

        this.engine.setScript(`\n  } catch {}`);

        if (fallnext?.id) {
          this.executeBlock(this.engine.blocks[fallnext.id]);
        }
        break;
      }

      case 'dung_vong_lap': {
        this.engine.setScript(generateScriptLogVariable(this.engine.workflow?.variables, block.id));
        this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);

        const loop_id = this.currentIfId?.[0]
          ? this.currentLoopId?.[0]?.[this.currentIfId?.[0]]
          : this.currentLoopId?.[0];

        this.engine.setScript(`\n  showLogRunTask("Dừng vòng lặp có ID : ${loop_id}")`);

        this.engine.setScript('\n  break;');
        break;
      }

      case 'tiep_tuc_vong_lap': {
        this.engine.setScript(generateScriptLogVariable(this.engine.workflow?.variables, block.id));
        this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);

        const loop_id = this.currentIfId?.[0]
          ? this.currentLoopId?.[0]?.[this.currentIfId?.[0]]
          : this.currentLoopId?.[0];

        this.engine.setScript(`\n  showLogRunTask("Tiếp tục vòng lặp có ID : ${loop_id}")`);

        this.engine.setScript('\n  continue;');
        break;
      }

      default:
        if (block?.id !== 'start_node') {
          if (
            block?.data?.alias === 'xu_ly_bien' &&
            block?.dataFields?.method !== 'concat' &&
            ['find', 'filter'].includes(block?.dataFields?.method)
          ) {
            this.engine.setScript(
              generateScriptLogVariable(this.engine.workflow?.variables, block.id)
            );
            this.generateHandleVariableNode(block);
          } else {
            let dataFields = cloneDeep(block.dataFields);

            if (this.level > 0) {
              this.formatFieldsSyntax(dataFields, block?.data?.alias);
            }

            dataFields = this.updateBlockDataFields(block, dataFields);

            this.engine.setScript(
              generateScriptLogVariable(this.engine.workflow?.variables, block.id)
            );
            this.engine.setScript(`\n  await new Promise(resolve => setTimeout(resolve, 100));`);

            if (
              block?.data?.alias === 'gan_bien' &&
              dataFields?.value_two &&
              !dataFields.value_two.includes('listEl_')
            ) {
              if (!dataFields.value_two.includes('$')) {
                dataFields.value_two = `"${dataFields.value_two}"`;
              } else {
                dataFields.value_two = `${dataFields.value_two}`;
              }
            }
            let xxx = generateLogicScript(block.data?.script_template, dataFields);

            if (block?.data?.alias === 'log') {
              xxx = replaceObjectValuesWithKeys(xxx);
            }

            if (this.engine.nodeStart === block.id) {
              this.engine.skipNode = false;
            }

            if (this.engine.skipNode && this.level > 0) {
              this.engine.setScript(`\n if(${this.getLetterFromRank(this.level)} > 1){`);
            }
            this.engine.setScript(`\n  ${xxx}`);
            if (this.engine.skipNode && this.level > 0) {
              this.engine.setScript('\n  }');
            }

            this.addBreakpoint(block?.dataFields?.breakpoint, block.id);
          }
        }
        break;
    }
  }

  async executeBlock(block) {
    try {
      // console.log('block', block);
      const result = {
        data: block?.dataFields,
        nextBlockId: this.getBlockConnections(block?.id),
      };
      // console.log('result', result);
      // console.log('break', this.breakNode);
      // console.log('currentIfId', this.currentIfId);

      const successHandle = result?.nextBlockId?.find(
        (connection) => connection?.sourceHandle === 'success'
      );
      const errorHandle = result?.nextBlockId?.find(
        (connection) => connection?.sourceHandle === 'error'
      );

      if (errorHandle?.id) {
        this.listTryCatchId.push(errorHandle.id);
        if (['lap_phan_tu', 'lap_du_lieu'].includes(block?.data?.alias)) {
          this.listBreakId = {
            ...this.listBreakId,
            [block?.dataFields?.loop_id]: true,
          };
          this.engine.setScript('\n  try {');
          this.generateNodeScript(block);
          if (successHandle?.id) {
            this.executeBlock(this.engine.blocks[successHandle.id]);
          } else {
            this.engine.setScript('\n  }');
          }
          this.engine.setScript('\n  } catch (error) {');

          this.executeBlock(this.engine.blocks[errorHandle.id]);
        } else {
          this.engine.setScript('\n  try {');

          this.generateNodeScript(block);

          this.engine.setScript('\n  } catch (error) {');

          this.executeBlock(this.engine.blocks[errorHandle.id]);

          if (successHandle?.id) {
            this.executeBlock(this.engine.blocks[successHandle.id]);
          } else {
            this.engine.setScript('\n  }');

            if (this.listTryCatchId.length === 0) {
              if (this.currentIfId?.[0]) {
                if (this.currentLoopId.length > 0) {
                  const listIndexLoop = [];
                  this.currentLoopId.forEach((loopId, index) => {
                    if (loopId[this.currentIfId?.[0]]) {
                      listIndexLoop.unshift(index);
                      this.engine.setScript(
                        `\n  await new Promise(resolve => setTimeout(resolve, 100));`
                      );
                      this.engine.setScript(
                        `\n  showLogRunTask("Kết thúc vòng lặp điều kiện có ID : ${
                          loopId[this.currentIfId?.[0]]
                        }")`
                      );
                      this.engine.setScript('\n  }');
                    }
                  });

                  listIndexLoop.forEach((index) => {
                    this.currentLoopId.splice(index, 1);
                  });
                }
              } else if (this.currentLoopId.length > 0) {
                this.currentLoopId.forEach((loopId) => {
                  this.engine.setScript(
                    `\n  await new Promise(resolve => setTimeout(resolve, 100));`
                  );
                  this.engine.setScript(
                    `\n  showLogRunTask("Kết thúc vòng lặp có ID : ${loopId}")`
                  );
                  this.engine.setScript('\n  }');
                });
                this.currentLoopId = [];
              }
            }
          }
        }
      } else {
        this.generateNodeScript(block, result);

        const fallnext = result?.nextBlockId?.find(
          (connection) => connection?.sourceHandle === 'fallnext'
        );

        if (block?.data?.alias !== 'dieu_kien' || !fallnext) {
          if (
            block?.data?.alias === 'diem_cuoi_vong_lap' &&
            this.listBreakId[block?.dataFields?.loop_id]
          ) {
            this.listBreakId = {
              ...this.listBreakId,
              [block?.dataFields?.loop_id]: false,
            };
            if (successHandle?.id) {
              this.breakNode = this.engine.blocks[successHandle?.id];
            } else {
              this.stop = true;
            }
          } else if (successHandle?.id) {
            this.executeBlock(this.engine.blocks[successHandle.id]);
          } else {
            if (this.listTryCatchId.length === 0) {
              if (this.currentIfId?.[0]) {
                if (this.currentLoopId.length > 0) {
                  const listIndexLoop = [];
                  this.currentLoopId.forEach((loopId, index) => {
                    if (loopId[this.currentIfId?.[0]]) {
                      listIndexLoop.unshift(index);
                      this.engine.setScript(
                        `\n  await new Promise(resolve => setTimeout(resolve, 100));`
                      );
                      this.engine.setScript(
                        `\n  showLogRunTask("Kết thúc vòng lặp điều kiện có ID : ${
                          loopId[this.currentIfId?.[0]]
                        }")`
                      );
                      this.engine.setScript('\n  }');
                    }
                  });

                  listIndexLoop.forEach((index) => {
                    this.currentLoopId.splice(index, 1);
                  });
                }
              } else if (this.currentLoopId.length > 0) {
                this.currentLoopId.forEach((loopId) => {
                  this.engine.setScript(
                    `\n  await new Promise(resolve => setTimeout(resolve, 100));`
                  );
                  this.engine.setScript(
                    `\n  showLogRunTask("Kết thúc vòng lặp có ID : ${loopId}")`
                  );
                  this.engine.setScript('\n  }');
                });
                this.currentLoopId = [];
              }
            }

            if (this.listTryCatchId.length > 0) {
              this.engine.setScript('\n  throw Error("WORKFLOW_STOPPED");');
              this.listTryCatchId.shift();
            }
            this.engine.setScript('\n  }');
            // console.log('stop', this.engine.script);

            if (this.breakNode) {
              const tmp = this.breakNode;
              this.breakNode = null;
              this.executeBlock(tmp);
            } else if (this.stop) {
              this.stop = false;
              this.engine.setScript('\n  }');
            }
          }
        }
      }
    } catch (error) {
      console.error('error', error);
    }
  }
}

export default WorkflowWorker;
