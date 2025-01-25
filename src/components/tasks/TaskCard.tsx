import React, { useState, useCallback, useRef } from "react";
import { Task } from "@/types/index";
import { useAuth } from "@/supabase_hooks/useAuth";
import { CheckCircleIcon, ExternalLinkIcon, Share2Icon } from "lucide-react";
import { completeTask } from "@/supabase/taskService";
import { showToast } from "@/utils/toast";
import ShareModal from "./ShareModal";
import { useTaskCompletionStatus } from "@/hooks/queries";

interface TaskCardProps {
  task: Task;
  onTaskComplete?: () => void;
}

// Custom hook for debouncing
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskComplete }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: isCompleted = false } = useTaskCompletionStatus(
    task.id,
    user?.id || ''
  );

  const handleComplete = useDebounce(async () => {
    if (!user?.id || isCompleted || isProcessing) return;

    setIsProcessing(true);
    try {
      await completeTask(task.id, user.id);
      onTaskComplete?.();
      showToast.success("Task completed successfully!");
    } catch (error: any) {
      showToast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  }, 500);

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <div className="border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] min-w-[300px] max-w-[400px] rounded-xl shadow-md p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold dark:text-[var(--text-primary-dark)] text-[var(--text-primary-light)]">
            {task.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {task.description}
          </p><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Reward: ₦{task.reward}
        </span>
        </div>
        {/* <div className="flex items-center space-x-2">
          {task.type === 'share' && (
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Share2Icon className="w-5 h-5" />
            </button>
          )}
          {isCompleted && (
            <div className="text-green-500">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
          )}
        </div> */}
      </div>

      <div className="flex items-center justify-between">
        
       {task.type === 'share' ? (
          <button
            onClick={handleShare}
            className={`w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isCompleted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
            disabled={isCompleted || isProcessing}
          >
            <Share2Icon className="mx-2 w-5 h-5" /> Share
          </button>
        ) : (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleComplete}
            className={`w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isCompleted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
          >
            <ExternalLinkIcon className="mx-2 w-4 h-4" /> {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
          </a>
        )}
      </div>

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          // taskId={task.id}
          url={task.url}
          onShare={handleComplete}
        />
      )}
    </div>
  );
};

export default TaskCard;
