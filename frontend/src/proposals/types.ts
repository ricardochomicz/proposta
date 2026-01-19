export type ProposalItemInput = {
  productId: number
  quantity: number
  unitPrice: number
  line?: string
}

export type ProposalItemDetail = {
  id: number
  productId: number
  line: string | number | null
  quantity: number
  unitPrice: number
  description: string
  operator: string
}

export type CreateProposalInput = {
  userId: number
  title?: string
  total: number
  document: string
  name: string
  contact?: string
  phone?: string
  operator?: string
  items: ProposalItemInput[]
}

export type Proposal = {
  id: number
  userId: number
  userName: string
  userPhone: string | null
  title: string | null
  total: number
  createdAt: string
  document: string
  name: string
  contact: string | null
  phone: string | null
  operator: string | null
  products: string | null
  updatedAt: string
}
