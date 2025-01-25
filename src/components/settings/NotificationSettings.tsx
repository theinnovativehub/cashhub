import { useState, useEffect } from "react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Button } from "../ui/Button";
import { Bell, MessageSquare, DollarSign, Loader2Icon } from "lucide-react";
import { showToast } from "@/utils/toast";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/hooks/queries";

interface NotificationPreferences {
  taskUpdates: boolean;
  newTasks: boolean;
  paymentUpdates: boolean;
  referralUpdates: boolean;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: notificationSettings } = useNotificationSettings(user?.id || '');
  const { mutate: updateNotifications, isLoading: loading } = useUpdateNotificationSettings();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    taskUpdates: true,
    newTasks: true,
    paymentUpdates: true,
    referralUpdates: true,
  });

  useEffect(() => {
    if (notificationSettings) {
      setPreferences({
        taskUpdates: notificationSettings.task_updates,
        newTasks: notificationSettings.new_tasks,
        paymentUpdates: notificationSettings.payment_updates,
        referralUpdates: notificationSettings.referral_updates,
      });
    }
  }, [notificationSettings]);

  const handleToggle = (setting: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    try {
      // Convert camelCase to snake_case for API
      const apiPreferences = {
        task_updates: preferences.taskUpdates,
        new_tasks: preferences.newTasks,
        payment_updates: preferences.paymentUpdates,
        referral_updates: preferences.referralUpdates,
      };

      updateNotifications({
        userId: user.id,
        data: apiPreferences
      }, {
        onSuccess: () => {
          showToast.success("Notification preferences updated successfully!");
        },
        onError: (err: any) => {
          console.error("Error updating notification preferences:", err);
          setError("Failed to update notification preferences");
        }
      });
    } catch (err) {
      console.error("Error updating notification preferences:", err);
      setError("Failed to update notification preferences");
    }
  };

  const NotificationToggle = ({ 
    setting, 
    icon: Icon, 
    title, 
    description 
  }: { 
    setting: keyof NotificationPreferences;
    icon: any;
    title: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2 bg-muted">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={preferences[setting]}
          onChange={() => handleToggle(setting)}
          disabled={loading}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Push Notifications</h2>
        <p className="text-muted-foreground">
          Choose which notifications you want to receive
        </p>
      </div>

      <div className="space-y-4 divide-y">
        <NotificationToggle
          setting="taskUpdates"
          icon={Bell}
          title="Task Updates"
          description="Get notified when there are updates to your tasks"
        />
        <NotificationToggle
          setting="newTasks"
          icon={MessageSquare}
          title="New Tasks"
          description="Get notified when new tasks are available"
        />
        <NotificationToggle
          setting="paymentUpdates"
          icon={DollarSign}
          title="Payment Updates"
          description="Get notified about payment status changes"
        />
        <NotificationToggle
          setting="referralUpdates"
          icon={Bell}
          title="Referral Updates"
          description="Get notified about your referral activities"
        />
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      <Button
        onClick={handleSave}
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
};

export default NotificationSettings;
