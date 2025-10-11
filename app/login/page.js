'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, EyeOff, ArrowLeft, Mail, Lock, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left Side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <Heart className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-blue-100 mb-8">Access your health information securely</p>
          </div>
          
          <div className="space-y-6 max-w-md">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Access</h3>
                <p className="text-blue-100 text-sm">Your data is protected with encryption</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Email Verified</h3>
                <p className="text-blue-100 text-sm">Only verified accounts can access</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Health First</h3>
                <p className="text-blue-100 text-sm">Manage your health information easily</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">MyHealthLink</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access your health information
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access your health information
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
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
                <Form className="space-y-6">
                  {/* Email/Phone */}
                  <div>
                    <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type="text"
                        id="emailOrPhone"
                        name="emailOrPhone"
                        className={`input w-full pl-10 ${errors.emailOrPhone && touched.emailOrPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter your email or phone"
                      />
                    </div>
                    <ErrorMessage name="emailOrPhone" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className={`input w-full pl-10 pr-10 ${errors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending || isSubmitting}
                    className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Dont have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Account */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Account</h3>
            <p className="text-sm text-blue-700">
              Email: demo@myhealthlink.com<br />
              Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}