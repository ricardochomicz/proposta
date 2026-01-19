import { useState } from 'react'
import { UsersSection } from './users/UsersSection'
import { ProductsSection } from './products/ProductsSection'
import { ProposalsSection } from './proposals/ProposalsSection'
import { ToastContainer } from './components/ToastContainer'

type Section = 'users' | 'products' | 'proposals'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('proposals')

  const sections: { id: Section; label: string }[] = [
    { id: 'users', label: 'Usuários' },
    { id: 'products', label: 'Produtos' },
    { id: 'proposals', label: 'Propostas' },
  ]

  return (
    <div className="min-vh-100 py-4">
      <div className="container">
        <header className="mb-4">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h4 mb-1">Gestão de Propostas</h1>
                <p className="text-muted small mb-0">
                  Organize usuários, produtos e propostas em um só lugar.
                </p>
              </div>
              <span className="badge rounded-pill text-bg-primary">
                Painel administrativo
              </span>
            </div>
          </div>
        </header>

        <nav className="mb-4">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body py-2">
              <ul className="nav nav-pills">
                {sections.map((section) => {
                  const isActive = activeSection === section.id

                  return (
                    <li className="nav-item me-2" key={section.id}>
                      <button
                        type="button"
                        className={`nav-link small ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        {section.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </nav>

        <main className="mb-4">
          {activeSection === 'users' && <UsersSection />}

          {activeSection === 'products' && <ProductsSection />}

          {activeSection === 'proposals' && <ProposalsSection />}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

export default App
