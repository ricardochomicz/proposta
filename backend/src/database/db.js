import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { createTables } from './tables.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// O arquivo de banco de dados está na raiz do backend
const dbPath = path.resolve(__dirname, '../../database.sqlite')

const sqlite = sqlite3.verbose()

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message)
  } else {
    console.log('Conectado ao banco de dados SQLite.')
    // Cria as tabelas assim que conectar
    createTables(db)
  }
})

export default db
