import React, { useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';

import { MonthlySales } from '../services/api';

import Card from '../components/ui/Card';



interface MonthlySalesChartProps {

  data: MonthlySales[];

  loading?: boolean;

}



const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data, loading = false }) => {

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



    const margin = dimensions.width < 400 
      ? { top: 20, right: 10, bottom: 40, left: 35 }
      : { top: 30, right: 20, bottom: 60, left: 50 };

    const width = dimensions.width - margin.left - margin.right;

    const height = dimensions.height - margin.top - margin.bottom;



    const g = svg

      .attr('width', width + margin.left + margin.right)

      .attr('height', height + margin.top + margin.bottom)

      .append('g')

      .attr('transform', `translate(${margin.left},${margin.top})`);



    const x = d3

      .scaleBand()

      .domain(data.map((d) => d.month_name))

      .range([0, width])

      .padding(0.3);



    const y = d3

      .scaleLinear()

      .domain([0, d3.max(data, (d) => d.revenue) || 0])

      .nice()

      .range([height, 0]);



    g.append('g')

      .attr('transform', `translate(0,${height})`)

      .call(d3.axisBottom(x))

      .selectAll('text')

      .attr('transform', 'rotate(-45)')

      .style('text-anchor', 'end')

      .style('font-size', '11px')

      .style('fill', '#6b7280');



    g.append('g')

      .call(d3.axisLeft(y).tickFormat((d) => `$${(Number(d) / 1000).toFixed(0)}k`))

      .selectAll('text')

      .style('font-size', '11px')

      .style('fill', '#6b7280');



    g.append('text')

      .attr('transform', 'rotate(-90)')

      .attr('y', -60)

      .attr('x', -height / 2)

      .attr('text-anchor', 'middle')

      .style('font-size', '12px')

      .style('fill', '#374151')

      .style('font-weight', '500')

      .text('Revenue ($)');



    g.append('text')

      .attr('x', width / 2)

      .attr('y', height + 70)

      .attr('text-anchor', 'middle')

      .style('font-size', '12px')

      .style('fill', '#374151')

      .style('font-weight', '500')

      .text('Month');



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



    // Create line generator

    const line = d3.line<{ month_name: string; revenue: number }>()

      .x((d) => (x(d.month_name) || 0) + x.bandwidth() / 2)

      .y((d) => y(d.revenue))

      .curve(d3.curveMonotoneX);



    // Add the line path

    const path = g.append('path')

      .datum(data)

      .attr('fill', 'none')

      .attr('stroke', '#3b82f6')

      .attr('stroke-width', 3)

      .attr('d', line);



    // Animate the line

    const totalLength = path.node()?.getTotalLength() || 0;

    path

      .attr('stroke-dasharray', totalLength)

      .attr('stroke-dashoffset', totalLength)

      .transition()

      .duration(1000)

      .attr('stroke-dashoffset', 0);



    // Add dots

    g.selectAll('.dot')

      .data(data)

      .enter()

      .append('circle')

      .attr('class', 'dot')

      .attr('cx', (d) => (x(d.month_name) || 0) + x.bandwidth() / 2)

      .attr('cy', (d) => y(d.revenue))

      .attr('r', 0)

      .attr('fill', '#3b82f6')

      .attr('stroke', '#fff')

      .attr('stroke-width', 2)

      .on('mouseover', function (event, d) {

        d3.select(this)

          .attr('r', 8)

          .attr('fill', '#1d4ed8')

          .attr('cursor', 'pointer');

        tooltip

          .style('opacity', 1)

          .html(

            `<div style="margin-bottom: 4px;"><strong>${d.month_name} ${d.year}</strong></div>

            <div style="color: #93c5fd;">Revenue: $${d.revenue.toLocaleString()}</div>

            <div style="color: #93c5fd;">Orders: ${d.orders.toLocaleString()}</div>

            <div style="color: #93c5fd;">Profit: $${d.profit.toLocaleString()}</div>`

          )

          .style('left', `${event.pageX + 10}px`)

          .style('top', `${event.pageY - 10}px`);

      })

      .on('mouseout', function () {

        d3.select(this)

          .attr('r', 5)

          .attr('fill', '#3b82f6')

          .attr('cursor', 'default');

        tooltip.style('opacity', 0);

      })

      .transition()

      .delay(1000)

      .duration(500)

      .attr('r', 5);

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
    <Card title="Monthly Revenue Trend" subtitle="Revenue over time">
      <div className="w-full overflow-x-auto overflow-y-hidden" style={{ height: '400px' }}>
        <div ref={containerRef} style={{ minWidth: '600px', height: '100%' }}>
          <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
        </div>
      </div>
    </Card>
  );
};

export default MonthlySalesChart;

