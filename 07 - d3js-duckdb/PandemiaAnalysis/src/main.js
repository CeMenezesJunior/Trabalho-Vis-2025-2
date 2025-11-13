import { Taxi } from "./taxi";
import { loadChart, clearChart } from './plot';

export async function runPandemiaAnalysis() {
    console.log("Executando: runPandemiaAnalysis()");

    const loader = document.querySelector('#loader');
    if (loader) loader.style.display = 'block';

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
    
    let data = await taxi.query(sql);
    
    data = data.filter(d => d.mes >= '2020-01' && d.mes <= '2023-12');
    console.log("Dados agregados para D3:", data);

    if (data && data.length > 0) {
        await loadChart(data);
    } else {
        console.error("Pandemia: Nenhum dado retornado da query.");
    }
    
    if (loader) loader.style.display = 'none';
};