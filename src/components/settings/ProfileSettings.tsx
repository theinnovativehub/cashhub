import { useState } from "react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { User, Mail, Loader2Icon } from "lucide-react";
import { showToast } from "@/utils/toast";
import { useUserSettings, useUpdateUserSettings } from "@/hooks/queries";

export const ProfileSettings = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: settings } = useUserSettings(user?.id || '');
  const { mutate: updateSettings, isLoading: loading } = useUpdateUserSettings();

  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    try {
      // Validate inputs
      if (!profileData.fullname.trim()) {
        throw new Error("Full name is required");
      }

      updateSettings({
        userId: user.id,
        data: {
          fullname: profileData.fullname.trim(),
        }
      }, {
        onSuccess: () => {
          showToast.success("Profile updated successfully!");
        },
        onError: (err: any) => {
          console.error("Error updating profile: ", err);
          setError(err instanceof Error ? err.message : "Failed to update profile");
        }
      });
    } catch (err) {
      console.error("Error updating profile: ", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-[var(--text-primary)]">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              name="fullname"
              className="pl-10 w-full rounded-xl font-semibold text-gray-900 dark:text-white"
              placeholder="John Doe"
              value={profileData.fullname}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              name="email"
              type="email"
              className="pl-10 w-full rounded-xl font-semibold text-gray-900 dark:text-white"
              value={profileData.email}
              disabled={true}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Email cannot be changed
          </p>
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
    </div>
  );
};

export default ProfileSettings;
