import { useEffect, useState } from 'react'
import { toast, type ToastMessage } from '../services/ToastService'

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const unsubscribe = toast.subscribe((currentToasts) => {
      setToasts([...currentToasts])
    })
    return unsubscribe
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast show align-items-center text-bg-${getVariant(
            t.type
          )} border-0 mb-2`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              {t.title && <div className="fw-bold mb-1">{t.title}</div>}
              {t.message}
            </div>
            <button
              type="button"
              className={`btn-close ${
                ['warning', 'info', 'light'].includes(getVariant(t.type))
                  ? ''
                  : 'btn-close-white'
              } me-2 m-auto`}
              data-bs-dismiss="toast"
              aria-label="Close"
              onClick={() => toast.remove(t.id)}
            ></button>
          </div>
        </div>
      ))}
    </div>
  )
}

function getVariant(type: string) {
  switch (type) {
    case 'success':
      return 'success'
    case 'error':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'primary'
  }
}
