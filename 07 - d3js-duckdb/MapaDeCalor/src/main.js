import { Taxi } from "./taxi";
import { loadChart, clearChart } from './plot';

export async function runMapaDeCalor() {
    console.log("Executando: runMapaDeCalor()");
    
    const taxi = new Taxi();
    await taxi.init();
    await taxi.loadTaxi(3); 

    const sql = `
        SELECT
            strftime(lpep_pickup_datetime, '%w') AS dia_semana,
            strftime(lpep_pickup_datetime, '%H') AS hora_dia,
            CAST(COUNT(*) AS DOUBLE) AS total_viagens
        FROM
            taxi_2023 
        GROUP BY
            dia_semana, hora_dia
        ORDER BY
            dia_semana, hora_dia;
    `;

    try {
        const data = await taxi.query(sql);
        console.log("Dados agregados para o heatmap:", data);
        if (data && data.length > 0) {
            await loadChart(data);
        } else {
            console.error("MapaDeCalor: Nenhum dado retornado.");
        }
    } catch (e) {
        console.error("MapaDeCalor: Falha na query ou no D3:", e.message);
    }
}