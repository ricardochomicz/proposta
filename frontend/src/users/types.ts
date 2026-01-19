export type User = {
  id: number
  name: string
  email: string
  phone: string | null
  office: string | null
}

export type CreateUserInput = {
  name: string
  email: string
  phone?: string | null
  office?: string | null
}

