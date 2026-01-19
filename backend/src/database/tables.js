export function createTables(db) {
  db.serialize(() => {
    // Tabela de Usuários
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        office TEXT
      )`,
    )

    // Tabela de Produtos
    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operator TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL
      )`,
    )

    // Tabela de Propostas
    db.run(
      `CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT,
        total REAL NOT NULL,
        document TEXT NOT NULL,
        name TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        operator TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
    )

    // Tabela de Itens da Proposta
    db.run(
      `CREATE TABLE IF NOT EXISTS proposal_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposal_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        line TEXT NULL,
        FOREIGN KEY (proposal_id) REFERENCES proposals(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,
    )
  })
}
