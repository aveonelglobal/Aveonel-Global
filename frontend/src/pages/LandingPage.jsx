import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ClipboardCheck, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  BarChart3,
  Sparkles,
  ChevronDown,
  Mail,
  MapPin
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Header Component
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-[#E5E5E0]">
    <div className="section-container">
      <div className="flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg">A</span>
          </div>
          <span className="font-heading text-xl font-semibold text-forest">Aveonel Global</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-forest transition-colors">How It Works</a>
          <a href="#services" className="text-sm font-medium text-gray-600 hover:text-forest transition-colors">Services</a>
          <a href="#founder" className="text-sm font-medium text-gray-600 hover:text-forest transition-colors">About</a>
          <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-forest transition-colors">FAQ</a>
        </nav>
        
        <Link 
          to="/apply" 
          className="btn-primary text-sm px-6 py-3"
          data-testid="header-cta-btn"
        >
          Apply for Pilot
        </Link>
      </div>
    </div>
  </header>
);

// Hero Section
const HeroSection = () => (
  <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20400%20400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23noiseFilter%29%22%20opacity%3D%220.03%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />
    
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div 
          className="space-y-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/10 text-forest text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Now accepting 10 Ontario coaches
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight"
          >
            Your coaching business deserves{' '}
            <span className="text-forest">organized operations</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-gray-600 max-w-xl"
          >
            Stop losing clients to messy scheduling and slow onboarding. We help Ontario coaches streamline their operations so they can focus on what matters — coaching.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              to="/apply" 
              className="btn-primary gap-2"
              data-testid="hero-cta-btn"
            >
              Book Free Consultation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#how-it-works" 
              className="btn-secondary gap-2"
              data-testid="hero-secondary-btn"
            >
              See How It Works
              <ChevronDown className="w-5 h-5" />
            </a>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="flex items-center gap-6 pt-4"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-forest" />
              <span>30-day free pilot</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-forest" />
              <span>No commitment</span>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-forest/10 to-beige/30 rounded-3xl blur-2xl" />
          <img 
            src="https://images.unsplash.com/photo-1704655295066-681e61ecca6b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHw0fHxlbGVnYW50JTIwb2ZmaWNlJTIwaW50ZXJpb3IlMjBjYWxtJTIwYmVpZ2V8ZW58MHx8fHwxNzcyOTI2MjIxfDA&ixlib=rb-4.1.0&q=85&w=800"
            alt="Elegant organized workspace"
            className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

// Problem Section
const ProblemSection = () => (
  <section className="section-padding bg-white">
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
          Sound familiar?
        </h2>
        <p className="text-lg text-gray-600">
          Most coaches we meet are dealing with the same operational headaches.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Calendar,
            title: "Scheduling chaos",
            description: "Back-and-forth emails, double bookings, and missed appointments eating into your coaching time."
          },
          {
            icon: Clock,
            title: "Slow onboarding",
            description: "New clients waiting days for intake forms, contracts, and session details — losing momentum."
          },
          {
            icon: BarChart3,
            title: "No clear pipeline",
            description: "Sticky notes and spreadsheets can't tell you who needs follow-up or where clients stand."
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card-feature group"
          >
            <div className="w-14 h-14 rounded-2xl bg-terracotta/10 flex items-center justify-center mb-6 group-hover:bg-terracotta/20 transition-colors">
              <item.icon className="w-7 h-7 text-terracotta" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              {item.title}
            </h3>
            <p className="text-gray-600">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// How It Works Section
const HowItWorksSection = () => (
  <section id="how-it-works" className="section-padding bg-cream-subtle">
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
          How the pilot works
        </h2>
        <p className="text-lg text-gray-600">
          A simple 3-step process to transform your operations in 30 days.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {[
          {
            step: "01",
            title: "Book a consultation",
            description: "Schedule a free 20-minute call. We'll discuss your current challenges and see if the pilot is right for you."
          },
          {
            step: "02",
            title: "Get your systems set up",
            description: "We'll implement scheduling, onboarding, and tracking systems tailored to your coaching practice."
          },
          {
            step: "03",
            title: "Run smoother operations",
            description: "Enjoy 30 days of organized operations. If it works, we continue. If not, no obligation."
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="relative"
          >
            <div className="text-8xl font-heading font-bold text-forest/10 absolute -top-4 -left-2">
              {item.step}
            </div>
            <div className="relative pt-16">
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <Link 
          to="/apply" 
          className="btn-primary gap-2"
          data-testid="how-it-works-cta-btn"
        >
          Start Your Pilot
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  </section>
);

// Services Section
const ServicesSection = () => (
  <section id="services" className="section-padding bg-white">
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
          What you get in the pilot
        </h2>
        <p className="text-lg text-gray-600">
          Three core systems to bring order to your coaching practice.
        </p>
      </motion.div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {[
          {
            icon: Calendar,
            title: "Scheduling System",
            features: [
              "Calendar integration",
              "Automated booking links",
              "Reminder emails",
              "Rescheduling workflow",
              "Timezone handling"
            ],
            accent: "forest"
          },
          {
            icon: Users,
            title: "Client Onboarding",
            features: [
              "Welcome sequences",
              "Intake forms",
              "Contract delivery",
              "Resource sharing",
              "First session prep"
            ],
            accent: "terracotta"
          },
          {
            icon: ClipboardCheck,
            title: "Pipeline Tracker",
            features: [
              "Lead management",
              "Status tracking",
              "Follow-up reminders",
              "Notes & history",
              "Progress visibility"
            ],
            accent: "beige"
          }
        ].map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-cream rounded-2xl p-8 border border-[#E5E5E0]"
          >
            <div className={`w-16 h-16 rounded-2xl ${
              service.accent === 'forest' ? 'bg-forest/10' :
              service.accent === 'terracotta' ? 'bg-terracotta/10' :
              'bg-beige/50'
            } flex items-center justify-center mb-6`}>
              <service.icon className={`w-8 h-8 ${
                service.accent === 'forest' ? 'text-forest' :
                service.accent === 'terracotta' ? 'text-terracotta' :
                'text-forest'
              }`} />
            </div>
            
            <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
              {service.title}
            </h3>
            
            <ul className="space-y-3">
              {service.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// Founder Section
const FounderSection = () => (
  <section id="founder" className="section-padding bg-forest text-white">
    <div className="section-container">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl" />
          <img 
            src="https://images.unsplash.com/flagged/photo-1551135049-83f3419ef05c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMG1lZXRpbmclMjBjb25zdWx0aW5nJTIwZGl2ZXJzZSUyMHByb2Zlc3Npb25hbHxlbnwwfHx8fDE3NzI5MjYyMjJ8MA&ixlib=rb-4.1.0&q=85&w=600"
            alt="Professional consulting"
            className="relative rounded-2xl w-full object-cover aspect-square"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-semibold">
            Meet Aovila Saandeep
          </h2>
          <p className="text-white/80 text-lg">
            Founder of Aveonel Global
          </p>
          <div className="space-y-4 text-white/90">
            <p>
              I started Aveonel Global because I saw too many talented coaches drowning in administrative work instead of doing what they do best — helping their clients transform.
            </p>
            <p>
              After years of working with service-based businesses, I noticed a pattern: the coaches who thrived weren't necessarily better at coaching. They simply had better systems.
            </p>
            <p>
              That's why I built this pilot program — to give Ontario coaches the operational foundation they need to scale their practice without the overwhelm.
            </p>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <MapPin className="w-4 h-4" />
              <span>Ontario, Canada</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Testimonials Section
const TestimonialsSection = () => (
  <section className="section-padding bg-cream-subtle">
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
          What coaches are saying
        </h2>
        <p className="text-lg text-gray-600">
          Early pilot participants share their experience.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            quote: "Finally, I can focus on coaching instead of chasing calendar links. The onboarding flow alone saved me hours every week.",
            name: "Sarah M.",
            role: "Business Coach",
            location: "Toronto"
          },
          {
            quote: "I was skeptical at first, but the 30-day pilot proved its worth. My clients now have a seamless experience from first contact.",
            name: "Michael R.",
            role: "Executive Coach",
            location: "Ottawa"
          },
          {
            quote: "The pipeline tracker is a game-changer. I finally know exactly where each client stands without digging through emails.",
            name: "Jennifer L.",
            role: "Life Coach",
            location: "Hamilton"
          }
        ].map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card-testimonial"
          >
            <div className="text-5xl text-forest/20 font-heading absolute top-6 left-8">"</div>
            <p className="text-gray-700 mb-6 relative z-10">
              {testimonial.quote}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center">
                <span className="font-heading font-semibold text-forest">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role} · {testimonial.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// FAQ Section
const FAQSection = () => (
  <section id="faq" className="section-padding bg-white">
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
          Frequently asked questions
        </h2>
      </motion.div>
      
      <div className="max-w-2xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {[
            {
              question: "Who is this pilot for?",
              answer: "This pilot is specifically designed for Ontario-based coaches and consultants earning $3,000–$5,000/month or more who struggle with scheduling, client onboarding, or tracking their pipeline. If you spend too much time on admin instead of coaching, this is for you."
            },
            {
              question: "What does the 30-day pilot include?",
              answer: "You get a complete setup of three core systems: scheduling (calendar integration + automated booking), client onboarding (intake forms, welcome sequences), and a pipeline tracker to see where every client stands. Plus ongoing support throughout the pilot."
            },
            {
              question: "Is the pilot really free?",
              answer: "Yes. The 30-day pilot is completely free with no hidden costs. We're building our client base and gathering testimonials. If the systems work for you, we'll discuss continuing. If not, there's no obligation."
            },
            {
              question: "How much time will this take from me?",
              answer: "The initial consultation is 20 minutes. Setup typically requires 1-2 hours of your input to customize the systems to your practice. After that, the systems run automatically — saving you time, not costing it."
            },
            {
              question: "What happens after the 30 days?",
              answer: "At the end of the pilot, we'll review your results together. If you're happy, we can discuss ongoing support options. If you decide it's not for you, you keep the systems we've set up — no strings attached."
            },
            {
              question: "Why only Ontario coaches?",
              answer: "We're starting local to provide better, more personalized service. Understanding Ontario's coaching landscape helps us tailor our approach. We may expand to other regions in the future."
            }
          ].map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-cream rounded-xl px-6 border-none"
            >
              <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

// CTA Section
const CTASection = () => (
  <section className="section-padding bg-forest">
    <div className="section-container text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-white">
          Ready to organize your coaching practice?
        </h2>
        <p className="text-white/80 text-lg">
          Join 10 Ontario coaches in our free 30-day operations pilot. Limited spots available.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/apply" 
            className="inline-flex items-center gap-2 bg-white text-forest hover:bg-cream rounded-full px-8 py-4 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            data-testid="cta-section-btn"
          >
            Apply for the Pilot
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/pilot-guide" 
            className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-4 font-medium transition-all duration-300"
            data-testid="download-guide-btn"
          >
            Download Pilot Guide
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="section-container">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">A</span>
            </div>
            <span className="font-heading text-xl font-semibold">Aveonel Global</span>
          </div>
          <p className="text-gray-400 max-w-sm">
            Operations support for Ontario coaches and consultants. Helping you focus on what matters — your clients.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
            <li><a href="#founder" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>hello@aveonelglobal.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Ontario, Canada</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Aveonel Global. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen" data-testid="landing-page">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <ServicesSection />
        <FounderSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
