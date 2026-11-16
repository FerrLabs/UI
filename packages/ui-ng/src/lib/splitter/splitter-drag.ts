export class DragTracker<T extends { readonly pointerId: number }> {
  private session: T | null = null;

  get current(): T | null {
    return this.session;
  }

  begin(session: T): void {
    this.session = session;
  }

  abort(): T | null {
    const session = this.session;
    this.session = null;
    return session;
  }

  end(pointerId: number): T | null {
    const session = this.session;
    if (!session || session.pointerId !== pointerId) return null;
    this.session = null;
    return session;
  }
}
