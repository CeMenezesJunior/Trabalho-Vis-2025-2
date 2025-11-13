import { Taxi } from "./taxi";
import { loadPaymentChart, clearChart } from './plot_payments';

export async function runPaymentAnalysis() {
    console.log("Executando: runPaymentAnalysis()");
    
    const loader = document.querySelector('#loader');
    if (loader) loader.style.display = 'block';

    const taxi = new Taxi();
    await taxi.init();
    await taxi.loadTaxi(3);

    const sql = `
        SELECT
            strftime(tpep_pickup_datetime, '%Y-%m-%d') AS trip_date, -- 'trip_month' virou 'trip_date'
            CASE 
                WHEN payment_type = 1 THEN 'Cartão de Crédito'
                WHEN payment_type = 2 THEN 'Dinheiro'
                WHEN payment_type = 3 THEN 'Sem Cobrança'
                WHEN payment_type = 4 THEN 'Disputa'
                ELSE 'Desconhecido'
            END AS payment_method,
            CAST(COUNT(*) AS DOUBLE) AS trip_count
        FROM
            ${taxi.table}
        WHERE
            payment_type IS NOT NULL
            AND strftime(tpep_pickup_datetime, '%Y') = '2023'
        GROUP BY
            trip_date, payment_method
        ORDER BY
            trip_date, payment_method;
    `;

    try {
        const aggregatedData = await taxi.query(sql);
        console.log("Dados agregados para D3:", aggregatedData);

        if (aggregatedData && aggregatedData.length > 0) {
            await loadPaymentChart(aggregatedData);
        } else {
            console.error("PaymentAnalysis: Nenhum dado foi retornado da query.");
        }
    } catch (e) {
        console.error("PaymentAnalysis: Falha na query ou no D3:", e.message);
    }
    
    if (loader) loader.style.display = 'none';
}