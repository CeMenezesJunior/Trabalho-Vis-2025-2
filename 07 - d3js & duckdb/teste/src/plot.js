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
    // Parse month strings (ex: '2023-01') into Date objects for a time scale
    const parseMonth = d3.utcParse('%Y-%m');
    data.forEach(d => {
        if (d.mes && typeof d.mes === 'string') {
            d.mes_date = parseMonth(d.mes);
            if (!d.mes_date) console.warn('[plot] could not parse mes:', d.mes);
        } else if (d.mes instanceof Date) {
            d.mes_date = d.mes;
        } else {
            d.mes_date = null;
        }
    });

    const mesExtent = d3.extent(data, d => d.mes_date);
    const mapX = d3.scaleUtc().domain(mesExtent).range([0, innerWidth]);

    // Use a Y domain that starts at 0 so bars have correct heights
    const maxDistance = d3.max(data, d => d.distance) || 0;
    const mapY = d3.scaleLinear().domain([0, maxDistance]).range([innerHeight, 0]).nice();

    // ---- Eixos (agora desenhados dentro do grupo traduzido)
    const xAxis  = d3.axisBottom(mapX)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.utcFormat('%Y-%m'));
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

    //---- Barras (coloque atrás da linha)
    // Para barras usamos uma scaleBand baseada no label 'mes' (string YYYY-MM)
    const xBand = d3.scaleBand()
        .domain(data.filter(d => d.mes).map(d => d.mes))
        .range([0, innerWidth])
        .padding(0.1);

    const bars = g.append('g')
        .attr('class', 'bars')
        .attr('fill', 'steelblue')
        .selectAll('rect')
        .data(data.filter(d => d.mes_date));

    bars.join('rect')
        .attr('x', d => xBand(d.mes))
        .attr('y', d => mapY(d.distance))
        .attr('height', d => mapY(0) - mapY(d.distance))
        .attr('width', xBand.bandwidth());

    //---- Linha sobre as barras
    const line = d3.line().x(d => mapX(d.mes_date)).y(d => mapY(d.distance));

    const path = g.selectAll('path.line').data([data]);

    path.join('path')
        .attr('class','line')
        .attr('d', line)
        .style('fill','none')
        .style('stroke','black')
        .style('stroke-width',2);

    

  // Create the axes.
    
    // ---- Círculos
    // Use the already created group 'g' for circles (avoid recreating another group)
    // const cGroup = g;

    // console.log('[plot] data sample:', data.slice(0,5));
    // const circles = cGroup.selectAll('circle')
    //     .data(data.filter(d => d.mes_date));

    
    // circles.enter()
    //     .append('circle')
    //     .attr('cx', d => mapX(d.mes_date))
    //     .attr('cy', d => mapY(d.distance))
    //     .attr('r', 4);

    // circles.exit()
    //     .remove();

    // circles
    //     .attr('cx', d => mapX(d.mes_date))
    //     .attr('cy', d => mapY(d.distance))
    //     .attr('r', 4);

    // group 'g' already has transform set above

}

export function clearChart() {
    // Remove the whole group (axes + shapes) to ensure a clean redraw
    d3.select('#group').remove();

    // In case axes exist outside the group (defensive), remove them as well
    d3.select('#axisX').remove();
    d3.select('#axisY').remove();
}