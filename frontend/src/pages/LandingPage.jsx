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
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_pilot-launch-4/artifacts/rjad5uf0_AVEONEL%20Logo_%20Clarity%20and%20Prosperity%20-%20Copy.png" 
            alt="Aveonel Global Logo" 
            className="h-12 w-auto"
          />
          <span className="font-heading text-xl font-semibold text-forest hidden sm:block">Aveonel Global</span>
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
              Only 10 spots · Free 30-day pilot
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight"
          >
            Your back-office,{' '}
            <span className="text-forest">handled.</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-gray-600 max-w-xl"
          >
            You became a coach to transform lives — not to drown in scheduling, onboarding, and client tracking. I handle the operational details so you can <span className="font-medium text-gray-900">sleep peacefully</span> and <span className="font-medium text-gray-900">coach freely</span>.
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
              Start Free 30-Day Pilot
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
              <span>For business & executive coaches</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-forest" />
              <span>Ontario, Canada</span>
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
          You didn't become a coach to do admin work
        </h2>
        <p className="text-lg text-gray-600">
          Yet here you are — spending hours on tasks that have nothing to do with coaching.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Calendar,
            title: "Scheduling eats your day",
            description: "Back-and-forth emails, timezone confusion, double bookings. You're a coach, not a calendar manager."
          },
          {
            icon: Clock,
            title: "Clients wait too long",
            description: "New clients excited to start... then wait days for intake forms, contracts, and session details. Momentum dies."
          },
          {
            icon: BarChart3,
            title: "You're dropping balls",
            description: "Who needs follow-up? Where's that client in the process? It's all in your head — and it's exhausting."
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12 p-8 bg-cream-subtle rounded-2xl max-w-2xl mx-auto"
      >
        <p className="text-lg text-gray-700 italic">
          "I just want someone to handle the details so I can focus on my clients and actually sleep at night."
        </p>
        <p className="text-sm text-gray-500 mt-3">— Every coach we've talked to</p>
      </motion.div>
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
          What I handle for you
        </h2>
        <p className="text-lg text-gray-600">
          Three systems. Zero headaches. Complete peace of mind.
        </p>
      </motion.div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {[
          {
            icon: Calendar,
            title: "Scheduling",
            subtitle: "Never chase a calendar again",
            features: [
              "Calendar integration",
              "Automated booking links",
              "Reminder emails (48h, 24h, 1h)",
              "Easy rescheduling",
              "Timezone handling"
            ],
            accent: "forest"
          },
          {
            icon: Users,
            title: "Client Onboarding",
            subtitle: "First impressions, perfected",
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
            title: "Pipeline Tracking",
            subtitle: "Know where every client stands",
            features: [
              "Visual dashboard",
              "Status tracking",
              "Follow-up reminders",
              "Notes & history",
              "Nothing falls through"
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
            
            <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-2">
              {service.title}
            </h3>
            <p className="text-forest font-medium text-sm mb-6">
              {service.subtitle}
            </p>
            
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <p className="text-gray-600 mb-2">After 30-day free pilot</p>
        <p className="text-3xl font-heading font-semibold text-gray-900">$799<span className="text-lg text-gray-500">/month</span></p>
        <p className="text-sm text-gray-500 mt-2">Cancel anytime. No contracts.</p>
      </motion.div>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium">
            The person behind your operations
          </div>
          
          <h2 className="font-heading text-3xl md:text-4xl font-semibold">
            Hi, I'm Aovila
          </h2>
          
          <div className="space-y-4 text-white/90">
            <p>
              I'm not a virtual assistant. I'm not software. <span className="text-white font-medium">I'm your detail-obsessed operations partner.</span>
            </p>
            <p>
              As a former Program Coordinator, I spent years making sure complex training programs ran flawlessly behind the scenes — coordinating clients, sales teams, and trainers, managing deliverables, and ensuring nothing fell through the cracks.
            </p>
            <p>
              I started Aveonel Global because I believe every coach deserves someone who treats their business problems like their own. Someone who sweats the details so you don't have to.
            </p>
            <p className="text-white font-medium text-lg">
              My goal is simple: help you sleep peacefully knowing someone's got your back-office handled.
            </p>
          </div>
          
          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <MapPin className="w-4 h-4" />
              <span>Ontario, Canada</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <CheckCircle2 className="w-4 h-4" />
              <span>Detail-obsessed</span>
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
          Ready to sleep peacefully?
        </h2>
        <p className="text-white/80 text-lg">
          Let me handle your back-office while you focus on coaching. 10 spots available for the free 30-day pilot.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/apply" 
            className="inline-flex items-center gap-2 bg-white text-forest hover:bg-cream rounded-full px-8 py-4 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            data-testid="cta-section-btn"
          >
            Start Free Pilot
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
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_pilot-launch-4/artifacts/rjad5uf0_AVEONEL%20Logo_%20Clarity%20and%20Prosperity%20-%20Copy.png" 
              alt="Aveonel Global Logo" 
              className="h-12 w-auto bg-white rounded-lg p-1"
            />
            <span className="font-heading text-xl font-semibold">Aveonel Global</span>
          </div>
          <p className="text-gray-400 max-w-sm">
            Your back-office, handled. Helping Ontario coaches sleep peacefully and coach freely.
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
