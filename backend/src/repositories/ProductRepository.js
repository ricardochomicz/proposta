import db from '../database/db.js'

class ProductRepository {
  findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, operator, description, price FROM products', (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  create(product) {
    const { operator, description, price } = product
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO products (operator, description, price) VALUES (?, ?, ?)'
      db.run(query, [operator, description, price], function (err) {
        if (err) reject(err)
        else resolve({ id: this.lastID, operator, description, price })
      })
    })
  }

  update(id, product) {
    const { operator, description, price } = product
    return new Promise((resolve, reject) => {
      const query = 'UPDATE products SET operator = ?, description = ?, price = ? WHERE id = ?'
      db.run(query, [operator, description, price, id], function (err) {
        if (err) reject(err)
        else if (this.changes === 0) resolve(null) // Não encontrado
        else resolve({ id: Number(id), operator, description, price })
      })
    })
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, operator, description, price FROM products WHERE id = ?', [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) reject(err)
        else resolve(this.changes > 0)
      })
    })
  }
}

export default new ProductRepository()
