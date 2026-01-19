import { useEffect, useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
} from './productService'
import type { Product } from './types'
import { toast } from '../services/ToastService'
import { formatPrice, getNumericPrice } from '../utils/formatMoney'

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [operator, setOperator] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [filterOperator, setFilterOperator] = useState('')
  const [filterDescription, setFilterDescription] = useState('')

  const loadProducts = async () => {
    try {
      setLoading(true)

      const data = await listProducts()
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setPrice(formatPrice(value))
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setOperator(product.operator)
    setDescription(product.description)
    setPrice(formatPrice(product.price.toString()))
  }

  const handleCancel = () => {
    setEditingId(null)
    setOperator('')
    setDescription('')
    setPrice('')
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
  }

  const handleCloseDeleteModal = () => {
    if (loading) return
    setProductToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    try {
      setLoading(true)
      await deleteProduct(productToDelete.id)
      setProducts((previous) =>
        previous.filter((product) => product.id !== productToDelete.id),
      )
      toast.success('Produto excluído com sucesso')

      if (editingId === productToDelete.id) {
        handleCancel()
      }
    } finally {
      setLoading(false)
      setProductToDelete(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!operator.trim() || !description.trim() || !price.trim()) {
      toast.warning('Operadora, descrição e preço são obrigatórios')
      return
    }

    const numericPrice = getNumericPrice(price)

    if (Number.isNaN(numericPrice)) {
      toast.warning('Preço inválido')
      return
    }

    try {
      setLoading(true)

      if (editingId) {
        const update = await updateProduct(editingId, {
          operator: operator.trim(),
          description: description.trim(),
          price: numericPrice,
        })

        setProducts((previous) =>
          previous.map((product) =>
            product.id === update.id ? update : product,
          ),
        )
        toast.success('Produto atualizado com sucesso')
        handleCancel()
      } else {
        const created = await createProduct({
          operator: operator.trim(),
          description: description.trim(),
          price: numericPrice,
        })
        setProducts((previous) => [...previous, created])
        toast.success('Produto criado com sucesso')
        setOperator('')
        setDescription('')
        setPrice('')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesOperator =
      !filterOperator || product.operator === filterOperator

    const matchesDescription =
      !filterDescription ||
      product.description
        .toLowerCase()
        .includes(filterDescription.toLowerCase())

    return matchesOperator && matchesDescription
  })

  return (
    <section className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 className="h5 mb-1">Produtos</h2>
          <p className="text-muted small mb-0">
            Cadastre produtos para montar propostas de forma rápida.
          </p>
        </div>
        <button
          type="button"
          onClick={loadProducts}
          disabled={loading}
          className="btn btn-outline-primary btn-sm"
        >
          Atualizar
        </button>
      </div>

      <form
        className="card border-0 shadow-sm rounded-3 mb-4"
        onSubmit={handleSubmit}
      >
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3 form-group">
                <label className="form-label">Operadora</label>
                <select
                  value={operator}
                  onChange={(event) => setOperator(event.target.value)}
                  className="form-select"
                >
                  <option value="">Selecione a operadora</option>
                  <option value="Claro">Claro</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Tim">Tim</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3 form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="col-md-4 col-lg-3">
              <div className="mb-3 form-group">
                <label className="form-label">Preço</label>
                <input
                  type="text"
                  value={price}
                  onChange={handlePriceChange}
                  className="form-control"
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div></div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              Salvar produto
            </button>
          </div>
        </div>
      </form>

      {loading && !products.length && (
        <p className="text-muted small">Carregando produtos...</p>
      )}

      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label mb-1">Filtrar por operadora</label>
              <select
                value={filterOperator}
                onChange={(event) => setFilterOperator(event.target.value)}
                className="form-select form-select-sm"
              >
                <option value="">Todas</option>
                <option value="Claro">Claro</option>
                <option value="Vivo">Vivo</option>
                <option value="Tim">Tim</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label mb-1">Buscar por descrição</label>
              <input
                type="text"
                value={filterDescription}
                onChange={(event) => setFilterDescription(event.target.value)}
                className="form-control form-control-sm"
                placeholder="Digite parte da descrição"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="table-responsive mb-0">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Operadora</th>
                  <th>Descrição</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.operator}</td>
                    <td>{product.description}</td>
                    <td>
                      {product.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(product)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product)}
                        title="Excluir"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredProducts.length && !loading && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      Nenhum produto cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {productToDelete && (
        <>
          <div
            className="modal fade show"
            tabIndex={-1}
            style={{ display: 'block' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmar exclusão</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseDeleteModal}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">
                    Tem certeza que deseja excluir o produto{' '}
                    <strong>{productToDelete.description}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseDeleteModal}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDelete}
                    disabled={loading}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </section>
  )
}
