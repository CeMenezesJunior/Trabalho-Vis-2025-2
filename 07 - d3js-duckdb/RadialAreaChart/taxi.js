import { loadDb } from './config.js';

export class Taxi {
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();

        this.color = "yellow";
        this.table = 'taxi_2023';
    }

    async loadTaxi(months = 12) { 
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        const files = [];

        for (let id = 1; id <= months; id++) {
            const sId = String(id).padStart(2, '0');
            const fileName = `${this.color}_tripdata_2023-${sId}.parquet`;
            
            const url = `${this.color}/${fileName}`; 
            const key = `Y2023M${sId}`;

            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.error(`Falha ao buscar ${url}: ${res.statusText}.`);
                    continue;
                }
                
                await this.db.registerFileBuffer(key, new Uint8Array(await res.arrayBuffer()));
                files.push({ key: key });
            
            } catch (e) {
                console.error(`Erro no fetch de ${url}:`, e);
            }
        }
        
        if (files.length === 0) {
            console.warn("Nenhum arquivo foi carregado. Verifique se o servidor Vite permite acesso à pasta '../00 - data'.");
            return;
        }

        await this.conn.query(`
            CREATE OR REPLACE TABLE ${this.table} AS
                SELECT * FROM read_parquet([${files.map(d => d.key).join(",")}]);
        `);
    }

    async query(sql) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        let result = await this.conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    }
}