'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MetricChart({ metrics, type, chartType = 'line' }) {
  const chartData = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return null;
    }

    // Sort by date
    const sortedMetrics = [...metrics].sort((a, b) => {
      const dateA = new Date(a.date || a.recordedAt);
      const dateB = new Date(b.date || b.recordedAt);
      return dateA - dateB;
    });

    const labels = sortedMetrics.map(metric => {
      const dateStr = metric.date || metric.recordedAt || metric.createdAt;
      if (!dateStr) return 'Unknown';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const values = sortedMetrics.map(metric => {
      if (type === 'bloodPressure') {
        // For blood pressure, use systolic value or average
        if (metric.value?.systolic) {
          return metric.value.systolic;
        }
        if (metric.systolic) {
          return metric.systolic;
        }
        // If value is object with numeric, try that
        if (metric.value?.numeric) {
          return metric.value.numeric;
        }
        return null;
      }
      
      // For other metrics, extract numeric value
      if (typeof metric.value === 'number') {
        return metric.value;
      }
      if (metric.value?.numeric !== undefined) {
        return metric.value.numeric;
      }
      
      // Try to parse string values
      if (typeof metric.value === 'string') {
        const parsed = parseFloat(metric.value);
        return isNaN(parsed) ? null : parsed;
      }
      
      return null;
    }).filter(v => v !== null && v !== undefined);

    const unit = metrics[0]?.unit || '';

    return {
      labels,
      datasets: [
        {
          label: type === 'bloodPressure' ? 'Systolic BP' : getMetricLabel(type),
          data: values,
          borderColor: getColorForType(type),
          backgroundColor: getColorForType(type, 0.1),
          fill: chartType === 'line',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        }
      ]
    };
  }, [metrics, type, chartType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: type !== 'weight' && type !== 'bloodPressure',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  if (!chartData || !chartData.datasets || chartData.datasets[0].data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No data available for chart. Add more measurements to see trends.</p>
      </div>
    );
  }

  const ChartComponent = chartType === 'bar' ? Bar : Line;

  return (
    <div className="h-64 w-full">
      <ChartComponent data={chartData} options={options} />
    </div>
  );
}

function getMetricLabel(type) {
  const labels = {
    bloodPressure: 'Blood Pressure',
    weight: 'Weight',
    glucose: 'Blood Glucose',
    heartRate: 'Heart Rate',
    temperature: 'Temperature',
  };
  return labels[type] || type;
}

function getColorForType(type, opacity = 1) {
  const colors = {
    bloodPressure: `rgba(239, 68, 68, ${opacity})`, // red
    weight: `rgba(59, 130, 246, ${opacity})`, // blue
    glucose: `rgba(249, 115, 22, ${opacity})`, // orange
    heartRate: `rgba(34, 197, 94, ${opacity})`, // green
    temperature: `rgba(250, 204, 21, ${opacity})`, // yellow
  };
  return colors[type] || `rgba(107, 114, 128, ${opacity})`;
}

