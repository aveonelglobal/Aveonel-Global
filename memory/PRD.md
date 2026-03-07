# Aveonel Global - Product Requirements Document

## Original Problem Statement
Build a launch-ready website and go-to-market system for Aveonel Global, an operations support service for Ontario-based coaches and consultants. The system includes:
- Professional website introducing the service
- Consultation booking system (Calendly embed)
- Pilot application form to qualify participants (10 spots, free 30-day pilot)
- Admin dashboard with pipeline tracker
- Automated email confirmations/reminders (SendGrid)

## User Personas

### Primary: Ontario Coaches/Consultants
- Earning $3K-$5K+/month
- Struggling with scheduling, onboarding, client tracking
- Looking for operational support to scale their practice

### Secondary: Admin (Founder)
- Aovila Saandeep
- Needs to track pilot applicants through pipeline stages
- Manages client relationships and onboarding

## Core Requirements (Static)

### Website
- [x] Landing page with hero, problem, solution, how it works, services, founder, testimonials, FAQ
- [x] Responsive design (mobile, tablet, desktop)
- [x] Brand: cream background, forest green accents, beige secondary
- [x] Fonts: Playfair Display (headings), Manrope (body)

### Pilot Application
- [x] Application form with validation
- [x] Fields: name, email, phone, business type, revenue range, biggest challenge
- [x] Ontario-based verification
- [x] Thank you page after submission
- [ ] Calendly integration for scheduling (placeholder ready)

### Admin Dashboard
- [x] JWT authentication (register/login)
- [x] Pipeline kanban view (5 stages)
- [x] Stats overview (total leads, by stage, spots remaining)
- [x] Client detail modal with notes
- [x] Stage transition via dropdown

### Email Automation
- [ ] SendGrid integration (placeholder ready)
- [ ] Confirmation emails
- [ ] Reminder emails

## What's Been Implemented (Jan 2026)

### Backend (FastAPI + MongoDB)
- Auth endpoints: /api/auth/register, /api/auth/login, /api/auth/me
- Pilot application: /api/pilot/apply
- Client CRUD: /api/clients, /api/clients/{id}
- Dashboard stats: /api/dashboard/stats
- CSV export: /api/clients/export/csv
- Webhook placeholder: /api/webhooks/calendly

### Frontend (React + Tailwind + Shadcn)
- Landing page with all sections
- Pilot application form with validation
- Thank you page
- Admin login/register
- Admin dashboard with kanban pipeline
- Client detail modal

### Design System
- Custom Tailwind config with brand colors
- Font imports (Playfair Display, Manrope)
- Component styles (btn-primary, card-feature, etc.)

## Prioritized Backlog

### P0 (Blocking Launch)
- [ ] Add real Calendly URL to embed
- [ ] Configure SendGrid API key for emails

### P1 (Important)
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Email templates (confirmation, reminders, acceptance)
- [ ] Calendly webhook integration

### P2 (Nice to Have)
- [ ] CSV client export download
- [ ] Testimonial collection form
- [ ] Analytics (GA4) integration
- [ ] SEO meta tags

## Next Tasks
1. User to provide Calendly scheduling URL
2. User to provide SendGrid API key
3. Implement email templates
4. Add privacy/terms pages
5. Set up analytics tracking

## Tech Stack
- Frontend: React, Tailwind CSS, Shadcn/UI, Framer Motion
- Backend: FastAPI, Motor (MongoDB async)
- Database: MongoDB
- Auth: JWT (python-jose)
- Hosting: Emergent preview environment
