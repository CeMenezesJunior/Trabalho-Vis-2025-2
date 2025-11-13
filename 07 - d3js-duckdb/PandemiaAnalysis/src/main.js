import { Taxi } from "./taxi";
import { loadChart, clearChart } from './plot';

function setJustification() {
    const box = document.querySelector('#justification-box');
    if (!box) return;
    box.innerHTML = `
        <h3>Justificativa: Gráfico de Barras (Bar Chart)</h3>
        <p>
            Um <strong>Gráfico de Barras</strong> foi escolhido por sua clareza na comparação de valores discretos (Distância Média) entre categorias temporais distintas (Meses). Isso permite uma fácil identificação de tendências e anomalias (como o pico de distância média no início da pandemia em 2020).
        </p>
    `;
}

export async function runPandemiaAnalysis() {
    console.log("Executando: runPandemiaAnalysis()");

    const loader = document.querySelector('#loader');
    if (loader) loader.style.display = 'block';
    setJustification();

    const taxi = new Taxi();
    await taxi.init();
    console.log('[main] Taxi initialized.');
    
    await taxi.loadTaxi(); 
    console.log('[main] Taxi data loaded.');

    const sql = `
        SELECT
            strftime('%Y-%m', lpep_pickup_datetime) AS mes, 
            CAST(AVG(trip_distance) AS DOUBLE) AS distance
        FROM
            ${taxi.table} 
        GROUP BY
            mes
        ORDER BY
            mes ASC
    `;
    
    try {
        let data = await taxi.query(sql);
        
        data = data.filter(d => d.mes >= '2020-01' && d.mes <= '2023-12');
        console.log("Dados agregados para D3:", data);

        if (data && data.length > 0) {
            await loadChart(data);
        } else {
            console.error("Pandemia: Nenhum dado retornado da query.");
        }
    } catch (e) {
        console.error("Pandemia: Falha na query ou no D3:", e.message);
    }
    
    if (loader) loader.style.display = 'none';
};