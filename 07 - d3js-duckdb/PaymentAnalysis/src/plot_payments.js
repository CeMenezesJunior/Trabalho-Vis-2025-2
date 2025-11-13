import * as d3 from 'd3';

export async function loadPaymentChart(data, margens = { left: 60, right: 150, top: 25, bottom: 50 }) {
    
    const svg = d3.select('svg'); 
    if (svg.empty()) {
        console.error("Elemento SVG não encontrado no index.html");
        return;
    }
    
    clearChart(); 

    const svgWidth = +svg.style('width').split('px')[0];
    const svgHeight = +svg.style('height').split('px')[0];
    const innerWidth = svgWidth - margens.left - margens.right;
    const innerHeight = svgHeight - margens.top - margens.bottom;

    const g = svg.append('g')
        .attr('id', 'group')
        .attr('transform', `translate(${margens.left}, ${margens.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d"); 
    data.forEach(d => {
        d.trip_date_obj = parseDate(d.trip_date); 
        d.trip_count = +d.trip_count;
    });

    const dataGrouped = d3.rollup(data,
        v => d3.sum(v, d => d.trip_count),
        d => d.trip_date_obj, 
        d => d.payment_method
    );

    const dataPivoted = Array.from(dataGrouped, ([date, values]) => {
        const obj = { date: date };
        values.forEach((count, method) => {
            obj[method] = count;
        });
        return obj;
    });

    const keys = Array.from(d3.union(data.map(d => d.payment_method)))
                   .filter(k => k !== 'Desconhecido' && k !== 'Disputa' && k !== 'Sem Cobrança' && k !== 'Voided trip');

    dataPivoted.forEach(d => {
        keys.forEach(key => {
            d[key] = d[key] || 0;
        });
    });
    
    dataPivoted.sort((a, b) => a.date - b.date);

    const x = d3.scaleTime()
        .domain(d3.extent(dataPivoted, d => d.date)) 
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(dataPivoted, d => d3.sum(keys, key => d[key]))])
        .nice()
        .range([innerHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeTableau10); 

    const stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    const series = stack(dataPivoted);

    const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    g.append("g")
        .selectAll("path")
        .data(series)
        .join("path")
            .attr("fill", d => color(d.key))
            .attr("d", area)
        .append("title")
            .text(d => d.key);

    g.append("g")
        .attr('id', 'axisX')
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b %Y")));

    g.append("g")
        .attr('id', 'axisY')
        .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format("~s")))
        .append("text")
            .attr("x", 4)
            .attr("y", -10)
            .attr("fill", "black")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Contagem de Viagens");

    const legend = g.append("g")
        .attr("transform", `translate(${innerWidth + 20}, 0)`);
    
    keys.forEach((key, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);
            
        legendItem.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color(key));
        
        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 14)
            .text(key)
            .attr("font-size", "14px");
    });

    const focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");
    focus.append("line").attr("class", "focus-line").attr("y1", 0).attr("y2", innerHeight).attr("stroke", "#333").attr("stroke-width", 1).attr("stroke-dasharray", "3,3");
    const tooltip = focus.append("g").attr("class", "focus-tooltip");
    tooltip.append("rect").attr("class", "tooltip-bg").attr("x", 8).attr("y", 0).attr("width", 140).attr("height", 70).attr("fill", "rgba(255, 255, 255, 0.9)").attr("stroke", "#999");
    const tooltipDate = tooltip.append("text").attr("class", "tooltip-date").attr("x", 15).attr("y", 20).attr("font-size", "13px").attr("font-weight", "bold");
    const tooltipData = tooltip.append("g").attr("transform", "translate(15, 40)");

    const bisectDate = d3.bisector(d => d.date).left;
    const formatDate = d3.timeFormat("%d/%m/%Y"); 
    const formatCount = d3.format(",.0f"); 

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseover", () => focus.style("display", null))
        .on("mouseleave", () => focus.style("display", "none"))
        .on("mousemove", mousemove);

    function mousemove(event) {
        const mouseX = d3.pointer(event)[0];
        const xDate = x.invert(mouseX);
        const i = bisectDate(dataPivoted, xDate, 1);
        const d0 = dataPivoted[i - 1];
        const d1 = dataPivoted[i];
        if (!d0 || !d1) return; 
        const d = (xDate - d0.date > d1.date - xDate) ? d1 : d0;
        
        const focusX = x(d.date);
        focus.select(".focus-line").attr("x1", focusX).attr("x2", focusX);
        tooltipDate.text(formatDate(d.date)); 

        let total = 0;
        keys.forEach(key => total += d[key]);

        tooltipData.selectAll("text").remove(); 

        keys.forEach((key, j) => {
            tooltipData.append("text")
                .attr("y", j * 18)
                .attr("font-size", "12px")
                .text(`${key}: ${formatCount(d[key])} viagens`);
        });
        
        tooltipData.append("text")
            .attr("y", (keys.length) * 18 + 5)
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text(`Total: ${formatCount(total)} viagens`);
            
        const bbox = tooltipData.node().getBBox();
        tooltip.select(".tooltip-bg")
               .attr("width", bbox.width + 20) 
               .attr("height", bbox.height + 40);
               
        if (focusX > innerWidth / 2) {
            tooltip.attr("transform", `translate(${focusX - bbox.width - 30}, 5)`);
        } else {
            tooltip.attr("transform", `translate(${focusX}, 5)`);
        }
    }
}

export function clearChart() {
    d3.select('#group').remove();
    d3.select('#axisX').remove();
    d3.select('#axisY').remove();
    d3.select('.focus').remove();
    d3.select('.overlay').remove();
}