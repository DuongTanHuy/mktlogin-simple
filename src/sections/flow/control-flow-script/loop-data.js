export function handleLoopData(engine, block, level, getLetterFromRank) {
  level += 1;

  const { loop_through, from, to, variable_name, index_start, max_loop, element_selector } =
    block.dataFields;
  const loopVar = getLetterFromRank(level);

  const handleFormatValue = (value) => {
    if (typeof value === 'string') {
      return value.replace(/\${|}/g, '');
    }
    return value;
  };

  switch (loop_through) {
    case 'numbers': {
      engine.setScript(
        `\n  for (let ${loopVar} = ${handleFormatValue(from)}; ${loopVar} <= ${handleFormatValue(
          to
        )}; ${loopVar}++) {`
      );
      break;
    }

    case 'variable': {
      engine.setScript(`\n  var listEl_${loopVar} = ${variable_name};`);

      engine.setScript(
        `\n  for (let ${loopVar} = ${handleFormatValue(index_start)}; ${loopVar} <= ${
          Number(max_loop) !== 0
            ? `Math.min(${handleFormatValue(max_loop)}, listEl_${loopVar}.length)`
            : `listEl_${loopVar}.length`
        }; ${loopVar}++) {`
      );
      break;
    }

    case 'elements': {
      engine.setScript(
        `\n  var listEl_${loopVar} = await rpa.getElementsBySelector(\`${element_selector}\`);`
      );

      engine.setScript(
        `\n  for (let ${loopVar} = ${handleFormatValue(index_start)}; ${loopVar} <= ${
          max_loop
            ? `Math.min(${handleFormatValue(max_loop)}, listEl_${loopVar}.length)`
            : `listEl_${loopVar}.length`
        }; ${loopVar}++) {`
      );
      break;
    }

    default:
      break;
  }

  return level;
}
