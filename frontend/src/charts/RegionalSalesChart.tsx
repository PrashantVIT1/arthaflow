import React, { useEffect, useRef } from 'react';

import * as d3 from 'd3';

import { RegionalSales } from '../services/api';

import Card from '../components/ui/Card';



interface RegionalSalesChartProps {

  data: RegionalSales[];

  loading?: boolean;

}



const RegionalSalesChart: React.FC<RegionalSalesChartProps> = ({ data, loading = false }) => {

  const svgRef = useRef<SVGSVGElement>(null);



  useEffect(() => {

    if (!data || data.length === 0 || loading) return;



    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();



    const margin = { top: 30, right: 20, bottom: 40, left: 80 };

    const fixedWidth = 800;
    const fixedHeight = 400;

    const width = fixedWidth - margin.left - margin.right;
    const height = fixedHeight - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${fixedWidth} ${fixedHeight}`)
      .attr('preserveAspectRatio', 'none')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);



    // Horizontal bar chart: swap x and y scales

    const y = d3

      .scaleBand()

      .domain(data.map((d) => d.region))

      .range([0, height])

      .padding(0.3);



    const x = d3

      .scaleLinear()

      .domain([0, d3.max(data, (d) => d.revenue) || 0])

      .nice()

      .range([0, width]);



    g.append('g')

      .call(d3.axisBottom(x).tickFormat((d) => `$${(Number(d) / 1000).toFixed(0)}k`))

      .selectAll('text')

      .style('font-size', '11px')

      .style('fill', '#6b7280');



    g.append('g')

      .call(d3.axisLeft(y))

      .selectAll('text')

      .style('font-size', '11px')

      .style('fill', '#6b7280');



    g.append('text')

      .attr('y', -100)

      .attr('x', width / 2)

      .attr('text-anchor', 'middle')

      .style('font-size', '12px')

      .style('fill', '#374151')

      .style('font-weight', '500')

      .text('Revenue ($)');



    g.append('text')

      .attr('transform', 'rotate(-90)')

      .attr('y', -100)

      .attr('x', -height / 2)

      .attr('text-anchor', 'middle')

      .style('font-size', '12px')

      .style('fill', '#374151')

      .style('font-weight', '500')

      .text('Region');



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



    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];



    g.selectAll('.bar')

      .data(data)

      .enter()

      .append('rect')

      .attr('class', 'bar')

      .attr('y', (d) => y(d.region) || 0)

      .attr('x', 0)

      .attr('height', y.bandwidth())

      .attr('width', 0)

      .attr('fill', (_d, i) => colors[i % colors.length])

      .on('mouseover', function (event, d) {

        d3.select(this).attr('opacity', 0.8).attr('cursor', 'pointer');

        tooltip

          .style('opacity', 1)

          .html(

            `<div style="margin-bottom: 4px;"><strong>${d.region}</strong></div>

            <div style="color: #93c5fd;">Revenue: $${d.revenue.toLocaleString()}</div>

            <div style="color: #93c5fd;">Orders: ${d.orders.toLocaleString()}</div>

            <div style="color: #93c5fd;">Profit: $${d.profit.toLocaleString()}</div>`

          )

          .style('left', `${event.pageX + 10}px`)

          .style('top', `${event.pageY - 10}px`);

      })

      .on('mouseout', function () {

        d3.select(this).attr('opacity', 1).attr('cursor', 'default');

        tooltip.style('opacity', 0);

      })

      .transition()

      .duration(750)

      .attr('x', 0)

      .attr('width', (d) => x(d.revenue));

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

  if (!data || data.length === 0) {
    return (
      <Card title="Sales by Region" subtitle="Revenue breakdown by geographic region">
        <div className="w-full" style={{ height: '400px' }}>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No data available</p>
          </div>
        </div>
      </Card>
    );
  }



  return (
    <Card title="Sales by Region" subtitle="Revenue breakdown by geographic region">
      <div className="w-full" style={{ height: '400px' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      </div>
    </Card>
  );

};



export default RegionalSalesChart;

