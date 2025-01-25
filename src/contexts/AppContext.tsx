import { createContext, ReactNode, useContext, useState } from "react";
import { Task, User } from "@/types";

const AppContext = createContext<any>(null);

function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.data);
        setIsAuthenticated(true);

        const userResponse = await fetch(
          `http://localhost:3000/users?email=${credentials.email}`
        );
        const userData = await userResponse.json();
        setUser(userData[0]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, "id">) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  const startTask = async (taskId: string) => {
    try {
      setLoading(true);
      if (!user) throw new Error("User not authenticated");

      const response = await fetch("http://localhost:3000/user_tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          taskId,
          startTime: new Date(),
          status: "pending",
        }),
      });

      if (!response.ok) throw new Error("Failed to start task");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start task");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      setLoading(true);
      if (!user) throw new Error("User not authenticated");

      const response = await fetch(
        `http://localhost:3000/user_tasks?userId=${user.id}&taskId=${taskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            completionTime: new Date(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to complete task");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete task");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const getTaskDetails = async (taskId: string): Promise<Task> => {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
    if (!response.ok) throw new Error("Failed to fetch task details");
    return response.json();
  };

  const contextValues: any = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    tasks,
    loading,
    error,
    login,
    register,
    logout,
    startTask,
    completeTask,
    fetchTasks,
    getTaskDetails,
  };

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
}

function useApp(): any {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export { AppProvider, useApp };
