import db from '../database/db.js'

class UserRepository {
  findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, email, phone, office FROM users',
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        },
      )
    })
  }

  create(user) {
    const { name, email, phone, office } = user
    return new Promise((resolve, reject) => {
      const query =
        'INSERT INTO users (name, email, phone, office) VALUES (?, ?, ?, ?)'
      db.run(
        query,
        [name, email, phone || null, office || null],
        function (err) {
          if (err) reject(err)
          else resolve({ id: this.lastID, name, email, phone, office })
        },
      )
    })
  }

  update(id, user) {
    const { name, email, phone, office } = user
    return new Promise((resolve, reject) => {
      const query =
        'UPDATE users SET name = ?, email = ?, phone = ?, office = ? WHERE id = ?'
      db.run(
        query,
        [name, email, phone || null, office || null, id],
        function (err) {
          if (err) reject(err)
          else resolve({ id, name, email, phone, office })
        },
      )
    })
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, phone, office FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err)
          else resolve(row)
        },
      )
    })
  }
}

const userRepository = new UserRepository()
export default userRepository
