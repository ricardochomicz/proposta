export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

type ToastListener = (toasts: ToastMessage[]) => void

class ToastService {
  private static instance: ToastService
  private toasts: ToastMessage[] = []
  private listeners: ToastListener[] = []

  private constructor() {}

  public static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService()
    }
    return ToastService.instance
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.push(listener)
    // Initial call
    listener(this.toasts)
    
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.toasts))
  }

  public add(type: ToastType, message: string, title?: string, duration = 5000): void {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: ToastMessage = { id, type, message, title, duration }
    
    this.toasts.push(toast)
    this.notify()

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }
  }

  public remove(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.notify()
  }

  public success(message: string, title = 'Sucesso'): void {
    this.add('success', message, title)
  }

  public error(message: string, title = 'Erro'): void {
    this.add('error', message, title)
  }

  public info(message: string, title = 'Informação'): void {
    this.add('info', message, title)
  }

  public warning(message: string, title = 'Atenção'): void {
    this.add('warning', message, title)
  }
}

export const toast = ToastService.getInstance()
