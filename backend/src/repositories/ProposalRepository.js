import db from '../database/db.js'

class ProposalRepository {
  findAll() {
    return new Promise((resolve, reject) => {
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
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  findById(id) {
    return new Promise((resolve, reject) => {
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
        WHERE p.id = ?
        GROUP BY p.id
      `
      db.get(query, [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  findItemsByProposalId(proposalId) {
    return new Promise((resolve, reject) => {
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
      db.all(query, [proposalId], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION')

        db.run('DELETE FROM proposal_items WHERE proposal_id = ?', [id], (err) => {
          if (err) {
            return db.run('ROLLBACK', () => reject(err))
          }

          db.run('DELETE FROM proposals WHERE id = ?', [id], function (err2) {
            if (err2) {
              return db.run('ROLLBACK', () => reject(err2))
            }

            if (this.changes === 0) {
              return db.run('ROLLBACK', () => resolve(false)) // Not found
            }

            db.run('COMMIT', (commitErr) => {
              if (commitErr) reject(commitErr)
              else resolve(true)
            })
          })
        })
      })
    })
  }

  create(proposalData) {
    const { userId, title, total, document, name, contact, phone, operator, items } = proposalData

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION')

        const insertProposalQuery = `
          INSERT INTO proposals (
            user_id, title, total, document, name, contact, phone, operator
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `

        db.run(insertProposalQuery, [
          userId, title || null, total, document, name, contact || null, phone || null, operator || null
        ], function (err) {
          if (err) {
            return db.run('ROLLBACK', () => reject(err))
          }

          const proposalId = this.lastID
          const insertItemQuery = `
            INSERT INTO proposal_items (
              proposal_id, product_id, quantity, unit_price, line
            ) VALUES (?, ?, ?, ?, ?)
          `

          // Se não houver itens (embora a validação deva ocorrer antes), commita logo
          if (!items || items.length === 0) {
            return db.run('COMMIT', (commitErr) => {
              if (commitErr) reject(commitErr)
              else this.findById(proposalId).then(resolve).catch(reject)
            })
          }

          let remaining = items.length
          let hasError = false

          items.forEach((item) => {
            if (hasError) return

            const { productId, quantity, unitPrice, line } = item

            db.run(insertItemQuery, [proposalId, productId, quantity, unitPrice, line || null], (err) => {
              if (err) {
                hasError = true
                return db.run('ROLLBACK', () => reject(err))
              }

              remaining -= 1
              if (remaining === 0) {
                db.run('COMMIT', (commitErr) => {
                  if (commitErr) reject(commitErr)
                  else {
                    // Reutiliza o findById para retornar o objeto completo
                    // Como findById retorna uma Promise, precisamos tratar aqui
                    // Mas dentro do callback do db.run, não podemos usar await diretamente na raiz da função
                    // Então usamos a referência do 'this' externo ou chamamos o método da classe se acessível.
                    // Como estamos dentro da classe, podemos chamar this.findById SE 'this' estiver preservado ou capturado.
                    // Arrow functions não têm 'this', então precisamos usar uma referência ou chamar o método da instância.
                    // Hack: chamar a query de select aqui dentro para evitar problemas de escopo/this complexos ou resolver apenas o ID.
                    // Melhor: resolver o ID e deixar o controller buscar se quiser, OU duplicar a query simples.
                    // Vou tentar resolver o objeto completo chamando o método estático ou da instância.
                    // Para simplificar, vou resolver com o ID e os dados básicos, ou chamar a query de select.
                    
                    // Recuperando a proposta recém criada
                    const selectQuery = `
                      SELECT
                        p.id, p.user_id as userId, u.name as userName, u.phone as userPhone,
                        p.title, p.total, p.document, p.name, p.contact, p.phone, p.operator,
                        p.created_at as createdAt, p.updated_at as updatedAt,
                        GROUP_CONCAT(pr.description, ', ') as products
                      FROM proposals p
                      JOIN users u ON u.id = p.user_id
                      LEFT JOIN proposal_items pi ON pi.proposal_id = p.id
                      LEFT JOIN products pr ON pr.id = pi.product_id
                      WHERE p.id = ?
                      GROUP BY p.id
                    `
                    db.get(selectQuery, [proposalId], (selectErr, row) => {
                      if (selectErr) reject(selectErr)
                      else resolve(row)
                    })
                  }
                })
              }
            })
          })
        })
      })
    })
  }

  update(id, proposalData) {
    const { userId, title, total, document, name, contact, phone, operator, items } = proposalData

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION')

        const updateProposalQuery = `
          UPDATE proposals
          SET user_id = ?, title = ?, total = ?, document = ?, name = ?, contact = ?, phone = ?, operator = ?, updated_at = datetime('now')
          WHERE id = ?
        `

        db.run(updateProposalQuery, [
          userId, title || null, total, document, name, contact || null, phone || null, operator || null, id
        ], function (err) {
          if (err) {
            return db.run('ROLLBACK', () => reject(err))
          }

          if (this.changes === 0) {
            return db.run('ROLLBACK', () => resolve(null)) // Not found
          }

          db.run('DELETE FROM proposal_items WHERE proposal_id = ?', [id], (deleteErr) => {
            if (deleteErr) {
              return db.run('ROLLBACK', () => reject(deleteErr))
            }

            if (!items || items.length === 0) {
               return db.run('COMMIT', (commitErr) => {
                  if (commitErr) reject(commitErr)
                  else {
                     const selectQuery = `
                      SELECT
                        p.id, p.user_id as userId, u.name as userName, u.phone as userPhone,
                        p.title, p.total, p.document, p.name, p.contact, p.phone, p.operator,
                        p.created_at as createdAt, p.updated_at as updatedAt,
                        GROUP_CONCAT(pr.description, ', ') as products
                      FROM proposals p
                      JOIN users u ON u.id = p.user_id
                      LEFT JOIN proposal_items pi ON pi.proposal_id = p.id
                      LEFT JOIN products pr ON pr.id = pi.product_id
                      WHERE p.id = ?
                      GROUP BY p.id
                    `
                    db.get(selectQuery, [id], (selectErr, row) => {
                      if (selectErr) reject(selectErr)
                      else resolve(row)
                    })
                  }
               })
            }

            const insertItemQuery = `
              INSERT INTO proposal_items (proposal_id, product_id, quantity, unit_price, line) VALUES (?, ?, ?, ?, ?)
            `
            let remaining = items.length
            let hasError = false

            items.forEach((item) => {
              if (hasError) return
              const { productId, quantity, unitPrice, line } = item

              db.run(insertItemQuery, [id, productId, quantity, unitPrice, line || null], (itemErr) => {
                if (itemErr) {
                  hasError = true
                  return db.run('ROLLBACK', () => reject(itemErr))
                }

                remaining -= 1
                if (remaining === 0) {
                  db.run('COMMIT', (commitErr) => {
                    if (commitErr) reject(commitErr)
                    else {
                      const selectQuery = `
                        SELECT
                          p.id, p.user_id as userId, u.name as userName, u.phone as userPhone,
                          p.title, p.total, p.document, p.name, p.contact, p.phone, p.operator,
                          p.created_at as createdAt, p.updated_at as updatedAt,
                          GROUP_CONCAT(pr.description, ', ') as products
                        FROM proposals p
                        JOIN users u ON u.id = p.user_id
                        LEFT JOIN proposal_items pi ON pi.proposal_id = p.id
                        LEFT JOIN products pr ON pr.id = pi.product_id
                        WHERE p.id = ?
                        GROUP BY p.id
                      `
                      db.get(selectQuery, [id], (selectErr, row) => {
                        if (selectErr) reject(selectErr)
                        else resolve(row)
                      })
                    }
                  })
                }
              })
            })
          })
        })
      })
    })
  }
}

export default new ProposalRepository()
