export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TodoFilter = "all" | "active" | "completed";

export function newId(): string {
  // Good enough for local-only app; avoids extra deps.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
