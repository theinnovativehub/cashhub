import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/Button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/supabase_hooks/useAuth";
import { FaSpinner } from "react-icons/fa6";
import { showToast } from "@/utils/toast";

type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  referredBy?: string;
};

export const SignupForm: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const email = watch('email');
  const name = watch('name');
  const isAdmin = email?.endsWith('@admin.com');

  // Get referral code from URL and set it in the form
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && !isAdmin) {
      setValue('referredBy', ref);
    }
  }, [searchParams, setValue, isAdmin]);

  const onSubmit = async (data: SignupFormData) => {
    const {
      name,
      email,
      confirmPassword,
      referredBy = "",
    } = data;

    const passwordValue = getValues('password');

    if (passwordValue !== confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, passwordValue, name, referredBy);
      showToast.success(
        isAdmin 
          ? "Admin account created successfully!" 
          : "Account created successfully! You've received ₦1000 signup bonus!"
      );
      // Navigate after successful signup
      navigate(isAdmin ? "/admin" : "/overview", { replace: true });
    } catch (error: any) {
      console.error("Signup error:", error);
      showToast.error(error?.message || "Error during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">
          Full Name {isAdmin && <span className="text-yellow-400">(must start with 'admin_' for admin accounts)</span>}
        </label>
        <input
          id="name"
          type="text"
          placeholder={isAdmin ? "admin_john" : "John Doe"}
          {...register("name", { 
            required: "Name is required",
            validate: (value) => {
              if (isAdmin && !value.toLowerCase().startsWith('admin_')) {
                return "Admin names must start with 'admin_'";
              }
              return true;
            }
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white bg-gray-700"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email {isAdmin && <span className="text-yellow-400">(must end with @admin.com for admin accounts)</span>}
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
        <label htmlFor="password" className="block text-sm font-medium text-white">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="*********"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white bg-gray-700"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="*********"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === getValues('password') || "Passwords do not match",
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white bg-gray-700"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="referredBy" className="block text-sm font-medium text-white">
          Referral Code (Optional)
        </label>
        <input
          id="referredBy"
          type="text"
          placeholder="Referral Code"
          {...register("referredBy")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>

      <p className="text-center text-sm text-gray-300">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </form>
  );
};
