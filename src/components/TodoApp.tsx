"use client";

import * as React from "react";
import { Todo, TodoFilter, newId } from "@/lib/todo";
import { useLocalStorageState } from "@/lib/useLocalStorage";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function now() {
  return Date.now();
}

const STORAGE_KEY = "moltbot.todos.v1";

export default function TodoApp() {
  const { state: todos, setState: setTodos, hydrated } =
    useLocalStorageState<Todo[]>(STORAGE_KEY, []);

  const [filter, setFilter] = React.useState<TodoFilter>("all");
  const [draft, setDraft] = React.useState("");

  const activeCount = React.useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );
  const completedCount = todos.length - activeCount;

  const visibleTodos = React.useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const addTodo = React.useCallback(() => {
    const title = draft.trim();
    if (!title) return;
    const ts = now();
    const todo: Todo = {
      id: newId(),
      title,
      completed: false,
      createdAt: ts,
      updatedAt: ts,
    };
    setTodos([todo, ...todos]);
    setDraft("");
  }, [draft, setDraft, setTodos, todos]);

  const toggleTodo = React.useCallback(
    (id: string) => {
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed, updatedAt: now() } : t
        )
      );
    },
    [setTodos, todos]
  );

  const deleteTodo = React.useCallback(
    (id: string) => {
      setTodos(todos.filter((t) => t.id !== id));
    },
    [setTodos, todos]
  );

  const editTodo = React.useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) {
        deleteTodo(id);
        return;
      }
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, title: trimmed, updatedAt: now() } : t
        )
      );
    },
    [deleteTodo, setTodos, todos]
  );

  const clearCompleted = React.useCallback(() => {
    setTodos(todos.filter((t) => !t.completed));
  }, [setTodos, todos]);

  const toggleAll = React.useCallback(() => {
    const hasActive = todos.some((t) => !t.completed);
    setTodos(todos.map((t) => ({ ...t, completed: hasActive, updatedAt: now() })));
  }, [setTodos, todos]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <span className="text-lg font-semibold">✓</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Todo List</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  简洁、快速、离线可用（本地保存）。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleAll}
              className={cx(
                "rounded-xl border px-3 py-2 text-sm font-medium transition",
                "border-zinc-200 bg-white hover:bg-zinc-50",
                "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              )}
              title="切换全部完成状态"
            >
              全选/全不选
            </button>
          </div>
        </header>

        <section
          className={cx(
            "rounded-2xl border bg-white p-4 shadow-sm",
            "border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex-1">
              <span className="sr-only">新增待办</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo();
                }}
                placeholder="添加一个待办事项…（Enter 提交）"
                className={cx(
                  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
                  "border-zinc-200 bg-white placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15",
                  "dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/15"
                )}
              />
            </label>

            <button
              type="button"
              onClick={addTodo}
              className={cx(
                "rounded-xl px-4 py-3 text-sm font-semibold text-white transition",
                "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
                "disabled:opacity-50"
              )}
              disabled={!draft.trim()}
            >
              添加
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                未完成：<span className="font-medium text-zinc-900 dark:text-zinc-100">{activeCount}</span>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span>
                已完成：<span className="font-medium text-zinc-900 dark:text-zinc-100">{completedCount}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>全部</FilterPill>
              <FilterPill active={filter === "active"} onClick={() => setFilter("active")}>未完成</FilterPill>
              <FilterPill active={filter === "completed"} onClick={() => setFilter("completed")}>已完成</FilterPill>

              <button
                type="button"
                onClick={clearCompleted}
                disabled={completedCount === 0}
                className={cx(
                  "ml-1 rounded-xl border px-3 py-2 text-sm font-medium transition",
                  "border-zinc-200 bg-white hover:bg-zinc-50",
                  "disabled:opacity-50",
                  "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                )}
              >
                清除已完成
              </button>
            </div>
          </div>
        </section>

        <section
          className={cx(
            "rounded-2xl border bg-white shadow-sm",
            "border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"
          )}
        >
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              提示：双击标题可编辑；编辑后按 Enter 保存，Esc 取消；清空输入将删除该条。
            </p>
          </div>

          {!hydrated ? (
            <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">加载中…</div>
          ) : visibleTodos.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">暂无待办。</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">添加一条试试。</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {visibleTodos.map((t) => (
                <TodoRow
                  key={t.id}
                  todo={t}
                  onToggle={() => toggleTodo(t.id)}
                  onDelete={() => deleteTodo(t.id)}
                  onEdit={(title) => editTodo(t.id, title)}
                />
              ))}
            </ul>
          )}
        </section>

        <footer className="pb-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          本应用使用本地存储（LocalStorage）。刷新不会丢失。
        </footer>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-emerald-600 text-white"
          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      )}
    >
      {children}
    </button>
  );
}

function TodoRow({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (title: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(todo.title);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!editing) return;
    setValue(todo.title);
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(t);
  }, [editing, todo.title]);

  return (
    <li className="group flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className={cx(
          "grid h-9 w-9 place-items-center rounded-xl border transition",
          todo.completed
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        )}
        aria-label={todo.completed ? "标记为未完成" : "标记为完成"}
      >
        {todo.completed ? "✓" : ""}
      </button>

      <div className="min-w-0 flex-1">
        {!editing ? (
          <button
            type="button"
            onDoubleClick={() => setEditing(true)}
            className={cx(
              "w-full text-left",
              "text-sm font-medium",
              todo.completed
                ? "text-zinc-400 line-through dark:text-zinc-500"
                : "text-zinc-900 dark:text-zinc-50"
            )}
            title="双击编辑"
          >
            <span className="block truncate">{todo.title}</span>
          </button>
        ) : (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEdit(value);
                setEditing(false);
              }
              if (e.key === "Escape") {
                setValue(todo.title);
                setEditing(false);
              }
            }}
            onBlur={() => {
              onEdit(value);
              setEditing(false);
            }}
            className={cx(
              "w-full rounded-xl border px-3 py-2 text-sm outline-none transition",
              "border-zinc-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15",
              "dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/15"
            )}
          />
        )}

        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          {todo.completed ? "已完成" : "进行中"} · {formatTime(todo.updatedAt)}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cx(
          "hidden rounded-xl border px-3 py-2 text-xs font-medium transition sm:inline-flex",
          "border-zinc-200 bg-white hover:bg-zinc-50",
          "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800",
          "group-hover:inline-flex"
        )}
      >
        编辑
      </button>

      <button
        type="button"
        onClick={onDelete}
        className={cx(
          "rounded-xl border px-3 py-2 text-xs font-medium transition",
          "border-zinc-200 bg-white hover:bg-zinc-50",
          "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        )}
      >
        删除
      </button>
    </li>
  );
}

function formatTime(ts: number) {
  try {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
