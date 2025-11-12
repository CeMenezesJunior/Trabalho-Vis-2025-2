import * as d3 from 'd3';


export async function loadChart(data, margens = { left: 50, right: 25, top: 25, bottom: 50 }) {
    const svg = d3.select('svg');

    if (!svg) {
        return;
    }
    // ---- Dimensões internas considerando margens
    const svgWidth = +svg.style('width').split('px')[0];
    const svgHeight = +svg.style('height').split('px')[0];
    const innerWidth = svgWidth - margens.left - margens.right;
    const innerHeight = svgHeight - margens.top - margens.bottom;

    // ---- Grupo principal (traduzido pelas margens)
    const svgGroup = svg.selectAll('#group').data([0]);
    const g = svgGroup.join('g')
        .attr('id', 'group')
        .attr('transform', `translate(${margens.left}, ${margens.top})`);

    // ---- Escalas (usando innerWidth/innerHeight)
    const distExtent = d3.extent(data, d => d.trip_distance);
    const mapX = d3.scaleLinear().domain(distExtent).range([0, innerWidth]);

    const tipExtent = d3.extent(data, d => d.tip_amount);
    const mapY = d3.scaleLinear().domain(tipExtent).range([innerHeight, 0]);

    // ---- Eixos (agora desenhados dentro do grupo traduzido)
    const xAxis  = d3.axisBottom(mapX);
    const groupX = g.selectAll('#axisX').data([0]);

    groupX.join('g')
        .attr('id', 'axisX')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis);

    const yAxis  = d3.axisLeft(mapY);
    const groupY = g.selectAll('#axisY').data([0]);

    groupY.join('g')
        .attr('id', 'axisY')
        .attr('class', 'y axis')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis);

    //---- Linha
    const line = d3.line().x(d => mapX(d.trip_distance)).y(d => mapY(d.tip_amount));

    const path = g.selectAll('path.line').data([data]);

    path.join('path')
        .attr('class','line')
        .attr('d', line)
        .style('fill','none')
        .style('stroke','steelblue')
        .style('stroke-width',2);


    
    
    // ---- Círculos
    const selection = svg.selectAll('#group').data([0]);
    const cGroup = selection.join('g')
            .attr('id', 'group');


    console.log(data);
    const circles = cGroup.selectAll('circle')
        .data(data);

    
    circles.enter()
        .append('circle')
        .attr('cx', d => mapX(d.trip_distance))
        .attr('cy', d => mapY(d.tip_amount))
        .attr('r', 4);

    circles.exit()
        .remove();

    circles
        .attr('cx', d => mapX(d.trip_distance))
        .attr('cy', d => mapY(d.tip_amount))
        .attr('r', 4);

    d3.select('#group')
        .attr('transform', `translate(${margens.left}, ${margens.top})`);

}

export function clearChart() {
    // Remove the whole group (axes + shapes) to ensure a clean redraw
    d3.select('#group').remove();

    // In case axes exist outside the group (defensive), remove them as well
    d3.select('#axisX').remove();
    d3.select('#axisY').remove();
}