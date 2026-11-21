/**
 * Todo endpoints (all need the token; each user only sees their own todos).
 * `deleted` is a soft-delete status; `remove()` deletes permanently.
 */
export function useTodosApi() {
  const { $api } = useNuxtApp()

  return {
    list: (status?: TodoStatus) =>
      $api<{ message: string, count: number, todos: Todo[] }>('/todos', { query: status ? { status } : undefined }),

    create: (title: string, description?: string | null) =>
      $api<{ message: string, todo: Todo }>('/todos', { method: 'POST', body: { title, description } }),

    update: (id: string, changes: TodoUpdate) =>
      $api<{ message: string, todo: Todo }>(`/todos/${id}`, { method: 'PUT', body: changes }),

    remove: (id: string) =>
      $api<{ message: string, deletedTodo: Pick<Todo, 'id' | 'title' | 'status'> }>(`/todos/${id}`, { method: 'DELETE' }),
  }
}
