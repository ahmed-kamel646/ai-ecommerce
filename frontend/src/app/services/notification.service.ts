import { Injectable, signal } from '@angular/core';

export interface Notice {
  id: number;
  level: 'info' | 'error' | 'success';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notices = signal<Notice[]>([]);
  notices = this._notices.asReadonly();
  private nextId = 1;

  push(level: Notice['level'], message: string, ttlMs = 4000) {
    const id = this.nextId++;
    this._notices.update(list => [...list, { id, level, message }]);
    setTimeout(() => this.dismiss(id), ttlMs);
  }

  dismiss(id: number) {
    this._notices.update(list => list.filter(n => n.id !== id));
  }
}
