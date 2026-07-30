import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Card from '../components/ui/Card';

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface ProductDistributionPieChartProps {
  data: PieChartData[];
  loading?: boolean;
}

const ProductDistributionPieChart: React.FC<ProductDistributionPieChartProps> = ({ data, loading = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 40, left: 30 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left + width / 2},${margin.top + height / 2})`);

    const colorScale = d3.scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']);

    const pie = d3.pie<PieChartData>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(0)
      .outerRadius(radius * 1.1);

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(17, 24, 39, 0.95)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
      .style('z-index', '1000')
      .style('pointer-events', 'none');

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d) => colorScale(d.data.label) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover as any)
          .attr('cursor', 'pointer');
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((d.data.value / total) * 100).toFixed(1);
        
        tooltip
          .style('opacity', 1)
          .html(
            `<div style="margin-bottom: 4px;"><strong>${d.data.label}</strong></div>
            <div style="color: #93c5fd;">Value: ${d.data.value.toLocaleString()}</div>
            <div style="color: #93c5fd;">Percentage: ${percentage}%</div>`
          )
          .style('left', `${_event.pageX + 10}px`)
          .style('top', `${_event.pageY - 10}px`);
      })
      .on('mouseout', function (_event, _d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc as any)
          .attr('cursor', 'default');
        tooltip.style('opacity', 0);
      })
      .transition()
      .duration(750)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t) as any) || '';
        };
      });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + margin.left + 10},${margin.top})`);

    const legendItemSize = 20;
    const legendSpacing = 5;

    data.forEach((d, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0,${i * (legendItemSize + legendSpacing)})`);

      legendItem.append('rect')
        .attr('width', legendItemSize)
        .attr('height', legendItemSize)
        .attr('fill', colorScale(d.label) as string)
        .attr('rx', 4);

      legendItem.append('text')
        .attr('x', legendItemSize + legendSpacing)
        .attr('y', legendItemSize / 2)
        .attr('dy', '.35em')
        .style('font-size', '11px')
        .style('fill', '#374151')
        .text(d.label);
    });
  }, [data, loading]);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Product Distribution" subtitle="Distribution by category or metric">
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} style={{ width: '100%', height: '400px' }}></svg>
      </div>
    </Card>
  );
};

export default ProductDistributionPieChart;
