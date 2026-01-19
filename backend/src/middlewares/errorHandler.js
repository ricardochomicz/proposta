import AppError from '../utils/AppError.js'

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message, // Mantendo o padrão { error: "mensagem" } que o frontend espera
    })
  }

  console.error(err)

  return res.status(500).json({
    error: 'Internal server error',
  })
}
