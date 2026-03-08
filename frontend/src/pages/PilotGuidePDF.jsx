import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Users, 
  ClipboardCheck,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

const PilotGuidePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      const checkNewPage = (needed = 40) => {
        if (yPos + needed > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // === PAGE 1: COVER ===
      yPos = 50;
      
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('30-Day Operations Pilot', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(193, 127, 89);
      pdf.text('Program Guide', pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Aveonel Global', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      pdf.text('Ontario, Canada', pageWidth / 2, yPos, { align: 'center' });
      
      yPos = 120;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Your back-office, handled.', pageWidth / 2, yPos, { align: 'center' });

      // === PAGE 2: WELCOME ===
      pdf.addPage();
      yPos = margin;
      
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text('Welcome to Aveonel Global', margin, yPos);
      yPos += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      
      let text = "If you're an Ontario-based coach or consultant earning $3,000-$5,000+ per month, you know the challenges of running a growing practice: messy scheduling, slow client onboarding, and no clear view of your pipeline.";
      let lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 5 + 8;

      text = "Our 30-day operations pilot is designed to solve these problems - giving you the systems you need to run smoother operations so you can focus on what you do best: coaching your clients.";
      lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 5 + 15;

      // === WHAT'S INCLUDED ===
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text("What's Included in the Pilot", margin, yPos);
      yPos += 12;

      // Service 1
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('1. Scheduling System', margin, yPos);
      yPos += 6;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(193, 127, 89);
      pdf.text('Never chase a calendar again', margin, yPos);
      yPos += 7;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const sched = ['Calendar integration', 'Automated booking links', 'Reminder emails (48h, 24h, 1h)', 'Easy rescheduling', 'Timezone handling'];
      sched.forEach(item => {
        pdf.text('  * ' + item, margin, yPos);
        yPos += 5;
      });
      yPos += 8;

      // Service 2
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('2. Client Onboarding', margin, yPos);
      yPos += 6;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(193, 127, 89);
      pdf.text('First impressions, perfected', margin, yPos);
      yPos += 7;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const onboard = ['Automated welcome sequences', 'Digital intake forms', 'Contract delivery', 'Resource sharing', 'First session prep'];
      onboard.forEach(item => {
        pdf.text('  * ' + item, margin, yPos);
        yPos += 5;
      });
      yPos += 8;

      // Service 3
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('3. Pipeline Tracking', margin, yPos);
      yPos += 6;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(193, 127, 89);
      pdf.text('Know where every client stands', margin, yPos);
      yPos += 7;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const pipeline = ['Visual dashboard', 'Status tracking', 'Follow-up reminders', 'Notes and history', 'Nothing falls through'];
      pipeline.forEach(item => {
        pdf.text('  * ' + item, margin, yPos);
        yPos += 5;
      });

      // === PAGE 3: HOW IT WORKS ===
      pdf.addPage();
      yPos = margin;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text('How the Pilot Works', margin, yPos);
      yPos += 15;

      // Step 1
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Step 1: Book a Consultation', margin, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      text = "Schedule a free 20-minute call where we'll discuss your current challenges and determine if the pilot is a good fit for your practice.";
      lines = pdf.splitTextToSize(text, contentWidth - 5);
      pdf.text(lines, margin + 5, yPos);
      yPos += lines.length * 4.5 + 10;

      // Step 2
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Step 2: System Setup', margin, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      text = "I implement scheduling, onboarding, and tracking systems tailored to your specific coaching practice. This typically requires 1-2 hours of your input.";
      lines = pdf.splitTextToSize(text, contentWidth - 5);
      pdf.text(lines, margin + 5, yPos);
      yPos += lines.length * 4.5 + 10;

      // Step 3
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Step 3: 30 Days of Support', margin, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      text = "Run your practice with organized operations for 30 days. I provide ongoing support and adjustments as needed throughout the pilot period.";
      lines = pdf.splitTextToSize(text, contentWidth - 5);
      pdf.text(lines, margin + 5, yPos);
      yPos += lines.length * 4.5 + 10;

      // Step 4
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Step 4: Review & Decision', margin, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      text = "At the end of 30 days, we review results together. If it works, we discuss continuing. If not, there's no obligation - you keep the systems I've set up.";
      lines = pdf.splitTextToSize(text, contentWidth - 5);
      pdf.text(lines, margin + 5, yPos);
      yPos += lines.length * 4.5 + 15;

      // === WHY FREE ===
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text('Why Is the Pilot Free?', margin, yPos);
      yPos += 12;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      text = "I'm in the early stages of building Aveonel Global and want to work closely with Ontario coaches to refine my approach. In exchange for the free pilot, I ask for:";
      lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 4.5 + 6;

      pdf.text('  * Honest feedback about what is working and what is not', margin, yPos);
      yPos += 6;
      pdf.text('  * A testimonial if the pilot delivers real value', margin, yPos);
      yPos += 6;
      pdf.text('  * Openness to continue working together if we are a good fit', margin, yPos);
      yPos += 15;

      // === IDEAL CLIENT ===
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text('Is This Pilot Right for You?', margin, yPos);
      yPos += 12;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Great Fit If You...', margin, yPos);
      yPos += 7;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(10);
      pdf.text('  * Are based in Ontario, Canada', margin, yPos); yPos += 5;
      pdf.text('  * Earn $3,000-$5,000+/month', margin, yPos); yPos += 5;
      pdf.text('  * Spend too much time on admin tasks', margin, yPos); yPos += 5;
      pdf.text('  * Want to systematize your operations', margin, yPos); yPos += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Maybe Not Right Now If...', margin, yPos);
      yPos += 7;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('  * You are just starting out (under $1K/month)', margin, yPos); yPos += 5;
      pdf.text('  * You already have robust systems in place', margin, yPos); yPos += 5;
      pdf.text('  * You are located outside Ontario', margin, yPos);

      // === PAGE 4: INVESTMENT & CTA ===
      pdf.addPage();
      yPos = margin;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text('Investment', margin, yPos);
      yPos += 12;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('30-Day Pilot: FREE', margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.text('After Pilot: $799/month', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Cancel anytime. No contracts.', margin, yPos);
      yPos += 25;

      // ABOUT
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text('About Aovila Saandeep', margin, yPos);
      yPos += 12;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      
      text = "I'm not a virtual assistant. I'm not software. I'm your detail-obsessed operations partner.";
      lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 4.5 + 6;

      text = "As a former Program Coordinator, I spent years making sure complex programs ran flawlessly behind the scenes - coordinating clients, teams, and deliverables, ensuring nothing fell through the cracks.";
      lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 4.5 + 6;

      text = "I started Aveonel Global because every coach deserves someone who treats their business problems like their own.";
      lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 4.5 + 6;

      pdf.setFont('helvetica', 'bold');
      text = "My goal: Help you sleep peacefully knowing someone has got your back-office handled.";
      lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 4.5 + 20;

      // CTA
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Ready to Get Started?', margin, yPos);
      yPos += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text("I'm accepting 10 Ontario coaches for this pilot.", margin, yPos);
      yPos += 12;

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 92, 85);
      pdf.text('Apply now: aveonelglobal.com/apply', margin, yPos);
      yPos += 8;
      pdf.text('Questions? aveonel.global@gmail.com', margin, yPos);

      // Footer
      yPos = pageHeight - 15;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text('Aveonel Global - Your back-office, handled.', pageWidth / 2, yPos, { align: 'center' });
      pdf.text('2026 Aveonel Global. All rights reserved.', pageWidth / 2, yPos + 5, { align: 'center' });

      // Save
      pdf.save('Aveonel-Global-Pilot-Guide.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream" data-testid="pilot-guide-page">
      <header className="bg-cream border-b border-[#E5E5E0]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-forest hover:text-forest-hover transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Button 
            onClick={generatePDF}
            className="btn-primary gap-2"
            disabled={isGenerating}
            data-testid="download-pdf-btn"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center mb-16">
          <img 
            src="https://customer-assets.emergentagent.com/job_pilot-launch-4/artifacts/rjad5uf0_AVEONEL%20Logo_%20Clarity%20and%20Prosperity%20-%20Copy.png" 
            alt="Aveonel Global Logo" 
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            30-Day Operations Pilot
          </h1>
          <p className="text-xl text-forest font-medium mb-2">Program Guide</p>
          <p className="text-gray-500">Aveonel Global · Ontario, Canada</p>
        </div>

        <section className="mb-12">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4">Welcome to Aveonel Global</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you're an Ontario-based coach or consultant earning $3,000–$5,000+ per month, you know the challenges of running a growing practice: messy scheduling, slow client onboarding, and no clear view of your pipeline.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our 30-day operations pilot is designed to solve these problems — giving you the systems you need to run smoother operations so you can focus on what you do best: coaching your clients.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">What's Included</h2>
          <div className="space-y-6">
            <div className="flex gap-4 p-6 bg-white rounded-xl border border-[#E5E5E0]">
              <Calendar className="w-8 h-8 text-forest flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">1. Scheduling System</h3>
                <p className="text-forest text-sm">Never chase a calendar again</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl border border-[#E5E5E0]">
              <Users className="w-8 h-8 text-terracotta flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">2. Client Onboarding</h3>
                <p className="text-terracotta text-sm">First impressions, perfected</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl border border-[#E5E5E0]">
              <ClipboardCheck className="w-8 h-8 text-forest flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">3. Pipeline Tracking</h3>
                <p className="text-forest text-sm">Know where every client stands</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 p-8 bg-forest/5 rounded-2xl">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4">Investment</h2>
          <p className="text-2xl font-semibold text-forest">30-Day Pilot: FREE</p>
          <p className="text-xl text-gray-700">After Pilot: $799/month</p>
          <p className="text-sm text-gray-500">Cancel anytime. No contracts.</p>
        </section>

        <section className="text-center py-8 border-t border-[#E5E5E0]">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-3">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">I'm accepting 10 Ontario coaches for this pilot.</p>
          <Link to="/apply" className="btn-primary gap-2 inline-flex">
            <Sparkles className="w-5 h-5" />
            Apply for the Pilot
          </Link>
          <p className="text-sm text-gray-500 mt-6">Questions? aveonel.global@gmail.com</p>
        </section>
      </div>
    </div>
  );
};

export default PilotGuidePDF;
