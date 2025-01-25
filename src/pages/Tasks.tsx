import { useState } from "react";
import TaskCard from "@/components/tasks/TaskCard";
import { useAuth } from "@/supabase_hooks/useAuth";
import { useAvailableTasks } from "@/hooks/queries";
import { Loader2Icon } from "lucide-react";

export const Tasks = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 12;

  const { 
    data: tasks = [], 
    isLoading,
    isError,
    refetch 
  } = useAvailableTasks(user?.id || '');

  // Calculate pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 min-h-[400px] flex items-center justify-center">
        Failed to load tasks. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold dark:text-[var(--text-primary-dark)] text-[var(--text-primary-light)]">Available Tasks</h1>
        </div>

        {currentTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No tasks available at the moment.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onTaskComplete={refetch}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;