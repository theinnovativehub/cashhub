import React, { useState } from "react";
import { Task } from "@/types/index";
import { PlusIcon, TrashIcon, PlusCircleIcon, XCircleIcon } from "lucide-react";
import { showToast } from "@/utils/toast";
import { useAuth } from "@/supabase_hooks/useAuth";
import { useTasks, useTaskMutations } from "@/hooks/queries";
import { Button } from "@/components/ui/Button";

export const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'created_by' | 'active' | 'created_at' | 'completed_by'>>({
    title: "",
    description: "",
    reward: 0,
    url: "",
    type: "visit",
  });

  const { data: tasks } = useTasks(user?.id || '', undefined);
  const { 
    createTask: createTaskMutation, 
    deleteTask: deleteTaskMutation,
    updateTaskStatus: updateTaskStatusMutation
  } = useTaskMutations();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createTaskMutation.mutateAsync({
        ...newTask,
        created_by: user.id,
        active: true,
        created_at: new Date().toISOString(),
        completed_by: []
      });

      setNewTask({
        title: "",
        description: "",
        reward: 0,
        url: "",
        type: "visit",
      });
      setIsAddingTask(false);
      showToast.success("Task created successfully");
    } catch (error) {
      showToast.error("Failed to create task");
      console.error("Failed to create task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      showToast.success("Task deleted successfully");
    } catch (error) {
      showToast.error("Failed to delete task");
      console.error("Failed to delete task:", error);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId,
        active: !currentStatus
      });
      showToast.success(`Task ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      showToast.error("Failed to update task status");
      console.error("Failed to update task status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <button
          onClick={() => setIsAddingTask(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Task
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Reward</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks?.map((task: Task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₦{task.reward}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{task.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id as string, task.active)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        task.active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {task.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteTask(task.id as string)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddingTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl p-8 m-4 max-w-xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add New Task</h3>
              <button
                onClick={() => setIsAddingTask(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label htmlFor="reward" className="block text-sm font-medium text-gray-700">Reward (₦)</label>
                <input
                  type="number"
                  id="reward"
                  value={newTask.reward}
                  onChange={(e) => setNewTask({ ...newTask, reward: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url"
                  id="url"
                  value={newTask.url}
                  onChange={(e) => setNewTask({ ...newTask, url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value as Task['type'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="visit">Visit</option>
                  <option value="signup">Sign Up</option>
                  <option value="share">Share</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
