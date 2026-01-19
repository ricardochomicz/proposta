import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sqlite = sqlite3.verbose()

const app = express()
const port = 3001

const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite.Database(dbPath)

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      office TEXT
    )`,
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operator TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL
    )`,
  )
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

app.use(cors())
app.use(express.json())

app.get('/users', (req, res) => {
  db.all('SELECT id, name, email, phone, office FROM users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar usuários' })
      return
    }
    res.json(rows)
  })
})

app.post('/users', (req, res) => {
  const { name, email, phone, office } = req.body

  if (!name || !email) {
    res.status(400).json({ error: 'Nome e e-mail são obrigatórios' })
    return
  }

  const query =
    'INSERT INTO users (name, email, phone, office) VALUES (?, ?, ?, ?)'

  db.run(query, [name, email, phone || null, office || null], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao criar usuário' })
      return
    }

    res.status(201).json({
      id: this.lastID,
      name,
      email,
      phone: phone || null,
      office: office || null,
    })
  })
})

app.get('/products', (req, res) => {
  db.all(
    'SELECT id, operator, description, price FROM products',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao buscar produtos' })
        return
      }
      res.json(rows)
    },
  )
})

app.post('/products', (req, res) => {
  const { operator, description, price } = req.body

  if (!operator || !description || price == null) {
    res
      .status(400)
      .json({ error: 'Operador, descrição e preço são obrigatórios' })
    return
  }

  const query =
    'INSERT INTO products (operator, description, price) VALUES (?, ?, ?)'

  db.run(query, [operator, description, price], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao criar produto' })
      return
    }

    res.status(201).json({
      id: this.lastID,
      operator,
      description,
      price,
    })
  })
})

app.put('/products/:id', (req, res) => {
  const { id } = req.params
  const { operator, description, price } = req.body

  if (!operator || !description || price == null) {
    res
      .status(400)
      .json({ error: 'Operadora, descrição e preço são obrigatórios' })
    return
  }

  const updateQuery =
    'UPDATE products SET operator = ?, description = ?, price = ? WHERE id = ?'

  db.run(updateQuery, [operator, description, price, id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao atualizar produto' })
      return
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Produto não encontrado' })
      return
    }

    db.get(
      'SELECT id, operator, description, price FROM products WHERE id = ?',
      [id],
      (selectErr, row) => {
        if (selectErr) {
          res.status(500).json({ error: 'Erro ao carregar produto atualizado' })
          return
        }
        res.json(row)
      },
    )
  })
})

app.delete('/products/:id', (req, res) => {
  const { id } = req.params

  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao excluir produto' })
      return
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Produto não encontrado' })
      return
    }

    res.status(204).send()
  })
})

app.get('/proposals', (req, res) => {
  const query = `
    SELECT
      p.id,
      p.user_id as userId,
      u.name as userName,
      u.phone as userPhone,
      p.title,
      p.total,
      p.document,
      p.name,
      p.contact,
      p.phone,
      p.operator,
      p.created_at as createdAt,
      p.updated_at as updatedAt,
      GROUP_CONCAT(pr.description, ', ') as products
    FROM proposals p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN proposal_items pi ON pi.proposal_id = p.id
    LEFT JOIN products pr ON pr.id = pi.product_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar propostas' })
      return
    }

    res.json(rows)
  })
})

app.get('/proposals/:id/items', (req, res) => {
  const { id } = req.params

  const query = `
    SELECT
      pi.id,
      pi.product_id as productId,
      pi.line,
      pi.quantity,
      pi.unit_price as unitPrice,
      pr.description,
      pr.operator
    FROM proposal_items pi
    JOIN products pr ON pr.id = pi.product_id
    WHERE pi.proposal_id = ?
    ORDER BY pi.id
  `

  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar itens da proposta' })
      return
    }

    res.json(rows)
  })
})

app.delete('/proposals/:id', (req, res) => {
  const { id } = req.params

  db.serialize(() => {
    db.run('BEGIN TRANSACTION')

    db.run(
      'DELETE FROM proposal_items WHERE proposal_id = ?',
      [id],
      function (err) {
        if (err) {
          db.run('ROLLBACK', () => {
            res.status(500).json({ error: 'Erro ao excluir itens da proposta' })
          })
          return
        }

        db.run('DELETE FROM proposals WHERE id = ?', [id], function (err2) {
          if (err2) {
            db.run('ROLLBACK', () => {
              res.status(500).json({ error: 'Erro ao excluir proposta' })
            })
            return
          }

          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              res.status(500).json({ error: 'Erro ao finalizar exclusão' })
              return
            }

            if (this.changes === 0) {
              res.status(404).json({ error: 'Proposta não encontrada' })
              return
            }

            res.status(204).send()
          })
        })
      },
    )
  })
})

app.post('/proposals', (req, res) => {
  const {
    userId,
    title,
    total,
    document,
    name,
    contact,
    phone,
    operator,
    items,
  } = req.body

  if (!userId || total == null || !document || !name) {
    res
      .status(400)
      .json({ error: 'Usuário, documento e nome são obrigatórios' })
    return
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Adicione pelo menos um item à proposta' })
    return
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION')

    const insertProposalQuery = `
      INSERT INTO proposals (
        user_id,
        title,
        total,
        document,
        name,
        contact,
        phone,
        operator
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.run(
      insertProposalQuery,
      [
        userId,
        title || null,
        total,
        document,
        name,
        contact || null,
        phone || null,
        operator || null,
      ],
      function (err) {
        if (err) {
          console.log('Erro ao criar proposta:', err.message)
          db.run('ROLLBACK', () => {
            res.status(500).json({ error: 'Erro ao criar proposta' })
          })
          return
        }

        const proposalId = this.lastID
        const insertItemQuery = `
          INSERT INTO proposal_items (
            proposal_id,
            product_id,
            quantity,
            unit_price,
            line
          ) VALUES (?, ?, ?, ?, ?)
        `

        let remaining = items.length
        let hasError = false

        items.forEach((item) => {
          if (hasError) return

          const { productId, quantity, unitPrice, line } = item

          if (!productId || quantity == null || unitPrice == null) {
            hasError = true
            db.run('ROLLBACK', () => {
              res.status(400).json({
                error:
                  'Itens da proposta precisam de produto, quantidade e valor',
              })
            })
            return
          }

          db.run(
            insertItemQuery,
            [proposalId, productId, quantity, unitPrice, line || null],
            (err) => {
              if (err) {
                hasError = true
                db.run('ROLLBACK', () => {
                  res
                    .status(500)
                    .json({ error: 'Erro ao adicionar itens da proposta' })
                })
                return
              }

              remaining -= 1

              if (remaining === 0) {
                db.run('COMMIT', (err) => {
                  if (err) {
                    res.status(500).json({
                      error: 'Erro ao finalizar criação da proposta',
                    })
                    return
                  }

                  const selectQuery = `
                    SELECT
                      p.id,
                      p.user_id as userId,
                      u.name as userName,
                      u.phone as userPhone,
                      p.title,
                      p.total,
                      p.document,
                      p.name,
                      p.contact,
                      p.phone,
                      p.operator,
                      p.created_at as createdAt,
                      p.updated_at as updatedAt,
                      GROUP_CONCAT(pr.description, ', ') as products
                    FROM proposals p
                    JOIN users u ON u.id = p.user_id
                    LEFT JOIN proposal_items pi ON pi.proposal_id = p.id
                    LEFT JOIN products pr ON pr.id = pi.product_id
                    WHERE p.id = ?
                    GROUP BY p.id
                  `

                  db.get(selectQuery, [proposalId], (err, row) => {
                    if (err) {
                      res.status(500).json({
                        error: 'Erro ao carregar proposta criada',
                      })
                      return
                    }

                    res.status(201).json(row)
                  })
                })
              }
            },
          )
        })
      },
    )
  })
})

app.put('/proposals/:id', (req, res) => {
  const { id } = req.params

  const {
    userId,
    title,
    total,
    document,
    name,
    contact,
    phone,
    operator,
    items,
  } = req.body

  if (!userId || total == null || !document || !name) {
    res
      .status(400)
      .json({ error: 'Usuário, documento e nome são obrigatórios' })
    return
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Adicione pelo menos um item à proposta' })
    return
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION')

    const updateProposalQuery = `
      UPDATE proposals
      SET
        user_id = ?,
        title = ?,
        total = ?,
        document = ?,
        name = ?,
        contact = ?,
        phone = ?,
        operator = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `

    db.run(
      updateProposalQuery,
      [
        userId,
        title || null,
        total,
        document,
        name,
        contact || null,
        phone || null,
        operator || null,
        id,
      ],
      function (err) {
        if (err) {
          console.log('Erro ao atualizar proposta:', err.message)
          db.run('ROLLBACK', () => {
            res.status(500).json({ error: 'Erro ao atualizar proposta' })
          })
          return
        }

        if (this.changes === 0) {
          db.run('ROLLBACK', () => {
            res.status(404).json({ error: 'Proposta não encontrada' })
          })
          return
        }

        const deleteItemsQuery =
          'DELETE FROM proposal_items WHERE proposal_id = ?'

        db.run(deleteItemsQuery, [id], (deleteErr) => {
          if (deleteErr) {
            db.run('ROLLBACK', () => {
              res
                .status(500)
                .json({ error: 'Erro ao remover itens antigos da proposta' })
            })
            return
          }

          const insertItemQuery = `
            INSERT INTO proposal_items (
              proposal_id,
              product_id,
              quantity,
              unit_price,
              line
            ) VALUES (?, ?, ?, ?, ?)
          `

          let remaining = items.length
          let hasError = false

          items.forEach((item) => {
            if (hasError) return

            const { productId, quantity, unitPrice, line } = item

            if (!productId || quantity == null || unitPrice == null) {
              hasError = true
              db.run('ROLLBACK', () => {
                res.status(400).json({
                  error:
                    'Itens da proposta precisam de produto, quantidade e valor',
                })
              })
              return
            }

            db.run(
              insertItemQuery,
              [id, productId, quantity, unitPrice, line || null],
              (itemErr) => {
                if (itemErr) {
                  hasError = true
                  db.run('ROLLBACK', () => {
                    res.status(500).json({
                      error: 'Erro ao atualizar itens da proposta',
                    })
                  })
                  return
                }

                remaining -= 1

                if (remaining === 0) {
                  db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                      res.status(500).json({
                        error: 'Erro ao finalizar atualização da proposta',
                      })
                      return
                    }

                    const selectQuery = `
                      SELECT
                        p.id,
                        p.user_id as userId,
                        u.name as userName,
                        u.phone as userPhone,
                        p.title,
                        p.total,
                        p.document,
                        p.name,
                        p.contact,
                        p.phone,
                        p.operator,
                        p.created_at as createdAt,
                        p.updated_at as updatedAt,
                        GROUP_CONCAT(pr.description, ', ') as products
                      FROM proposals p
                      JOIN users u ON u.id = p.user_id
                      LEFT JOIN proposal_items pi ON pi.proposal_id = p.id
                      LEFT JOIN products pr ON pr.id = pi.product_id
                      WHERE p.id = ?
                      GROUP BY p.id
                    `

                    db.get(selectQuery, [id], (selectErr, row) => {
                      if (selectErr) {
                        res.status(500).json({
                          error: 'Erro ao carregar proposta atualizada',
                        })
                        return
                      }

                      res.json(row)
                    })
                  })
                }
              },
            )
          })
        })
      },
    )
  })
})

app.listen(port, () => {
  console.log(`API de orçamentos ouvindo na porta ${port}`)
})
