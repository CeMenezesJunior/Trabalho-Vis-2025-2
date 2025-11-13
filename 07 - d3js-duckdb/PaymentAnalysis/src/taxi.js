import { loadDb } from './config';

export class Taxi {
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();
        this.color = "yellow"; 
        this.table = 'taxi_data_payment'; 
    }

    async loadTaxi(months = 3) { 
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        console.log(`Iniciando fetch de ${months} meses (método registerFileBuffer)...`);
        
        const files = [];

        for (let id = 1; id <= months; id++) {
            const sId = String(id).padStart(2, '0');
            const fileName = `${this.color}_tripdata_2023-${sId}.parquet`;
            const url = `${this.color}/${fileName}`;
            const key = `Y2023M${sId}`; 
            
            try {
                console.log(`Buscando: ${url}`);
                const res = await fetch(url);
                
                if (!res.ok) {
                    console.error(`Falha ao buscar ${url}: ${res.statusText}.`);
                    continue;
                }
                
                await this.db.registerFileBuffer(key, new Uint8Array(await res.arrayBuffer()));
                files.push({ key: key });
                console.log(`Registrado: ${key}`);

            } catch (e) {
                console.error(`Erro no fetch de ${url}:`, e);
            }
        }
        
        if (files.length === 0) {
            console.error("Nenhum arquivo foi carregado.");
            return;
        }

        console.log("Criando tabela otimizada (apenas colunas necessárias)...");
        
        await this.conn.query(`
            CREATE OR REPLACE TABLE ${this.table} AS
                SELECT 
                    tpep_pickup_datetime, 
                    payment_type 
                FROM read_parquet(
                    [${files.map(d => d.key).join(", ")}]
                );
        `);
        // ⬆️ ⬆️ FIM DA OTIMIZAÇÃO ⬆️ ⬆️
        
        console.log(`Tabela ${this.table} criada com sucesso.`);
    }

    async query(sql) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        console.log("Executando query:", sql);
        let result = await this.conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    }
}