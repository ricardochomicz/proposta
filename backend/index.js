import express from 'express'
import cors from 'cors'
import './src/database/db.js' // Inicializa o banco
import { errorHandler } from './src/middlewares/errorHandler.js'

// Importação das rotas modularizadas
import userRouter from './src/controllers/users/index.js'
import productRouter from './src/controllers/products/index.js'
import proposalRouter from './src/controllers/proposals/index.js'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// Uso das rotas
app.use('/users', userRouter)
app.use('/products', productRouter)
app.use('/proposals', proposalRouter)

// Uso do middleware de tratamento de erros
app.use(errorHandler)

app.listen(port, () => {
  console.log(`API de orçamentos ouvindo na porta ${port}`)
})
