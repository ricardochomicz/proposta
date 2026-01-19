import userRepository from '../repositories/UserRepository.js'
import AppError from '../utils/AppError.js'

class UserService {
  async findAll() {
    return await userRepository.findAll()
  }

  async create(userData) {
    const { name, email } = userData
    if (!name || !email) {
      throw new AppError('Nome e e-mail são obrigatórios')
    }
    return await userRepository.create(userData)
  }

  async update(id, userData) {
    const { name, email } = userData
    if (!name || !email) {
      throw new AppError('Nome e e-mail são obrigatórios')
    }
    return await userRepository.update(id, userData)
  }
}

const userService = new UserService()
export default userService
