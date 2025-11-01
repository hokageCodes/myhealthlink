'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLogin } from '@/lib/hooks/useAuth';

const LoginSchema = Yup.object().shape({
  emailOrPhone: Yup.string()
    .required('Email or phone number is required')
    .test('email-or-phone', 'Please enter a valid email or phone number', function(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(\+234|0)?[789][01]\d{8}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
  password: Yup.string()
    .required('Password is required')
    .min(1, 'Password cannot be empty'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      // Handle field-specific errors if they exist
      if (error.field) {
        setFieldError(error.field, error.message);
      }
      // The error toast is handled by the mutation
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-100">
        <Image
          src="https://images.unsplash.com/photo-1690016424217-03f4d9427a6a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=627"
          fill
          className="object-cover"
          priority
          unoptimized
          alt="Login"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-16 bg-white">
        <div className="max-w-lg mx-auto w-full">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold text-neutral-900">MyHealthLink</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600">
              Sign in to access your health information
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600">
              Sign in to access your health information
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-10 lg:p-12">
            <Formik
              initialValues={{
                emailOrPhone: '',
                password: '',
                rememberMe: false,
              }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-7">
                  {/* Email/Phone */}
                  <div>
                    <label htmlFor="emailOrPhone" className="block text-base font-semibold text-neutral-900 mb-3">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <Field
                        type="text"
                        id="emailOrPhone"
                        name="emailOrPhone"
                        className={`input w-full pl-11 py-3.5 text-base ${errors.emailOrPhone && touched.emailOrPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-brand-500 focus:ring-brand-500'}`}
                        placeholder="Enter your email or phone"
                      />
                    </div>
                    <ErrorMessage name="emailOrPhone" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-base font-semibold text-neutral-900 mb-3">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className={`input w-full pl-11 pr-11 py-3.5 text-base ${errors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-brand-500 focus:ring-brand-500'}`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-neutral-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Field
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-neutral-300 rounded"
                      />
                      <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending || isSubmitting}
                    className="btn btn-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                  >
                    {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                Dont have an account?{' '}
                <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}