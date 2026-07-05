import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { calculateMagneticForce, calculateRequiredForce } from '../lib/physicsAndAI';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ForceChartProps {
  massKg: number;
  currentDistanceMm: number;
  themeColor: string;
}

export default function ForceChart({ massKg, currentDistanceMm, themeColor }: ForceChartProps) {
  const targetForce = calculateRequiredForce(massKg);

  const data = useMemo(() => {
    const distances = [];
    const magneticForces = [];
    
    // Generate data points from 10mm to 100mm
    for (let d = 10; d <= 100; d += 2) {
      distances.push(d);
      magneticForces.push(calculateMagneticForce(d));
    }

    return {
      labels: distances,
      datasets: [
        {
          label: 'القوة المغناطيسية (F_m)',
          data: magneticForces,
          borderColor: themeColor,
          backgroundColor: 'transparent',
          tension: 0.4,
        },
        {
          label: `القوة المطلوبة للرفع (${targetForce.toFixed(0)} نيوتن)`,
          data: distances.map(() => targetForce),
          borderColor: 'rgba(239, 68, 68, 0.8)', // Red
          borderDash: [5, 5],
          pointRadius: 0,
        }
      ],
    };
  }, [massKg, targetForce, themeColor]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#e2e8f0',
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            font: { family: 'Cairo' },
            color: '#e2e8f0'
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        title: {
            display: true,
            text: 'القوة (نيوتن)',
            font: { family: 'Cairo' },
            color: '#94a3b8'
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        title: {
            display: true,
            text: 'المسافة (ملم)',
            font: { family: 'Cairo' },
            color: '#94a3b8'
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="w-full h-[300px] relative">
        <Line options={options} data={data} />
    </div>
  );
}

