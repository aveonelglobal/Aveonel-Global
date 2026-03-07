import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  business_type: z.string().min(2, 'Please describe your business type'),
  revenue_range: z.enum(['under_3k', '3k_to_5k', '5k_to_10k', 'over_10k'], {
    required_error: 'Please select your revenue range',
  }),
  biggest_challenge: z.string().min(20, 'Please describe your biggest challenge (at least 20 characters)'),
  ontario_based: z.boolean().refine(val => val === true, {
    message: 'You must be based in Ontario to apply for this pilot',
  }),
});

const PilotApplyPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      business_type: '',
      revenue_range: '',
      biggest_challenge: '',
      ontario_based: false,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/pilot/apply`, data);
      toast.success('Application submitted successfully!');
      navigate('/thank-you');
    } catch (error) {
      const message = error.response?.data?.detail || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream" data-testid="pilot-apply-page">
      {/* Header */}
      <header className="bg-cream border-b border-[#E5E5E0]">
        <div className="section-container py-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-forest hover:text-forest-hover transition-colors"
            data-testid="back-to-home-link"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="section-container py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/10 text-forest text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              10 pilot spots available
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Apply for the 30-Day Pilot
            </h1>
            <p className="text-lg text-gray-600">
              Fill out the form below to see if you're a fit for our free operations pilot.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-[#E5E5E0]"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your full name" 
                          className="input-default"
                          data-testid="input-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="you@example.com" 
                          className="input-default"
                          data-testid="input-email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="(416) 555-0123" 
                          className="input-default"
                          data-testid="input-phone"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Business Type */}
                <FormField
                  control={form.control}
                  name="business_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">What type of coaching/consulting do you do?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Business Coach, Life Coach, Executive Coach" 
                          className="input-default"
                          data-testid="input-business-type"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Revenue Range */}
                <FormField
                  control={form.control}
                  name="revenue_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Monthly Revenue Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-default" data-testid="select-revenue">
                            <SelectValue placeholder="Select your monthly revenue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under_3k">Under $3,000/month</SelectItem>
                          <SelectItem value="3k_to_5k">$3,000 - $5,000/month</SelectItem>
                          <SelectItem value="5k_to_10k">$5,000 - $10,000/month</SelectItem>
                          <SelectItem value="over_10k">Over $10,000/month</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Biggest Challenge */}
                <FormField
                  control={form.control}
                  name="biggest_challenge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        What's your biggest operational challenge right now?
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your scheduling, onboarding, or client tracking challenges..."
                          className="input-default min-h-[120px] resize-none"
                          data-testid="textarea-challenge"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ontario Confirmation */}
                <FormField
                  control={form.control}
                  name="ontario_based"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-[#E5E5E0] p-4 bg-cream-subtle">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-ontario"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700 cursor-pointer">
                          I confirm that I am based in Ontario, Canada
                        </FormLabel>
                        <p className="text-sm text-gray-500">
                          This pilot is currently only available to Ontario-based coaches and consultants.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-primary h-14 text-base"
                  disabled={isSubmitting}
                  data-testid="submit-application-btn"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  By submitting, you agree to be contacted about the pilot program.
                </p>
              </form>
            </Form>
          </motion.div>

          {/* Calendly Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-center"
          >
            <div className="bg-forest/5 rounded-2xl p-8 border border-forest/10">
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                Prefer to book a call first?
              </h3>
              <p className="text-gray-600 mb-6">
                Schedule a free 20-minute consultation to discuss if the pilot is right for you.
              </p>
              <div className="bg-white rounded-xl p-8 border border-[#E5E5E0]">
                <div className="flex items-center justify-center gap-3 text-gray-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Calendly integration coming soon — submit your application and we'll reach out to schedule.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PilotApplyPage;
