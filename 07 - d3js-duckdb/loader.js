import { clearChart as clearMap } from './MapaDeCalor/src/plot.js';
import { clearChart as clearPayment } from './PaymentAnalysis/src/plot_payments.js';
import { clearChart as clearPandemia } from './PandemiaAnalysis/src/plot.js';
// 1. ⬇️ CORREÇÃO AQUI: Adicionado '/src/' ⬇️
import { clearChart as clearRadial } from './RadialAreaChart/src/plot.js';

const loadMapBtn = document.querySelector('#loadMapBtn');
const loadPaymentBtn = document.querySelector('#loadPaymentBtn');
const loadPandemiaBtn = document.querySelector('#loadPandemiaBtn');
const loadBestTipsBtn = document.querySelector('#loadBestTipsBtn');
const clearBtn = document.querySelector('#clearBtn');
const justificationBox = document.querySelector('#justification-box');

function clearAllCharts() {
    console.log("Limpando todos os gráficos...");
    clearMap();
    clearPayment();
    clearPandemia();
    clearRadial();
    if (justificationBox) justificationBox.innerHTML = "";
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

loadPandemiaBtn.addEventListener('click', async () => {
    console.log("Botão 'Análise Pandemia' clicado.");
    clearAllCharts();
    try {
        const module = await import('./PandemiaAnalysis/src/main.js');
        module.runPandemiaAnalysis();
    } catch (e) {
        console.error("Falha ao carregar o módulo da Pandemia:", e);
    }
});

loadBestTipsBtn.addEventListener('click', async () => {
    console.log("Botão 'Melhores Gorjetas' clicado.");
    clearAllCharts();
    try {
        // 2. ⬇️ CORREÇÃO AQUI: Adicionado '/src/' ⬇️
        const module = await import('./RadialAreaChart/src/main.js');
        module.runRadialAnalysis();
    } catch (e) {
        console.error("Falha ao carregar o módulo Radial:", e);
    }
});

console.log('Loader.js carregado. Aguardando escolha do usuário.');