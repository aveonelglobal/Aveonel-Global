import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Users, 
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PilotGuidePDF = () => {
  const contentRef = useRef(null);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-cream" data-testid="pilot-guide-page">
      {/* Screen Header - Hidden in Print */}
      <header className="bg-cream border-b border-[#E5E5E0] print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-forest hover:text-forest-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Button 
            onClick={handleDownload}
            className="btn-primary gap-2"
            data-testid="download-pdf-btn"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* PDF Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-8 py-12 print:px-12 print:py-8">
        
        {/* Cover / Header */}
        <div className="text-center mb-16 print:mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center print:border-2 print:border-forest print:bg-white">
              <span className="text-white font-heading font-bold text-2xl print:text-forest">A</span>
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-gray-900 mb-4 print:text-3xl">
            30-Day Operations Pilot
          </h1>
          <p className="text-xl text-forest font-medium mb-2">
            Program Guide
          </p>
          <p className="text-gray-500">
            Aveonel Global · Ontario, Canada
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12 print:mb-8">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4 print:text-xl">
            Welcome to Aveonel Global
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you're an Ontario-based coach or consultant earning $3,000–$5,000+ per month, 
            you know the challenges of running a growing practice: messy scheduling, slow client 
            onboarding, and no clear view of your pipeline.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our 30-day operations pilot is designed to solve these problems — giving you the 
            systems you need to run smoother operations so you can focus on what you do best: 
            coaching your clients.
          </p>
        </section>

        {/* What's Included */}
        <section className="mb-12 print:mb-8">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6 print:text-xl">
            What's Included in the Pilot
          </h2>
          
          <div className="space-y-6">
            {/* Service 1 */}
            <div className="flex gap-4 p-6 bg-white rounded-xl border border-[#E5E5E0] print:border print:p-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0 print:bg-white print:border print:border-forest">
                <Calendar className="w-6 h-6 text-forest" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Scheduling System
                </h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Calendar integration with your existing tools</li>
                  <li>• Automated booking links for clients</li>
                  <li>• Reminder emails (48h, 24h, 1h before sessions)</li>
                  <li>• Easy rescheduling workflow</li>
                  <li>• Timezone handling (Ontario default)</li>
                </ul>
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex gap-4 p-6 bg-white rounded-xl border border-[#E5E5E0] print:border print:p-4">
              <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0 print:bg-white print:border print:border-terracotta">
                <Users className="w-6 h-6 text-terracotta" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Client Onboarding
                </h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Automated welcome sequences</li>
                  <li>• Digital intake forms</li>
                  <li>• Contract and agreement delivery</li>
                  <li>• Resource sharing system</li>
                  <li>• First session preparation checklist</li>
                </ul>
              </div>
            </div>

            {/* Service 3 */}
            <div className="flex gap-4 p-6 bg-white rounded-xl border border-[#E5E5E0] print:border print:p-4">
              <div className="w-12 h-12 rounded-xl bg-beige/50 flex items-center justify-center flex-shrink-0 print:bg-white print:border print:border-forest">
                <ClipboardCheck className="w-6 h-6 text-forest" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Pipeline Tracker
                </h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Visual lead management dashboard</li>
                  <li>• Status tracking for every client</li>
                  <li>• Follow-up reminders</li>
                  <li>• Notes and history for each client</li>
                  <li>• Clear visibility into your business</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 print:mb-8 page-break-before print:break-before-page">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6 print:text-xl">
            How the Pilot Works
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Book a Consultation</h3>
                <p className="text-gray-600 text-sm">
                  Schedule a free 20-minute call where we'll discuss your current challenges 
                  and determine if the pilot is a good fit for your practice.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">System Setup</h3>
                <p className="text-gray-600 text-sm">
                  We implement scheduling, onboarding, and tracking systems tailored to your 
                  specific coaching practice. This typically requires 1-2 hours of your input.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">30 Days of Support</h3>
                <p className="text-gray-600 text-sm">
                  Run your practice with organized operations for 30 days. We provide ongoing 
                  support and adjustments as needed throughout the pilot period.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-semibold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Review & Decision</h3>
                <p className="text-gray-600 text-sm">
                  At the end of 30 days, we review results together. If it works, we discuss 
                  continuing. If not, there's no obligation — you keep the systems we've set up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why It's Free */}
        <section className="mb-12 print:mb-8">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4 print:text-xl">
            Why Is the Pilot Free?
          </h2>
          <div className="bg-forest/5 rounded-xl p-6 border border-forest/10 print:border print:border-gray-300">
            <p className="text-gray-700 leading-relaxed mb-4">
              We're in the early stages of building Aveonel Global and want to work closely with 
              Ontario coaches to refine our approach. In exchange for the free pilot, we ask for:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                <span>Honest feedback about what's working and what isn't</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                <span>A testimonial if the pilot delivers real value for your practice</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                <span>Openness to continue working together if we're a good fit</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Ideal Candidate */}
        <section className="mb-12 print:mb-8">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4 print:text-xl">
            Is This Pilot Right for You?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="bg-green-50 rounded-xl p-6 print:border print:border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Great Fit If You...
              </h3>
              <ul className="text-green-700 text-sm space-y-2">
                <li>• Are based in Ontario, Canada</li>
                <li>• Earn $3,000–$5,000+/month</li>
                <li>• Spend too much time on admin tasks</li>
                <li>• Want to systematize your operations</li>
                <li>• Are open to feedback and collaboration</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 print:border print:border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Maybe Not Right Now If...
              </h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• You're just starting out (under $1K/month)</li>
                <li>• You already have robust systems in place</li>
                <li>• You're not ready to implement new workflows</li>
                <li>• You're located outside Ontario</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-[#E5E5E0] print:border-gray-300">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-3 print:text-xl">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            We're accepting 10 Ontario coaches for this pilot. Apply today.
          </p>
          
          <div className="print:hidden">
            <Link to="/apply" className="btn-primary gap-2 inline-flex">
              <Sparkles className="w-5 h-5" />
              Apply for the Pilot
            </Link>
          </div>
          
          <div className="hidden print:block">
            <p className="text-forest font-medium">
              Visit: aveonelglobal.com/apply
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E5E0] print:border-gray-300">
            <p className="text-sm text-gray-500">
              Questions? Contact us at hello@aveonelglobal.com
            </p>
            <p className="text-sm text-gray-400 mt-2">
              © {new Date().getFullYear()} Aveonel Global · Ontario, Canada
            </p>
          </div>
        </section>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .hidden.print\\:block {
            display: block !important;
          }
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
      `}</style>
    </div>
  );
};

export default PilotGuidePDF;
