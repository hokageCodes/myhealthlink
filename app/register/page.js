'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, EyeOff, ArrowLeft, User, Mail, Phone, Calendar, Lock } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRegister } from '@/lib/hooks/useAuth';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  phone: Yup.string()
    .matches(/^(\+234|0)?[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number')
    .required('Phone number is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date(1900, 0, 1), 'Please enter a valid date of birth')
    .required('Date of birth is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Please select a valid gender')
    .required('Gender is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  terms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, terms, ...submitData } = values;
      
      await registerMutation.mutateAsync(submitData);
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
            <h1 className="text-4xl font-bold mb-4">MyHealthLink</h1>
            <p className="text-xl text-blue-100 mb-8">One Link for Your Health</p>
          </div>
          
          <div className="space-y-6 max-w-md">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Profile</h3>
                <p className="text-blue-100 text-sm">Store your health information safely</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Easy Sharing</h3>
                <p className="text-blue-100 text-sm">Share with healthcare providers and family</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Privacy First</h3>
                <p className="text-blue-100 text-sm">Your data is encrypted and secure</p>
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
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Join thousands managing their health information securely
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
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Join thousands managing their health information securely
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Formik
              initialValues={{
                name: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                gender: '',
                password: '',
                confirmPassword: '',
                terms: false,
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        className={`input w-full pl-10 ${errors.name && touched.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className={`input w-full pl-10 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`input w-full pl-10 ${errors.phone && touched.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        className={`input w-full pl-10 ${errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                    </div>
                    <ErrorMessage name="dateOfBirth" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <Field
                      as="select"
                      id="gender"
                      name="gender"
                      className={`input w-full ${errors.gender && touched.gender ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="mt-1 text-sm text-red-600" />
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
                        placeholder="Create a strong password"
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

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`input w-full pl-10 pr-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <Field
                      type="checkbox"
                      id="terms"
                      name="terms"
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${errors.terms && touched.terms ? 'border-red-500' : ''}`}
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  <ErrorMessage name="terms" component="div" className="text-sm text-red-600" />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={registerMutation.isPending || isSubmitting}
                    className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}