import React, { useState } from "react";
import { Task } from "@/types/index";
import TaskCard from "./TaskCard";
import { Loader2Icon } from "lucide-react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { useAvailableTasks } from "@/hooks/queries";

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Task["type"] | "all">("all");

  const { 
    data: tasks = [], 
    isLoading,
    error 
  } = useAvailableTasks(
    user?.id || '', 
    filter !== "all" ? filter : undefined
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 min-h-[200px] flex items-center justify-center">
        Failed to load tasks. Please try refreshing the page.
      </div>
    );
  }

  const filteredTasks = tasks.filter(
    (task) => filter === "all" || task.type === filter
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Task["type"] | "all")}
          className="px-3 py-2 bg-transparent border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Tasks</option>
          <option value="social">Social</option>
          <option value="engagement">Engagement</option>
          <option value="referral">Referral</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No tasks available at the moment.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
