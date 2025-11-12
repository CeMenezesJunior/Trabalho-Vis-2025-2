import * as d3 from 'd3';

export async function loadChart(data, margens = { left: 60, right: 25, top: 25, bottom: 50 }) {
    const svg = d3.select('svg');

    if (!svg || !data || data.length === 0) {
        console.warn('SVG não encontrado ou dados vazios.');
        return;
    }
    
    // ---- Tooltip (para interatividade)
    // Seleciona o tooltip se já existir, senão cria um
    let tooltip = d3.select('body').select('.tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '5px 10px')
            .style('border-radius', '4px')
            .style('pointer-events', 'none'); // Evita que o tooltip "pisque"
    }

    // ---- Dimensões
    const svgWidth = +svg.style('width').split('px')[0];
    const svgHeight = +svg.style('height').split('px')[0];
    const innerWidth = svgWidth - margens.left - margens.right;
    const innerHeight = svgHeight - margens.top - margens.bottom;

    // ---- Grupo principal (traduzido pelas margens)
    const g = svg.selectAll('#group').data([0]).join('g')
        .attr('id', 'group')
        .attr('transform', `translate(${margens.left}, ${margens.top})`);

    // ---- Dados para os eixos (robusto para dados faltantes)
    const horas = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')); // "00" a "23"
    const diasNum = Array.from({ length: 7 }, (_, i) => String(i)); // "0" a "6"
    const diasLabel = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // ---- Escalas
    // Eixo X (Horas)
    const mapX = d3.scaleBand()
        .domain(horas)
        .range([0, innerWidth])
        .padding(0.05);

    // Eixo Y (Dias da Semana)
    const mapY = d3.scaleBand()
        .domain(diasNum) // "0", "1", ... "6"
        .range([0, innerHeight])
        .padding(0.05);

    // Escala de Cor (Viagens)
    const maxViagens = d3.max(data, d => d.total_viagens) || 0;
    const mapColor = d3.scaleSequential()
        .domain([0, maxViagens])
        .interpolator(d3.interpolateYlOrRd); // Amarelo -> Laranja -> Vermelho

    // ---- Eixos
    const xAxis = d3.axisBottom(mapX)
        .tickValues(mapX.domain().filter((d, i) => i % 2 === 0)); // Mostrar horas pares
    
    g.selectAll('#axisX').data([0]).join('g')
        .attr('id', 'axisX')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis)
        .call(g => g.append("text") // Label do Eixo X
            .attr("x", innerWidth / 2)
            .attr("y", margens.bottom - 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "middle")
            .text("Hora do Dia"));

    const yAxis = d3.axisLeft(mapY)
        .tickFormat(d => diasLabel[+d]); // Mapeia "0" para "Dom", etc.

    g.selectAll('#axisY').data([0]).join('g')
        .attr('id', 'axisY')
        .call(yAxis)
        .call(g => g.append("text") // Label do Eixo Y
            .attr("x", -innerHeight / 2)
            .attr("y", -margens.left + 15)
            .attr("fill", "currentColor")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Dia da Semana"));

    // ---- Desenhando o Heatmap (Retângulos)
    g.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => mapX(d.hora_dia))
        .attr('y', d => mapY(d.dia_semana))
        .attr('width', mapX.bandwidth())
        .attr('height', mapY.bandwidth())
        .attr('fill', d => mapColor(d.total_viagens))
        .style('stroke-width', 1)
        .style('stroke', 'none')
        .on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', 0.9);
        })
        .on('mousemove', (event, d) => {
            tooltip.html(`
                <strong>${diasLabel[+d.dia_semana]}</strong>, ${d.hora_dia}h<br>
                Viagens: ${d.total_viagens.toLocaleString('pt-BR')}
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 30) + 'px');
        })
        .on('mouseleave', (event, d) => {
            tooltip.transition().duration(500).style('opacity', 0);
        });
}

export function clearChart() {
    // Remove o grupo principal (eixos e retângulos)
    d3.select('#group').remove();

    // Remove o tooltip se o mouse sair da tela ao limpar
    d3.select('.tooltip').style('opacity', 0);
}