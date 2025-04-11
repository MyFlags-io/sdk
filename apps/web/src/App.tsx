import React, { useEffect, useState } from "react";
import { ApiProvider, useApi } from "@myflags/react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function TodoList() {
  const api = useApi();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await api.get<Todo[]>("/todos");
        setTodos(data);
      } catch (err) {
        setError("Failed to fetch todos");
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [api]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Todos</h2>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.completed}
              readOnly
              className="h-4 w-4"
            />
            <span>{todo.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <ApiProvider
      config={{
        apiKey: "your-api-key",
        baseUrl: "https://jsonplaceholder.typicode.com",
      }}
    >
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-2xl">
          <TodoList />
        </div>
      </div>
    </ApiProvider>
  );
}

export default App;
