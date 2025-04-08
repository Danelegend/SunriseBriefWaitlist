'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Define a proper error type
interface SupabaseError {
  code?: string;
  message?: string;
}

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: ''
  });
  const [errors, setErrors] = useState<{
    email?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when user types in email field
    if (id === 'email' && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const validateEmail = (email: string): boolean => {
    // RFC 5322 compliant email regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({});
    setErrors({});

    try {
      // Insert data into Supabase
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            interests: formData.interests
          }
        ]);

      if (error) throw error;

      // Success
      setSubmitStatus({
        success: true,
        message: 'Thanks for joining! We&apos;ll be in touch soon.'
      });
      
      // Reset form
      setFormData({ name: '', email: '', interests: '' });
      
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      
      // Type guard to check if error is a SupabaseError
      const supabaseError = error as SupabaseError;
      
      // Check for duplicate email error from Supabase
      if (supabaseError.code === '23505' || supabaseError.message?.includes('duplicate')) {
        setSubmitStatus({
          success: false,
          message: 'This email is already on our waitlist.'
        });
      } else {
        setSubmitStatus({
          success: false,
          message: 'Something went wrong. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 dark:from-gray-900 dark:to-rose-900/30">
      {/* Header */}
      <header className="w-full py-4 px-6 sm:px-10">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 inline-block text-transparent bg-clip-text">Sunrise Brief</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 gap-[32px]">
        <div className="flex flex-col items-center text-center max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Start Your Day <span className="text-amber-600">Informed</span>
          </h2>
          <p className="text-xl sm:text-2xl mb-3 font-medium text-gray-800 dark:text-gray-200">Only the News You Care About</p>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2 max-w-lg">
            Wake up to what matters to you. Select your interests, skip the noise and get the news you want.
          </p>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-gray-800/80 p-8 rounded-2xl shadow-lg border border-amber-100 dark:border-amber-900/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-rose-500"></div>
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Get Early Access</h2>
          
          {submitStatus.success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Thank You!</h3>
              <p className="text-gray-600 dark:text-gray-300">{submitStatus.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amber-500 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-amber-500 focus:ring-amber-500'} dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  placeholder="your@email.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="interests" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  What topics interest you most?
                </label>
                <textarea
                  id="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amber-500 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Politics, Technology, Business, Sports, etc."
                  rows={3}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-2 rounded-lg border-0 transition-all duration-200 flex items-center justify-center bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white gap-2 font-medium text-base h-12 px-5 w-full shadow-md hover:shadow-lg cursor-pointer ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Reserve Your Spot
                  </>
                )}
              </button>
              
              {submitStatus.success === false && (
                <p className="text-rose-600 dark:text-rose-400 text-sm text-center mt-2">
                  {submitStatus.message}
                </p>
              )}
            </form>
          )}
        </div>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Launching soon - limited alpha spots available
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            Be among the first to experience Sunrise Brief. We&apos;ll notify you when your morning briefings are ready. No spam, just updates.
          </p>
        </div>
      </main>
      
      <footer className="w-full py-6 flex justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Sunrise Brief. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
