'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, ArrowLeft, RefreshCw, Mail, Shield } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useVerifyOTP, useResendOTP } from '@/lib/hooks/useAuth';

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Please enter the 6-digit code')
    .length(6, 'Verification code must be 6 digits'),
});

// Loading fallback component
function VerifyOTPLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left Side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <Heart className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Verify Email</h1>
            <p className="text-xl text-blue-100 mb-8">Complete your account setup</p>
          </div>
        </div>
      </div>

      {/* Right Side - Loading State */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function VerifyOTPContent() {
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await verifyOTPMutation.mutateAsync({
        email,
        otp: values.otp,
        type: 'email'
      });
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

  const handleResendOTP = async () => {
    setCountdown(60); // 60 seconds countdown
    
    try {
      await resendOTPMutation.mutateAsync(email);
    } catch (error) {
      // The error toast is handled by the mutation
      setCountdown(0); // Reset countdown on error
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Request</h1>
          <p className="text-gray-600 mb-6">No email address provided for verification.</p>
          <Link href="/register" className="btn btn-primary">
            Back to Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left Side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <Heart className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Verify Email</h1>
            <p className="text-xl text-blue-100 mb-8">Complete your account setup</p>
          </div>
          
          <div className="space-y-6 max-w-md">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Check Your Email</h3>
                <p className="text-blue-100 text-sm">We have sent a verification code</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Verification</h3>
                <p className="text-blue-100 text-sm">Your account will be protected</p>
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
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We have sent a verification code to<br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <Link 
              href="/register" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registration
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We have sent a verification code to<br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Formik
              initialValues={{
                otp: '',
              }}
              validationSchema={OTPSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* OTP Input */}
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <Field
                      type="text"
                      id="otp"
                      name="otp"
                      className={`input w-full text-center text-2xl tracking-widest ${errors.otp && touched.otp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="000000"
                      maxLength={6}
                    />
                    <ErrorMessage name="otp" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={verifyOTPMutation.isPending || isSubmitting}
                    className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify Email'}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Resend OTP */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                Didnt receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                disabled={countdown > 0 || resendOTPMutation.isPending}
                className="btn btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resend in {countdown}s
                  </>
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>
          </div>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Check your spam folder if you dont see the email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function VerifyOTP() {
  return (
    <Suspense fallback={<VerifyOTPLoading />}>
      <VerifyOTPContent />
    </Suspense>
  );
}