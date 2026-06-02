'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import FormButton from './FormButton';
import { loginUser } from '@/lib/services/auth';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(formData.email, formData.password);
      window.localStorage.setItem('smart_roommate_user_id', String(response.user_id));
      window.localStorage.setItem('smart_roommate_user_email', response.email);
      setSuccessMessage('Login successful! Redirecting...');
      setFormData({ email: '', password: '' });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
          {errors.submit}
        </div>
      )}

      <FormInput
        label="Email Address"
        name="email"
        type="email"
        placeholder="john@example.com"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        required
      />

      <FormInput
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        required
      />

      <FormButton type="submit" loading={loading}>
        Sign in
      </FormButton>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <a href="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          Create one
        </a>
      </p>
    </form>
  );
}
