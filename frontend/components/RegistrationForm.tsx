'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import FormButton from './FormButton';
import { registerUser } from '@/lib/services/auth';

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9\-\+\s\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
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
    // Clear error for this field when user starts typing
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
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phoneNumber,
      });

      setSuccessMessage('Registration successful! Redirecting to login...');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
      });

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again later.';

      if (errorMessage.toLowerCase().includes('email already registered') || errorMessage.toLowerCase().includes('user with this email already exists')) {
        setErrors({
          ...errors,
          email: errorMessage,
        });
      } else {
        setErrors({
          submit: errorMessage,
        });
      }
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
        label="Full Name"
        name="name"
        placeholder="John Doe"
        value={formData.name}
        onChange={handleInputChange}
        error={errors.name}
        required
      />

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
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        placeholder="+1 (555) 123-4567"
        value={formData.phoneNumber}
        onChange={handleInputChange}
        error={errors.phoneNumber}
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

      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
        required
      />

      <FormButton type="submit" loading={loading}>
        Create Account
      </FormButton>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <a
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
