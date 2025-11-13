// 07 - d3js-duckdb/loader.js
// VERSÃO CORRIGIDA (com chamadas de função)

import { clearChart as clearMap } from './MapaDeCalor/src/plot.js';
import { clearChart as clearPayment } from './PaymentAnalysis/src/plot_payments.js';

const loadMapBtn = document.querySelector('#loadMapBtn');
const loadPaymentBtn = document.querySelector('#loadPaymentBtn');
const clearBtn = document.querySelector('#clearBtn');

function clearAllCharts() {
    console.log("Limpando todos os gráficos...");
    clearMap();
    clearPayment();
}

clearBtn.addEventListener('click', clearAllCharts);

loadMapBtn.addEventListener('click', async () => {
    console.log("Botão 'Mapa de Calor' clicado.");
    clearAllCharts(); 
    
    try {
        const module = await import('./MapaDeCalor/src/main.js');
        module.runMapaDeCalor(); 
    } catch (e) {
        console.error("Falha ao carregar o módulo do Mapa de Calor:", e);
    }
});

loadPaymentBtn.addEventListener('click', async () => {
    console.log("Botão 'Análise de Pagamentos' clicado.");
    clearAllCharts();

    try {
        const module = await import('./PaymentAnalysis/src/main.js');
        module.runPaymentAnalysis();
    } catch (e) {
        console.error("Falha ao carregar o módulo de Pagamentos:", e);
    }
});

console.log('Loader.js carregado. Aguardando escolha do usuário.');