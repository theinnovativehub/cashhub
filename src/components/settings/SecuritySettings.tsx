import { useState } from "react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Lock, KeyRound, LogOut } from "lucide-react";
import { supabase } from "@/supabase";
import { showToast } from "@/utils/toast";

export const SecuritySettings = () => {
  const { user } = useAuth();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordChange = async () => {
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    try {
      setIsUpdatingPassword(true);

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccessMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      showToast.error("Failed to sign out");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">
          Manage your password and security preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              className="pl-10 w-full rounded-xl font-semibold"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isUpdatingPassword}
              placeholder="Enter current password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            New Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              className="pl-10 w-full rounded-xl font-semibold"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isUpdatingPassword}
              placeholder="Enter new password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Confirm New Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              className="pl-10 w-full rounded-xl font-semibold"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isUpdatingPassword}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-sm text-green-500">
            {successMessage}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handlePasswordChange}
          disabled={isUpdatingPassword}
        >
          {isUpdatingPassword ? "Updating Password..." : "Update Password"}
        </Button>

        <div className="pt-6 border-t">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
