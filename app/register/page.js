'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, EyeOff, ArrowLeft, User, Mail, Phone, Calendar, Lock } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRegister } from '@/lib/hooks/useAuth';

// Validation Schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Full name is required'),
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  phone: Yup.string().matches(/^(\+234|0)?[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number').required('Phone number is required'),
  dateOfBirth: Yup.date().max(new Date(), 'Date of birth cannot be in the future').required('Date of birth is required'),
  gender: Yup.string().oneOf(['male', 'female', 'other'], 'Please select gender').required('Gender is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm your password'),
  terms: Yup.boolean().oneOf([true], 'You must accept terms'),
});

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();

  const handleNext = (values, setErrors) => {
    // basic front validation before moving to next step
    if (step === 1 && (!values.name || !values.email || !values.phone)) {
      setErrors({
        name: !values.name ? 'Required' : '',
        email: !values.email ? 'Required' : '',
        phone: !values.phone ? 'Required' : '',
      });
      return;
    }
    if (step === 2 && (!values.password || !values.confirmPassword)) {
      setErrors({
        password: !values.password ? 'Required' : '',
        confirmPassword: !values.confirmPassword ? 'Required' : '',
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const { confirmPassword, terms, ...submitData } = values;
      await registerMutation.mutateAsync(submitData);
    } catch (error) {
      if (error.field) setFieldError(error.field, error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative">
        <Image
          src="https://plus.unsplash.com/premium_photo-1661761222780-7981c33bfef3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9jdG9yJTIwY29uc3VsdGF0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"
          alt="Healthcare"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Right Side - Multistep Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-6 lg:px-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <Heart className="h-7 w-7 text-brand-600" />
              <h1 className="text-2xl font-bold text-neutral-900">MyHealthLink</h1>
            </div>
            <p className="text-neutral-600 text-sm">
              Step {step} of 3 — {step === 1 ? 'Personal Info' : step === 2 ? 'Account Details' : 'Confirmation'}
            </p>
          </div>

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
            {({ values, errors, touched, isSubmitting, setErrors }) => (
              <Form className="bg-white p-8 rounded-2xl shadow-lg space-y-6 h-[70vh] flex flex-col justify-between">
                {/* Step 1 - Personal Info */}
                {step === 1 && (
                  <div className="space-y-5 overflow-y-auto">
                    <div>
                      <label className="block mb-2 font-semibold">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Field
                          name="name"
                          className="input w-full pl-10 py-3 border border-neutral-300 rounded-lg"
                          placeholder="Enter full name"
                        />
                      </div>
                      <ErrorMessage name="name" component="div" className="text-sm text-red-600 mt-1" />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Field
                          name="email"
                          type="email"
                          className="input w-full pl-10 py-3 border border-neutral-300 rounded-lg"
                          placeholder="Enter your email"
                        />
                      </div>
                      <ErrorMessage name="email" component="div" className="text-sm text-red-600 mt-1" />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Field
                          name="phone"
                          type="tel"
                          className="input w-full pl-10 py-3 border border-neutral-300 rounded-lg"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <ErrorMessage name="phone" component="div" className="text-sm text-red-600 mt-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-2 font-semibold">Date of Birth</label>
                        <Field
                          type="date"
                          name="dateOfBirth"
                          className="input w-full py-3 border border-neutral-300 rounded-lg"
                        />
                        <ErrorMessage name="dateOfBirth" component="div" className="text-sm text-red-600 mt-1" />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold">Gender</label>
                        <Field as="select" name="gender" className="input w-full py-3 border border-neutral-300 rounded-lg">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Field>
                        <ErrorMessage name="gender" component="div" className="text-sm text-red-600 mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 - Password */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block mb-2 font-semibold">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Field
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          className="input w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg"
                          placeholder="Create password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <ErrorMessage name="password" component="div" className="text-sm text-red-600 mt-1" />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Field
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          className="input w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-600 mt-1" />
                    </div>
                  </div>
                )}

                {/* Step 3 - Terms and Submit */}
                {step === 3 && (
                  <div className="space-y-5 text-center">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-3">Review & Confirm</h2>
                    <p className="text-neutral-600 text-sm">
                      Please ensure all details entered are correct before submitting your registration.
                    </p>

                    <div className="flex items-start justify-center mt-5">
                      <Field type="checkbox" name="terms" className="h-4 w-4 mt-1 text-brand-600" />
                      <label className="ml-2 text-sm text-neutral-700">
                        I agree to the{' '}
                        <Link href="/terms" className="text-brand-600 hover:text-brand-700">Terms</Link> and{' '}
                        <Link href="/privacy" className="text-brand-600 hover:text-brand-700">Privacy Policy</Link>.
                      </label>
                    </div>
                    <ErrorMessage name="terms" component="div" className="text-sm text-red-600 mt-1" />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between mt-auto">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-neutral-600 font-medium hover:text-neutral-900"
                    >
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => handleNext(values, setErrors)}
                      className="ml-auto px-6 py-3 bg-brand-600 text-white rounded-lg font-medium"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={registerMutation.isPending || isSubmitting}
                      className="ml-auto px-6 py-3 bg-brand-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      {registerMutation.isPending ? 'Submitting...' : 'Create Account'}
                    </button>
                  )}
                </div>
              </Form>
            )}
          </Formik>

          <div className="text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
