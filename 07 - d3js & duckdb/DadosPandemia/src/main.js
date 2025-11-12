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
    console.log('[main] Taxi initialized.');
    const files = await taxi.loadTaxi();
    console.log('[main] Taxi data loaded.');
    const sql = `
        SELECT
            strftime('%Y-%m', lpep_pickup_datetime) AS mes, AVG(trip_distance) AS distance
        FROM
            read_parquet([${files.map(d => d.key).join(",")}])
        GROUP BY
            mes
        ORDER BY
            mes ASC
    `;
    let data = await taxi.query(sql);
    data = data.filter(d => d.mes >= '2020-01' && d.mes <= '2023-12');
    console.log(data);
    callbacks(data);
};

