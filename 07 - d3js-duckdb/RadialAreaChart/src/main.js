import { Taxi } from "./taxi.js"; 
import { loadRadialChart } from "./plot.js";

function setJustification() {
    const box = document.querySelector('#justification-box');
    if (!box) return;
    box.innerHTML = `
        <h3>Justificativa: Gráfico de Área Radial (Radial Area Chart)</h3>
        <p>
            Um <strong>Gráfico de Área Radial</strong> foi escolhido para representar a natureza cíclica de um dia (24 horas). Diferente de um gráfico de linha, ele conecta visualmente o fim da noite (23h) ao início da madrugada (00h), facilitando a percepção de padrões horários (como o pico de gorjetas na madrugada).
        </p>
    `;
}

export async function runRadialAnalysis() {
    console.log("Executando: runRadialAnalysis() [Yellow Cabs]");
    
    const loader = document.querySelector('#loader');
    if (loader) loader.style.display = 'block';
    setJustification();

    const taxi = new Taxi();
    
    try {
        await taxi.init();
        console.log("DuckDB Iniciado.");

        await taxi.loadTaxi(3); 
        console.log("Dados carregados na memória.");

        const sql = `
            SELECT 
                extract('hour' FROM tpep_pickup_datetime) as hora,
                avg(tip_amount) as valor
            FROM ${taxi.table}
            WHERE tpep_pickup_datetime IS NOT NULL
            GROUP BY hora
            ORDER BY hora ASC
        `;

        const rawData = await taxi.query(sql);
        console.log("Dados brutos do banco:", rawData);

        const data = rawData.map(d => ({
            hora: Number(d.hora),
            valor: Number(d.valor)
        }));

        if (data && data.length > 0) {
            await loadRadialChart(data, "Média de Gorjeta por Hora (Yellow Cabs)");
        } else {
            console.error("RadialAnalysis: A query rodou mas retornou 0 linhas.");
            alert("Atenção: Nenhum dado encontrado.");
        }

    } catch (e) {
        console.error("RadialAnalysis: Erro fatal:", e);
        alert("Erro ao processar os dados. Verifique o Console (F12).");
    } finally {
        if (loader) loader.style.display = 'none';
    }
}