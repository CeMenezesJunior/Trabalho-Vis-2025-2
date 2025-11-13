import * as d3 from 'd3';

export async function loadChart(data, margens = { left: 60, right: 40, top: 25, bottom: 120 }) {
    
    const svg = d3.select('svg');
    if (!svg) return;
    const svgWidth = +svg.style('width').split('px')[0];
    const svgHeight = +svg.style('height').split('px')[0];
    const innerWidth = svgWidth - margens.left - margens.right;
    const innerHeight = svgHeight - margens.top - margens.bottom;
    const g = svg.selectAll('#group').data([0]).join('g')
        .attr('id', 'group')
        .attr('transform', `translate(${margens.left}, ${margens.top})`);
    
    const parseMonth = d3.utcParse('%Y-%m');
    data.forEach(d => {
        if (d.mes && typeof d.mes === 'string') d.mes_date = parseMonth(d.mes);
        else if (d.mes instanceof Date) d.mes_date = d.mes;
        else d.mes_date = null;
    });

    const mesExtent = d3.extent(data, d => d.mes_date);
    const mapX = d3.scaleUtc().domain(mesExtent).range([0, innerWidth]);
    const maxDistance = d3.max(data, d => d.distance) || 0;
    const mapY = d3.scaleLinear().domain([0, maxDistance]).range([innerHeight, 0]).nice();

    const xAxis  = d3.axisBottom(mapX)
        .ticks(d3.timeMonth.every(3)) 
        .tickFormat(d3.utcFormat('%Y-%m'));
    g.selectAll('#axisX').data([0]).join('g')
        .attr('id', 'axisX')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'start')
        .attr('transform', 'rotate(45)')
        .attr('dx', '10px')
        .attr('dy', '-5px');

    const yAxis  = d3.axisLeft(mapY);
    g.selectAll('#axisY').data([0]).join('g')
        .attr('id', 'axisY')
        .attr('class', 'y axis')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis);

    //---- Barras
    const xBand = d3.scaleBand()
        .domain(data.filter(d => d.mes).map(d => d.mes))
        .range([0, innerWidth])
        .padding(0.05);

    const bars = g.append('g')
        .attr('class', 'bars') 
        .selectAll('rect')
        .data(data.filter(d => d.mes_date));

    bars.join('rect')
        .attr('x', d => xBand(d.mes))
        .attr('y', d => mapY(d.distance))
        .attr('height', d => mapY(0) - mapY(d.distance))
        .attr('width', xBand.bandwidth());
}

export function clearChart() {
    d3.select('#group').remove();
    d3.select('#axisX').remove();
    d3.select('#axisY').remove();
}