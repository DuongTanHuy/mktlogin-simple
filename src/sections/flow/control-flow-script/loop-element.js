export function handleLoopElement(engine, block, level, getLetterFromRank) {
  level += 1;
  const { type, element_selector, max_loop, reverse_order } = block.dataFields;

  const selectorMethod =
    type === 'css_selector' ? 'getElementsBySelector' : 'getElementsByXpath';

  engine.setScript(
    `\n  const listEl = await rpa.${selectorMethod}(${JSON.stringify(element_selector)});`
  );

  const loopVar = getLetterFromRank(level);

  if (reverse_order) {
    engine.setScript(
      `\n  for (let ${loopVar} = ${
        max_loop ? `Math.min(${max_loop}, listEl.length)` : 'listEl.length'
      } - 1; ${loopVar} >= 0; ${loopVar}--) {`
    );
  } else {
    engine.setScript(
      `\n  for (let ${loopVar} = 1; ${loopVar} < ${
        max_loop ? `Math.min(${max_loop}, listEl.length)` : 'listEl.length'
      }; ${loopVar}++) {`
    );
  }

  return level;
}
