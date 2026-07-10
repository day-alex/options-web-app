'use client';
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface PathsChartProps {
  paths: number[][];
  numSteps: number;
  spot: number;
  strike: number;
}

const COLORS = ['#5b8cff'];
const BORDER = '#2a2a30';
const MUTED = '#8b8b93';
const SURFACE = '#16161a';
const CALL = '#34d399';
const PUT = '#f87171';

const PathsChart: React.FC<PathsChartProps> = ({ paths, numSteps, spot, strike }) => {
  const data = useMemo(() => {
    const rows = [];
    for (let step = 0; step <= numSteps; step++) {
      const row: Record<string, number> = { step };
      for (let i = 0; i < paths.length; i++) {
        row[`p${i}`] = paths[i][step];
      }
      rows.push(row);
    }
    return rows;
  }, [paths, numSteps]);

  // Compute Y-axis domain from all path values
  const [yMin, yMax] = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const path of paths) {
      for (const v of path) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    // Include strike in range
    if (strike < min) min = strike;
    if (strike > max) max = strike;
    const padding = (max - min) * 0.05;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [paths, strike]);

  return (
    <div style={{ backgroundColor: SURFACE, padding: '10px', borderRadius: '8px' }}>
    <ResponsiveContainer width="100%" height={450}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
        <XAxis
          dataKey="step"
          label={{ value: 'Time Step', position: 'insideBottom', offset: -5, fill: MUTED }}
          stroke={BORDER}
          tick={{ fill: MUTED, fontSize: 11 }}
        />
        <YAxis
          domain={[yMin, yMax]}
          label={{ value: 'Price', angle: -90, position: 'insideLeft', fill: MUTED }}
          stroke={BORDER}
          tick={{ fill: MUTED, fontSize: 11 }}
        />
        <ReferenceLine
          y={strike}
          stroke={PUT}
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: `K=${strike}`, fill: PUT, position: 'right', fontSize: 12 }}
        />
        <ReferenceLine
          y={spot}
          stroke={CALL}
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: `S=${spot}`, fill: CALL, position: 'right', fontSize: 12 }}
        />
        {paths.map((_, i) => (
          <Line
            key={i}
            type="monotone"
            dataKey={`p${i}`}
            stroke={COLORS[0]}
            strokeWidth={0.7}
            strokeOpacity={0.35}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
};

export default PathsChart;
