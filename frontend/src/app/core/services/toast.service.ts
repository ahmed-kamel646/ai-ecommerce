import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  leaving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'success', duration = 3500) {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.toasts.update(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 350);
  }
}
