const API = "http://localhost:3000/api/todos";

export type Status = "TODO" | "IN_PROGRESS" | "DONE";
export type Todo = { id: number; title: string; status: Status };

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Failed to load todos");
  return res.json();
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, status: "TODO" }),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function updateTodo(id: number, changes: Partial<Todo>): Promise<Todo> {
  const res = await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete todo");
}