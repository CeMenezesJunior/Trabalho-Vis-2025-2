import { Taxi } from "./taxi";
import { loadChart, clearChart } from './plot';

function callbacks(data) {
    const loadBtn  = document.querySelector('#loadBtn');
    const clearBtn = document.querySelector('#clearBtn');

    if (!loadBtn || !clearBtn) {
        return;
    }

    loadBtn.addEventListener('click', async () => {
        clearChart();
        await loadChart(data);
    });

    clearBtn.addEventListener('click', async () => {
        clearChart();
    });
}

window.onload = async () => {
    const taxi = new Taxi();

    await taxi.init();
    // NOTA: Carregando apenas 3 meses para a agregação ser mais rápida
    // O seu taxi.js original carrega 12 (padrão)
    await taxi.loadTaxi(3); 

    // Nova consulta SQL para o Heatmap
    const sql = `
        SELECT
            strftime(lpep_pickup_datetime, '%w') AS dia_semana, -- 0-6 (Domingo=0, Sábado=6)
            strftime(lpep_pickup_datetime, '%H') AS hora_dia,   -- 00-23
            CAST(COUNT(*) AS DOUBLE) AS total_viagens
        FROM
            taxi_2023 -- Nome da tabela criada em taxi.js
        GROUP BY
            dia_semana,
            hora_dia
        ORDER BY
            dia_semana,
            hora_dia;
    `;

    const data = await taxi.query(sql);
    console.log("Dados agregados para o heatmap:", data);

    callbacks(data);

    await loadChart(data);
};