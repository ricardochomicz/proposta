import userService from '../../services/UserService.js'

class UserController {
  async index(req, res) {
    const users = await userService.findAll()
    res.json(users)
  }

  async create(req, res) {
    const newUser = await userService.create(req.body)
    res.status(201).json(newUser)
  }

  async update(req, res) {
    const { id } = req.params
    const updatedUser = await userService.update(id, req.body)
    res.json(updatedUser)
  }
}

const userController = new UserController()
export default userController
