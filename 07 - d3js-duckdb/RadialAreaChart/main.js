import { Taxi } from "./taxi.js"; 
import { loadRadialChart } from "./plot.js";

export async function runRadialAnalysis() {
    console.log("Executando: runRadialAnalysis() [Yellow Cabs]");
    
    const loader = document.querySelector('#loader');
    if (loader) loader.style.display = 'block';

    const taxi = new Taxi();
    
    try {
        await taxi.init();
        console.log("DuckDB Iniciado.");

        // Carrega 3 meses
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
        // -----------------------------------

        if (data && data.length > 0) {
            await loadRadialChart(data, "Média de Gorjeta por Hora (Yellow Cabs)");
        } else {
            console.error("RadialAnalysis: A query rodou mas retornou 0 linhas.");
            alert("Atenção: Nenhum dado encontrado. Verifique se os arquivos .parquet estão na pasta correta.");
        }

    } catch (e) {
        console.error("RadialAnalysis: Erro fatal:", e);
        alert("Erro ao processar os dados. Verifique o Console (F12).");
    } finally {
        if (loader) loader.style.display = 'none';
    }
}