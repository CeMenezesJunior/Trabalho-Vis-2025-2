import * as d3 from 'd3';

export async function loadRadialChart(data, title) {
    const svg = d3.select('svg');
    svg.selectAll('*').remove();

    const width = +svg.style('width').split('px')[0] || 800;
    const height = +svg.style('height').split('px')[0] || 600;
    
    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;
    
    const defs = svg.append("defs");
    
    const gradient = defs.append("radialGradient")
        .attr("id", "radar-gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#FFC107") 
        .attr("stop-opacity", 0.4);    

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#FF6F00") 
        .attr("stop-opacity", 0.9);   

    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 20})`);

    const x = d3.scaleLinear()
        .domain([0, 24])
        .range([0, 2 * Math.PI]);

    const yMax = d3.max(data, d => d.valor) || 1;
    const domainMax = yMax * 1.1; 

    const y = d3.scaleLinear()
        .domain([0, domainMax])
        .range([0, radius]);

    const area = d3.areaRadial()
        .angle(d => x(d.hora))
        .innerRadius(0)
        .outerRadius(d => y(d.valor))
        .curve(d3.curveCatmullRomClosed);

    g.append("path")
        .datum(data)
        .attr("fill", "url(#radar-gradient)")
        .attr("stroke", "#B71C1C") 
        .attr("stroke-width", 4) 
        .attr("d", area);

    const ticks = [0.25, 0.5, 0.75, 1];
    
    g.selectAll(".grid-circle")
        .data(ticks).enter().append("circle")
        .attr("r", d => radius * d)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "4,4");

    const hours = d3.range(0, 24); 

    g.selectAll(".label-hour")
        .data(hours).enter().append("text")
        .attr("x", d => Math.sin(x(d)) * (radius + 25))
        .attr("y", d => -Math.cos(x(d)) * (radius + 25))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(d => d + "h")
        .style("font-weight", d => d % 6 === 0 ? "bold" : "normal")
        .style("font-size", d => d % 6 === 0 ? "16px" : "11px") 
        .style("fill", d => d % 6 === 0 ? "#333" : "#999") 
        .style("font-family", "sans-serif");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .text(title);

    const tooltip = g.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("fill", "#333")
        .style("pointer-events", "none");

    g.selectAll(".data-point")
        .data(data)
        .enter().append("circle")
        .attr("class", "data-point")
        .attr("cx", d => Math.sin(x(d.hora)) * y(d.valor))
        .attr("cy", d => -Math.cos(x(d.hora)) * y(d.valor))
        .attr("r", 4) 
        .attr("fill", "#B71C1C") 
        .style("cursor", "pointer") 
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 7)
                .attr("fill", "#880E4F"); 
            
            tooltip
                .attr("x", 0) 
                .attr("y", 0)
                .text(`${d.hora}h: $${d.valor.toFixed(2)}`)
                .style("opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", 4)
                .attr("fill", "#B71C1C"); 
            tooltip.style("opacity", 0);
        });
}

export function clearChart() {
    d3.select('svg').selectAll('*').remove();
}