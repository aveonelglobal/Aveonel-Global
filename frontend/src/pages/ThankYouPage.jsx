import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Mail, Clock } from 'lucide-react';

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center" data-testid="thank-you-page">
      <div className="section-container py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-10 h-10 text-forest" />
          </motion.div>

          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Application Received!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for applying to the Aveonel Global 30-day operations pilot. We're excited to learn more about your coaching practice.
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E5E0] mb-8">
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-6">
              What happens next?
            </h2>
            
            <div className="space-y-6 text-left">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Check your inbox</h3>
                  <p className="text-gray-600 text-sm">
                    You'll receive a confirmation email shortly with more details about the pilot program.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">We'll be in touch within 24-48 hours</h3>
                  <p className="text-gray-600 text-sm">
                    We'll review your application and reach out to schedule a free 20-minute consultation call.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="btn-primary gap-2"
              data-testid="back-to-home-btn"
            >
              Back to Home
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Questions? Email us at{' '}
            <a href="mailto:aveonel.global@gmail.com" className="text-forest hover:underline">
              aveonel.global@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYouPage;
