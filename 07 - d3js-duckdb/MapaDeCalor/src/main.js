import { Taxi } from "./taxi";
import { loadChart, clearChart } from './plot';

function setJustification() {
    const box = document.querySelector('#justification-box');
    if (!box) return;
    box.innerHTML = `
        <h3>Justificativa: Gráfico de Calor (Heatmap)</h3>
        <p>
            Um <strong>Gráfico de Calor (Heatmap)</strong> foi escolhido por ser a visualização ideal para cruzar duas categorias distintas (Dia da Semana vs. Hora do Dia) e codificar uma terceira variável de intensidade (Volume de Viagens) através de uma paleta de cores "quente" (Amarelo -> Vermelho).
        </p>
    `;
}

export async function runMapaDeCalor() {
    console.log("Executando: runMapaDeCalor()");
    document.querySelector('#loader').style.display = 'block';
    setJustification(); 

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
    
    document.querySelector('#loader').style.display = 'none';
}