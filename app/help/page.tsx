'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQS = [
  {
    q: 'How does PPP pricing work?',
    a: "Purchasing Power Parity pricing means we adjust the price of each skill based on your country's economic context. A service priced at $50 USD might cost ₹1,500 in India instead of ₹4,150, making it genuinely affordable everywhere."
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We support UPI (PhonePe, GPay, Paytm) for Indian buyers via Razorpay, and credit/debit cards worldwide via Stripe. Both are fully secure and encrypted.'
  },
  {
    q: 'How do I book a call with a seller?',
    a: "On any listing page, click 'Book a Free Intro Call'. Choose a date, time, and share your mobile number. The seller will confirm the call. There's no charge for intro calls."
  },
  {
    q: 'What are Freelance, Part-time, and Long-term engagements?',
    a: 'Freelance means a one-off project or task. Part-time means ongoing work a few hours a week. Long-term means a committed working relationship, often with a monthly retainer. Sellers specify which they offer.'
  },
  {
    q: 'How do I get paid as a seller?',
    a: "Connect your Stripe account from your dashboard. When buyers pay, funds go to your Stripe account after a short holding period. For UPI sellers in India, we're adding Razorpay Connect support soon."
  },
  {
    q: 'Can I sell in multiple countries?',
    a: 'Yes! When creating a listing, select all the countries you want to be available in. We automatically calculate the right PPP price for each market.'
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We use Supabase with Row Level Security — your data is only accessible to you. Payments are handled entirely by Stripe and Razorpay, and we never store card details.'
  },
  {
    q: 'What is the platform fee?',
    a: 'SkillBridge charges a 10% platform fee on each transaction to cover hosting, payment processing, and support. The price you see is what you pay — no surprises.'
  },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production: POST to /api/help-ticket
    setSent(true)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">💡</div>
          <h1 className="text-4xl font-black text-white mb-2">Help Center</h1>
          <p className="text-slate-400">Everything you need to know about SkillBridge.</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { icon: '💳', label: 'Payments', href: '#faq' },
            { icon: '📞', label: 'Book a Call', href: '/browse' },
            { icon: '🧑‍💼', label: 'Sell Skills', href: '/sell' },
            { icon: '✉️', label: 'Contact Us', href: '#contact' },
          ].map(l => (
            <a key={l.label} href={l.href} className="glass p-4 text-center hover:border-violet-500/40 transition-all">
              <div className="text-2xl mb-1">{l.icon}</div>
              <div className="text-xs font-semibold text-slate-300">{l.label}</div>
            </a>
          ))}
        </div>

        {/* FAQ */}
        <div id="faq" className="mb-14">
          <h2 className="text-2xl font-black text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-3"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  <span className={`text-violet-400 transition-transform ${open === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div id="contact" className="glass p-7">
          <h2 className="text-xl font-black text-white mb-1">Still need help?</h2>
          <p className="text-slate-400 text-sm mb-6">Send us a message and we'll get back to you within 24 hours.</p>

          {sent ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">✅</div>
              <div className="font-bold text-white mb-1">Message received!</div>
              <div className="text-slate-400 text-sm">We'll reply to your email within 24 hours.</div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">Name</label>
                  <input className="input-dark" placeholder="Your name" required
                    value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="label-dark">Email</label>
                  <input type="email" className="input-dark" placeholder="you@email.com" required
                    value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label-dark">Message</label>
                <textarea className="input-dark resize-none" rows={4} placeholder="Describe your issue or question..." required
                  value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary px-8 py-2.5 text-sm">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
