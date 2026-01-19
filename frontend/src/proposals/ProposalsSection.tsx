import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { listUsers } from '../users/userService'
import type { User } from '../users/types'
import { listProducts } from '../products/productService'
import type { Product } from '../products/types'
import {
  createProposal,
  listProposals,
  listProposalItems,
  deleteProposal,
  updateProposal,
} from './proposalService'
import type { Proposal, ProposalItemDetail } from './types'
import { toast } from '../services/ToastService'

type DraftItem = {
  productId: number
  quantity: number
  line?: string
  unitPrice?: number
}

export function ProposalsSection() {
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [title, setTitle] = useState('')
  const [documentValue, setDocumentValue] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [proposalOperator, setProposalOperator] = useState('')
  const [draftLine, setDraftLine] = useState('')
  const [draftUnitPrice, setDraftUnitPrice] = useState('')
  const [draftProductId, setDraftProductId] = useState<number | ''>('')
  const [draftQuantity, setDraftQuantity] = useState('1')
  const [items, setItems] = useState<DraftItem[]>([])
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(
    null,
  )
  const [editingProposalId, setEditingProposalId] = useState<number | null>(
    null,
  )

  const loadInitialData = async () => {
    setLoading(true)

    try {
      const [usersResult, productsResult, proposalsResult] =
        await Promise.allSettled([listUsers(), listProducts(), listProposals()])

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value)
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value)
      }

      if (proposalsResult.status === 'fulfilled') {
        setProposals(proposalsResult.value)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')

    if (numbers.length <= 2) return numbers
    if (numbers.length <= 3) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`
    if (numbers.length <= 7)
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 3)} ${numbers.slice(3)}`

    return `${numbers.slice(0, 2)} ${numbers.slice(2, 3)} ${numbers.slice(
      3,
      7,
    )}-${numbers.slice(7, 11)}`
  }

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 14)

    if (numbers.length <= 11) {
      if (numbers.length <= 3) return numbers
      if (numbers.length <= 6)
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
      if (numbers.length <= 9)
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
          6,
        )}`

      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6,
        9,
      )}-${numbers.slice(9, 11)}`
    }

    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    if (numbers.length <= 8)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    if (numbers.length <= 12)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5,
        8,
      )}/${numbers.slice(8)}`

    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8,
    )}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
  }

  const formatLine = (value: string) => {
    return formatPhone(value)
  }

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '')

    if (!numbers) return ''

    const numericValue = Number(numbers) / 100

    if (Number.isNaN(numericValue)) return ''

    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const getNumericPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '')

    if (!numbers) return Number.NaN

    return Number(numbers) / 100
  }

  const handleUserChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSelectedUserId(value ? Number(value) : '')
  }

  const handleDraftProductChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const id = value ? Number(value) : ''
    setDraftProductId(id || '')

    if (!id) {
      setDraftUnitPrice('')
      return
    }

    const product = filteredProducts.find((p) => p.id === id)
    if (!product) {
      setDraftUnitPrice('')
      return
    }

    setDraftUnitPrice(formatPrice(product.price.toString()))
  }

  const handleDraftQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '')
    setDraftQuantity(value || '1')
  }

  const handleDraftLineChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftLine(formatLine(event.target.value))
  }

  const handleDraftUnitPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setDraftUnitPrice(formatPrice(value))
  }

  const handleDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDocumentValue(formatDocument(event.target.value))
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(event.target.value))
  }

  const resetForm = () => {
    setSelectedUserId('')
    setTitle('')
    setDocumentValue('')
    setCustomerName('')
    setContact('')
    setPhone('')
    setProposalOperator('')
    setDraftProductId('')
    setDraftQuantity('1')
    setDraftLine('')
    setDraftUnitPrice('')
    setItems([])
    setEditingProposalId(null)
  }

  const handleAddItem = () => {
    if (!draftProductId) {
      toast.warning('Selecione um produto para adicionar')
      return
    }

    const quantityNumber = Number(draftQuantity)

    if (!draftQuantity || Number.isNaN(quantityNumber) || quantityNumber <= 0) {
      toast.warning('Informe uma quantidade válida')
      return
    }

    const numericUnitPrice = getNumericPrice(draftUnitPrice)

    if (Number.isNaN(numericUnitPrice) || numericUnitPrice <= 0) {
      toast.warning('Informe um valor de produto válido')
      return
    }

    const normalizedDraftLine = draftLine || ''
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === draftProductId &&
        (item.line || '') === normalizedDraftLine,
    )

    if (existingIndex >= 0) {
      const updated = [...items]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantityNumber,
        unitPrice: numericUnitPrice,
      }
      setItems(updated)
    } else {
      setItems((previous) => [
        ...previous,
        {
          productId: draftProductId,
          quantity: quantityNumber,
          line: normalizedDraftLine,
          unitPrice: numericUnitPrice,
        },
      ])
    }

    setDraftLine('')
    setDraftUnitPrice('')
    setDraftProductId('')
    setDraftQuantity('1')
  }

  const handleRemoveItem = (productId: number, line?: string) => {
    const normalizedLine = line || ''
    setItems((previous) =>
      previous.filter(
        (item) =>
          !(
            item.productId === productId && (item.line || '') === normalizedLine
          ),
      ),
    )
  }

  const handleEditProposal = async (proposal: Proposal) => {
    setEditingProposalId(proposal.id)
    setSelectedUserId(proposal.userId)
    setTitle(proposal.title || '')
    setDocumentValue(proposal.document)
    setCustomerName(proposal.name)
    setContact(proposal.contact || '')
    setPhone(proposal.phone || '')
    setProposalOperator(proposal.operator || '')

    try {
      setLoading(true)
      const proposalItems = await listProposalItems(proposal.id)

      setItems(
        proposalItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          line: item.line ? formatLine(String(item.line)) : '',
          unitPrice: item.unitPrice,
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    if (!proposalOperator) return products
    return products.filter((product) => product.operator === proposalOperator)
  }, [products, proposalOperator])

  const itemsWithDetails = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return null

        const unitPrice = item.unitPrice ?? product.price
        const subtotal = unitPrice * item.quantity

        return {
          productId: item.productId,
          quantity: item.quantity,
          line: item.line,
          product,
          unitPrice,
          subtotal,
        }
      })
      .filter(Boolean) as {
      productId: number
      quantity: number
      line?: string
      product: Product
      unitPrice: number
      subtotal: number
    }[]
  }, [items, products])

  const total = useMemo(() => {
    return itemsWithDetails.reduce((acc, item) => acc + item.subtotal, 0)
  }, [itemsWithDetails])

  const handleDeleteProposalClick = (proposal: Proposal) => {
    setProposalToDelete(proposal)
  }

  const handleCloseDeleteModal = () => {
    if (loading) return
    setProposalToDelete(null)
  }

  const handleConfirmDeleteProposal = async () => {
    if (!proposalToDelete) return

    try {
      setLoading(true)
      await deleteProposal(proposalToDelete.id)
      setProposals((previous) =>
        previous.filter((proposal) => proposal.id !== proposalToDelete.id),
      )
      toast.success('Proposta excluída com sucesso')
    } finally {
      setLoading(false)
      setProposalToDelete(null)
    }
  }

  const handlePrintProposal = async (proposal: Proposal) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão')
      return
    }

    let proposalItems: ProposalItemDetail[] = []

    try {
      proposalItems = await listProposalItems(proposal.id)
    } catch {
      // Itens vazios em caso de erro (já notificado pelo interceptor)
    }

    const doc = printWindow.document

    const formattedTotal = proposal.total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    const formattedDate = new Date(proposal.updatedAt).toLocaleString('pt-BR')

    const rowsHtml =
      proposalItems.length > 0
        ? proposalItems
            .map((item, index) => {
              const lineNumber =
                item.line != null && item.line !== ''
                  ? String(item.line)
                  : String(index + 1)

              const formattedUnitPrice = item.unitPrice.toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL',
                },
              )

              return `
                <tr>
                  <td>${lineNumber}</td>
                  <td>${item.description}</td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: right">${formattedUnitPrice}</td>
                </tr>
              `
            })
            .join('')
        : `
          <tr>
            <td colspan="4" style="text-align: center; color: #6b7280">
              Nenhum item encontrado
            </td>
          </tr>
        `

    doc.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Proposta #${proposal.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin: 16px 0 8px; }
            p { margin: 2px 0; font-size: 13px; }
            small { color: #6b7280; }
            .section { margin-bottom: 16px; }
            .divider { border-top: 1px solid #e5e7eb; margin: 16px 0; }
            .label { font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="section">
            <h1>Proposta #${proposal.id}</h1>
            <p><span class="label">Título:</span> ${proposal.title || '-'}</p>
            <p><span class="label">Atualizado em:</span> ${formattedDate}</p>
          </div>

          <div class="divider"></div>

          <div class="section">
            <h2>Dados da empresa</h2>
            <p><span class="label">Nome:</span> ${proposal.name}</p>
            <p><span class="label">Documento:</span> ${proposal.document}</p>
            <p><span class="label">Contato:</span> ${
              proposal.contact || '-'
            }</p>
            <p><span class="label">Telefone:</span> ${proposal.phone || '-'}</p>
            <p><span class="label">Operadora:</span> ${
              proposal.operator || '-'
            }</p>
          </div>

          <div class="section">
            <h2>Vendedor</h2>
            <p><span class="label">Nome:</span> ${proposal.userName}</p>
            <p><span class="label">Telefone:</span> ${
              proposal.userPhone || '-'
            }</p>
          </div>

          <div class="divider"></div>

          <div class="section">
            <h2>Resumo</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
              <thead>
                <tr>
                  <th style="border-bottom: 1px solid #e5e7eb; text-align: left; padding: 4px;">Linha</th>
                  <th style="border-bottom: 1px solid #e5e7eb; text-align: left; padding: 4px;">Produto</th>
                  <th style="border-bottom: 1px solid #e5e7eb; text-align: center; padding: 4px;">Qtd</th>
                  <th style="border-bottom: 1px solid #e5e7eb; text-align: right; padding: 4px;">Valor unitário</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            <p style="margin-top: 12px;"><span class="label">Total:</span> ${formattedTotal}</p>
          </div>
        </body>
      </html>
    `)

    doc.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleShareWhatsApp = async (proposal: Proposal) => {
    try {
      setLoading(true)
      const proposalItems = await listProposalItems(proposal.id)

      const lines: string[] = []
      lines.push('PROPOSTA COMERCIAL')
      lines.push('------------------------------')
      lines.push('PRODUTO')
      lines.push('LINHA          QTD  R$ UNIT')

      proposalItems.forEach((item, index) => {
        const title = `${item.operator} ${item.description}`.toUpperCase()
        const lineNumber =
          item.line != null && item.line !== ''
            ? String(item.line)
            : String(index + 1)
        const qty = String(item.quantity).padStart(3)
        const priceStr = item.unitPrice.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        const price = priceStr.padStart(10)

        lines.push(title)
        lines.push(`${lineNumber.padEnd(13)} ${qty} ${price}`)
      })

      const totalBold = `*TOTAL GERAL: ${proposal.total.toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        },
      )}*`
      const message = ['```', ...lines, '```', '', totalBold].join('\n')

      try {
        await navigator.clipboard.writeText(message)
        toast.success('Cupom copiado para a área de transferência')
      } catch {
        toast.error('Não foi possível copiar o cupom')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedUserId) {
      toast.warning('Selecione um usuário para a proposta')
      return
    }

    if (!documentValue.trim() || !customerName.trim()) {
      toast.warning('Documento e nome são obrigatórios')
      return
    }

    if (itemsWithDetails.length === 0) {
      toast.warning('Adicione pelo menos um produto à proposta')
      return
    }

    if (total <= 0) {
      toast.warning('Total da proposta deve ser maior que zero')
      return
    }

    try {
      setLoading(true)

      const input = {
        userId: Number(selectedUserId),
        title: title.trim() || undefined,
        total,
        document: documentValue.trim(),
        name: customerName.trim(),
        contact: contact.trim() || undefined,
        phone: phone.trim() || undefined,
        operator: proposalOperator || undefined,
        items: itemsWithDetails.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          line: item.line ? item.line.replace(/\D/g, '') : undefined,
        })),
      }

      if (editingProposalId) {
        const updated = await updateProposal(editingProposalId, input)

        setProposals((previous) =>
          previous.map((proposal) =>
            proposal.id === editingProposalId ? updated : proposal,
          ),
        )
        toast.success('Proposta atualizada com sucesso')
      } else {
        const created = await createProposal(input)

        setProposals((previous) => [created, ...previous])
        toast.success('Proposta criada com sucesso')
      }

      resetForm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 className="h5 mb-1">Propostas</h2>
          <p className="text-muted small mb-0">
            Combine usuários e produtos para gerar propostas com valores
            calculados automaticamente.
          </p>
        </div>
        <button
          type="button"
          onClick={loadInitialData}
          disabled={loading}
          className="btn btn-outline-primary btn-sm"
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Atualizar
        </button>
      </div>

      <form
        className="card border-0 shadow-sm rounded-3 mb-4"
        onSubmit={handleSubmit}
      >
        <div className="card-body">
          <div className="row">
            <div className="col-md-5">
              <div className="mb-3 form-group">
                <label className="form-label">Usuário</label>
                <select
                  value={selectedUserId || ''}
                  onChange={handleUserChange}
                  className="form-select"
                >
                  <option value="">Selecione um usuário</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="mb-3 form-group">
                <label className="form-label">Operadora</label>
                <select
                  value={proposalOperator}
                  onChange={(event) => {
                    setProposalOperator(event.target.value)
                    setDraftProductId('')
                  }}
                  className="form-select"
                >
                  <option value="">Selecione uma operadora</option>
                  <option value="Claro">Claro</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Tim">Tim</option>
                </select>
              </div>
            </div>

            <div className="col-md-5">
              <div className="mb-3 form-group">
                <label className="form-label">Título da proposta</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="form-control"
                  placeholder="Ex: Proposta Plano Empresarial"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-2">
              <div className="mb-3 form-group">
                <label className="form-label">Documento</label>
                <input
                  type="text"
                  value={documentValue}
                  onChange={handleDocumentChange}
                  className="form-control"
                  placeholder="Ex: 000.000.000-00"
                />
              </div>
            </div>

            <div className="col-md-5">
              <div className="mb-3 form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="form-control"
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="mb-3 form-group">
                <label className="form-label">Contato</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="form-control"
                  placeholder="Pessoa de contato"
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="mb-3 form-group">
                <label className="form-label">Fone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="form-control"
                  placeholder="99 9 9999-9999"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-3 p-3 mb-3">
            <div className="row align-items-end g-3">
              <div className="col-md-2 col-lg-2">
                <label className="form-label">Linha</label>
                <input
                  type="text"
                  value={draftLine}
                  onChange={handleDraftLineChange}
                  className="form-control"
                  placeholder="00 0 0000-0000"
                />
              </div>
              <div className="col-md-4 col-lg-5">
                <label className="form-label">Produto</label>
                <select
                  value={draftProductId || ''}
                  onChange={handleDraftProductChange}
                  className="form-select"
                >
                  <option value="">Selecione um produto</option>
                  {filteredProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.operator} - {product.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2 col-lg-2">
                <label className="form-label">Valor unitário</label>
                <input
                  type="text"
                  value={draftUnitPrice}
                  onChange={handleDraftUnitPriceChange}
                  className="form-control"
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="col-md-2 col-lg-2">
                <label className="form-label">Quantidade</label>
                <input
                  type="text"
                  value={draftQuantity}
                  onChange={handleDraftQuantityChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-2 col-lg-2 d-grid">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleAddItem}
                  disabled={loading}
                >
                  Adicionar
                </button>
              </div>
            </div>

            {itemsWithDetails.length > 0 && (
              <div className="table-responsive mt-3 mb-0">
                <table className="table table-sm table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Operadora</th>
                      <th>Linha</th>
                      <th>Produto</th>
                      <th className="text-center">Qtd</th>
                      <th className="text-end">Valor unitário</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-end" style={{ width: '80px' }}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsWithDetails.map((item) => (
                      <tr key={`${item.productId}-${item.line || ''}`}>
                        <td>{item.product.operator}</td>
                        <td>{item.line || '-'}</td>
                        <td>{item.product.description}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">
                          {item.unitPrice.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </td>
                        <td className="text-end">
                          {item.subtotal.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleRemoveItem(item.productId, item.line)
                            }
                            disabled={loading}
                            title="Remover item"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={5} className="text-end fw-semibold">
                        Total
                      </td>
                      <td className="text-end fw-semibold">
                        {total.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {itemsWithDetails.length === 0 && (
              <p className="text-muted small mb-0 mt-2">
                Nenhum item adicionado ainda. Selecione um produto e quantidade
                para começar.
              </p>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              {editingProposalId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancelar edição
                </button>
              )}
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {editingProposalId ? 'Salvar alterações' : 'Salvar proposta'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <h3 className="h6 mb-3">Propostas cadastradas</h3>

          <div className="table-responsive mb-0">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Operadora</th>
                  <th className="text-end">Total</th>
                  <th>Atualizado em</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>{proposal.id}</td>
                    <td>
                      {proposal.name}
                      <br />
                      <small>{proposal.document}</small>
                    </td>
                    <td>
                      {proposal.contact || '-'}
                      <br />
                      <small>{proposal.phone || '-'}</small>
                    </td>
                    <td>{proposal.operator || '-'}</td>

                    <td className="text-end">
                      {proposal.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>

                    <td>
                      {new Date(proposal.updatedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleEditProposal(proposal)}
                          disabled={loading}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handlePrintProposal(proposal)}
                          disabled={loading}
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() => handleShareWhatsApp(proposal)}
                          disabled={loading}
                        >
                          Copiar cupom
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteProposalClick(proposal)}
                          disabled={loading}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!proposals.length && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      Nenhuma proposta cadastrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {proposalToDelete && (
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
                    Tem certeza que deseja excluir a proposta{' '}
                    <strong>#{proposalToDelete.id}</strong> de{' '}
                    <strong>{proposalToDelete.name}</strong>?
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
                    onClick={handleConfirmDeleteProposal}
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
