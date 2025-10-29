'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const HealthChart = ({ 
  data, 
  type = 'line', 
  title, 
  color = '#3b82f6',
  height = 200,
  showGrid = true,
  showTooltip = true 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.offsetWidth - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Find min/max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Helper functions
    const getX = (index) => padding + (index / (data.length - 1)) * chartWidth;
    const getY = (value) => padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }
    }

    // Draw chart
    if (type === 'line') {
      // Line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = getX(index);
        const y = getY(point.value);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw points
      ctx.fillStyle = color;
      data.forEach((point, index) => {
        const x = getX(index);
        const y = getY(point.value);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

    } else if (type === 'bar') {
      // Bar chart
      const barWidth = chartWidth / data.length * 0.8;
      const barSpacing = chartWidth / data.length * 0.2;
      
      data.forEach((point, index) => {
        const x = getX(index) - barWidth / 2;
        const y = getY(point.value);
        const barHeight = chartHeight - (y - padding);
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    }

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      const x = getX(index);
      const y = height - 10;
      ctx.fillText(point.label || '', x, y);
    });

  }, [data, type, color, height, showGrid]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-surface-200">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-surface-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border border-surface-200"
    >
      <h3 className="text-lg font-semibold text-surface-900 mb-4">{title}</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: `${height}px` }}
        />
        {showTooltip && (
          <div className="absolute top-2 right-2 bg-surface-800 text-white px-2 py-1 rounded text-xs">
            Latest: {data[data.length - 1]?.value || 'N/A'}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HealthChart;
