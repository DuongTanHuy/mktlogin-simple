export function handleLoopBreak(engine, level) {
  level -= 1;

  engine.setScript('\n  }');

  return level;
}
