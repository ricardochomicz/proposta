import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { createUser, deleteUser, listUsers, updateUser } from './userService'
import type { User } from './types'
import { toast } from '../services/ToastService'

export function UsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [office, setOffice] = useState('')

  const loadUsers = async () => {
    try {
      setLoading(true)

      const data = await listUsers()
      setUsers(data)
    } catch {
      toast.error('Não foi possível carregar os usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')

    // 99 9 9999-9999
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 3) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`
    if (numbers.length <= 7)
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 3)} ${numbers.slice(3)}`

    return `${numbers.slice(0, 2)} ${numbers.slice(2, 3)} ${numbers.slice(
      3,
      7
    )}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(event.target.value))
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone || '')
    setOffice(user.office || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setEmail('')
    setPhone('')
    setOffice('')
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
  }

  const handleCloseDeleteModal = () => {
    if (loading) return
    setUserToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      setLoading(true)
      await deleteUser(userToDelete.id)
      setUsers((previous) =>
        previous.filter((user) => user.id !== userToDelete.id)
      )
      toast.success('Usuário excluído com sucesso')

      if (editingId === userToDelete.id) {
        handleCancelEdit()
      }
    } catch {
      toast.error('Não foi possível excluir o usuário')
    } finally {
      setLoading(false)
      setUserToDelete(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast.warning('Nome e e-mail são obrigatórios')
      return
    }

    try {
      setLoading(true)

      if (editingId) {
        const updated = await updateUser(editingId, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          office: office.trim() || null,
        })

        setUsers((previous) =>
          previous.map((u) => (u.id === editingId ? updated : u))
        )
        toast.success('Usuário atualizado com sucesso')
        handleCancelEdit()
      } else {
        const created = await createUser({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          office: office.trim() || null,
        })

        setUsers((previous) => [...previous, created])
        toast.success('Usuário criado com sucesso')
        setName('')
        setEmail('')
        setPhone('')
        setOffice('')
      }
    } catch {
      toast.error(
        editingId
          ? 'Erro ao atualizar usuário'
          : 'Não foi possível criar o usuário'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 className="h5 mb-1">Usuários</h2>
          <p className="text-muted small mb-0">
            Cadastre usuários que poderão receber propostas.
          </p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
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
            <div className="col-md-6">
              <div className="mb-3 form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="form-control"
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3 form-group">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="form-control"
                  placeholder="Ex: joao@email.com"
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3 form-group">
                <label className="form-label">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="form-control"
                  placeholder="99 9 9999-9999"
                  maxLength={16}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3 form-group">
                <label className="form-label">Cargo</label>
                <input
                  type="text"
                  value={office}
                  onChange={(event) => setOffice(event.target.value)}
                  className="form-control"
                  placeholder="Ex: Gerente de Vendas"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div></div>

            <div className="d-flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={loading}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {editingId ? 'Salvar alterações' : 'Salvar usuário'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {loading && !users.length && (
        <p className="text-muted small">Carregando usuários...</p>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="table-responsive mb-0">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Cargo</th>
                  <th className="text-end" style={{ width: '100px' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.office || '-'}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(user)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user)}
                        title="Excluir"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && !loading && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Nenhum usuário cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {userToDelete && (
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
                    Tem certeza que deseja excluir o usuário{' '}
                    <strong>{userToDelete.name}</strong>?
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
