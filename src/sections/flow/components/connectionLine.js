import React from 'react';
import PropTypes from 'prop-types';
import { useSettingsContext } from 'src/components/settings';

export default function CustomConnectionLine({ fromX, fromY, toX, toY, ...props }) {
  const { animatedEdge } = useSettingsContext();

  return (
    <g>
      <path
        fill="none"
        stroke="orange"
        strokeWidth={1.3}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
        style={{
          ...(!animatedEdge && {
            strokeDasharray: 'none',
          }),
        }}
      />
      <circle cx={toX} cy={toY} fill="orange" r={3} stroke="orange" strokeWidth={1.3} />
    </g>
  );
}

CustomConnectionLine.propTypes = {
  fromX: PropTypes.number,
  fromY: PropTypes.number,
  toX: PropTypes.number,
  toY: PropTypes.number,
};
