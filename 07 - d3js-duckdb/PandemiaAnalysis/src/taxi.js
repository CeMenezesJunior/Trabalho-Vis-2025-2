import { loadDb } from './config';

export class Taxi {
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();
        this.color = "green";
        this.table = 'taxi_2023_pandemia'; 
    }

    async loadTaxi(months = 12) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        console.log("Iniciando fetch dos dados da Pandemia (APENAS 2023)...");
        const files = [];
        
        const year = 2023; 
        for (let id = 1; id <= months; id++) {
            const sId = String(id).padStart(2, '0');
            const fileName = `${this.color}_tripdata_${year}-${sId}.parquet`;
            
            const url = `${this.color}/${fileName}`; 
            const key = `Y${year}M${sId}`;

            try {
                console.log(`Buscando: ${url}`);
                const res = await fetch(url);
                if (!res.ok) {
                    console.warn(`Arquivo não encontrado (ignorado): ${url}`);
                    continue; 
                }
                
                await this.db.registerFileBuffer(key, new Uint8Array(await res.arrayBuffer()));
                files.push({ key: key });
                console.log(`Registrado: ${key}`);

            } catch(e) {
                console.error(`Erro no fetch de ${url}:`, e);
            }
        }
        
        if (files.length === 0) {
            console.error("Nenhum arquivo da pandemia foi carregado.");
            return;
        }

        console.log(`Criando tabela '${this.table}' (${files.length} arquivos)...`);
        
        await this.conn.query(`
            CREATE OR REPLACE TABLE ${this.table} AS
                SELECT * FROM read_parquet([${files.map(d => d.key).join(",")}]);
        `);
        
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