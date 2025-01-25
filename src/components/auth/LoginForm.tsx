import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/Button";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/supabase_hooks/useAuth";
import { FaSpinner } from "react-icons/fa6";
import { showToast } from "@/utils/toast";

type LoginFormData = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { watch } = useForm<LoginFormData>();
  
  const email = watch('email');
  const isAdmin = email?.endsWith('@admin.com');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    if (user) {
      // Redirect admin users to admin dashboard
      if (user.is_admin) {
        navigate('/admin', { replace: true });
        return;
      }
      // Redirect regular users to overview
      navigate('/overview', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    const { email, password } = data;
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error: any) {
      showToast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email {isAdmin && <span className="text-yellow-400">(Admin Account)</span>}
        </label>
        <input
          id="email"
          type="email"
          placeholder={isAdmin ? "admin@admin.com" : "user@example.com"}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white bg-gray-700"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="**********"
          {...register("password", {
            required: "Password is required",
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white bg-gray-700"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          disabled={loading}
        >
          {loading ? (
            <FaSpinner className="animate-spin h-5 w-5" />
          ) : (
            "Sign In"
          )}
        </Button>
      </div>

      <div className="text-center">
        <Link
          to="/signup"
          className="text-sm text-purple-600 hover:text-purple-500"
        >
          Don't have an account? Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
