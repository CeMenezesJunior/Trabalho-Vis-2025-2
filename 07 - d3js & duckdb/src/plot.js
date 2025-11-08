import * as d3 from 'd3';


export async function loadChart(data, margens = { left: 50, right: 25, top: 25, bottom: 50 }) {
    const svg = d3.select('svg');

    if (!svg) {
        return;
    }

    // ---- Escalas
    const distExtent = d3.extent(data, d => d.trip_distance);
    const mapX = d3.scaleLinear().domain(distExtent).range([0, +svg.style("width").split("px")[0] - margens.left - margens.right]);

    const tipExtent = d3.extent(data, d => d.tip_amount);
    const mapY = d3.scaleLinear().domain(tipExtent).range([+svg.style("height").split("px")[0] - margens.bottom - margens.top, 0]);

    // ---- Eixos
    const xAxis  = d3.axisBottom(mapX);
    const groupX = svg.selectAll('#axisX').data([0]);

    groupX.join('g')
        .attr('id', 'axisX')
        .attr('class', 'x axis')
        .attr('transform', `translate(${margens.left}, ${+svg.style('height').split('px')[0] - margens.bottom})`)
        .call(xAxis);

    const yAxis  = d3.axisLeft(mapY);
    const groupY = svg.selectAll('#axisY').data([0]);

    groupY.join('g')
        .attr('id', 'axisY')
        .attr('class', 'y axis')
        .attr('transform', `translate(${margens.left}, ${margens.top})`)
        .call(yAxis);



    var line = d3.line().x(d => mapX(d.trip_distance)).y(d => mapY(d.tip_amount))

    var svgGroup = d3.select("svg").select("g")

    var path = svgGroup.selectAll('path.line').data([data]);

    path.enter()
    .append('path')
    .attr('class','line')
    .attr('d',line)
    .attr('transform', `translate(${margens.bottom})`)
    .style('fill','none')
    .style('stroke','steelblue')
    .style('stroke-width',2);


    
    
    // ---- Círculos
    // const selection = svg.selectAll('#group').data([0]);
    // const cGroup = selection.join('g')
    //         .attr('id', 'group');

    // // const line = cGroup.selectAll('line').data(data);

    // // line.enter()
    // //     .append('line')
    // //     .attr('x1',d=>mapX(d.trip_distance))
    // //     .attr('y1',d=>mapY(d.tip_amount))
    // //     .attr('x2',d=>mapX(d.trip_distance))
    // //     .attr('y2',d=>mapY(d.tip_amount));

    // // line.exit()
    // //     .remove();
    
    // // line
    // //     .attr('x1',d=>mapX(d.trip_distance))
    // //     .attr('y1',d=>mapY(d.tip_amount))
    // //     .attr('x2',d=>mapX(d.trip_distance))
    // //     .attr('y2',d=>mapY(d.tip_amount));

    // console.log(data);
    // const circles = cGroup.selectAll('circle')
    //     .data(data);

    
    // circles.enter()
    //     .append('circle')
    //     .attr('cx', d => mapX(d.trip_distance))
    //     .attr('cy', d => mapY(d.tip_amount))
    //     .attr('r', 4);

    // circles.exit()
    //     .remove();

    // circles
    //     .attr('cx', d => mapX(d.trip_distance))
    //     .attr('cy', d => mapY(d.tip_amount))
    //     .attr('r', 4);

    // d3.select('#group')
    //     .attr('transform', `translate(${margens.left}, ${margens.top})`);

}

export function clearChart() {
    d3.select('#group')
        .selectAll('circle')
        .remove();

    d3.select('#axisX')
        .selectAll('*')
        .remove();

    d3.select('#axisY')
        .selectAll('*')
        .remove();
    }