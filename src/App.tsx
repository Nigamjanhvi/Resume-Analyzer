/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Linkedin, 
  Twitter, 
  Github, 
  Menu, 
  X,
  Cpu,
  Zap,
  Target,
  Users,
  Lock,
  LogOut,
  Trash2,
  Clock,
  AlertCircle,
  Send,
  Maximize2,
  Minimize2,
  Bot,
  ChevronDown,
  Paperclip,
  Smile
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  User
} from './firebase';
import { deleteDoc, doc } from 'firebase/firestore';

const Navbar = ({ onGetStarted, user, onSignOut }: { onGetStarted: () => void, user: User | null, onSignOut: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Use a small timeout to allow the mobile menu to start closing
    setTimeout(() => {
      const id = href.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const offset = 80; // Height of fixed navbar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              SmartJob<span className="text-brand-600">AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pl-3 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 transition-all"
                  >
                    <span className="text-sm font-bold text-slate-700">{user.displayName?.split(' ')[0]}</span>
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                      alt="User" 
                      className="w-8 h-8 rounded-full border border-white"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                      >
                        <button 
                          onClick={() => {
                            onSignOut();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  onClick={onGetStarted}
                  className="bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                >
                  Get Started
                </button>
              )}
            </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 px-3 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                      <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                        alt="User" 
                        className="w-10 h-10 rounded-full border border-white"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onSignOut();
                        setIsOpen(false);
                      }}
                      className="w-full bg-red-50 text-red-600 px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      onGetStarted();
                    }}
                    className="w-full bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-semibold"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onGetStarted, onMatchingClick }: { onGetStarted: () => void, onMatchingClick: () => void }) => {
  return (
    <section id="home" className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3" />
              Next-Gen Job Hunting
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
              Land Your Dream Job with <span className="text-brand-600">AI Intelligence.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              SmartJobAI uses advanced algorithms to match your skills with the perfect opportunities, optimize your resume, and prepare you for the toughest interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onGetStarted()}
                className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2 group"
              >
                Try Now Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onMatchingClick()}
                className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5 text-brand-600" />
                Smart Job Matching
              </button>
            </div>
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-900">2,000+</span> professionals already hired
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 lg:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                      <Search className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Smart Match</p>
                      <p className="font-bold text-slate-900">Senior Product Designer</p>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-bold">98% Match</div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '98%' }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-full bg-brand-600"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Skills Analysis</span>
                    <span>Optimized</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <FileText className="w-5 h-5 text-brand-600 mb-2" />
                    <p className="text-xs font-bold text-slate-900">Resume Score</p>
                    <p className="text-xl font-bold text-brand-600">A+</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <MessageSquare className="w-5 h-5 text-brand-600 mb-2" />
                    <p className="text-xs font-bold text-slate-900">Interview Prep</p>
                    <p className="text-xl font-bold text-brand-600">Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Features = ({ onFeatureClick }: { onFeatureClick: (feature: string) => void }) => {
  const features = [
    {
      id: 'matching',
      title: 'Smart Job Matching',
      description: 'Our AI analyzes thousands of job postings to find the ones that perfectly align with your unique skill set and career goals.',
      icon: Search,
      color: 'bg-blue-50 text-blue-600',
      isLive: true
    },
    {
      id: 'resume',
      title: 'Resume Optimization',
      description: 'Automatically tailor your resume for every application. Our AI ensures you pass through ATS filters and catch recruiters\' eyes.',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 'interview',
      title: 'Interview Preparation',
      description: 'Get personalized interview tips and practice questions based on the specific role and company you\'re applying for.',
      icon: MessageSquare,
      color: 'bg-cyan-50 text-cyan-600'
    },
    {
      id: 'alerts',
      title: 'Personalized Job Alerts',
      description: 'Never miss an opportunity. Get real-time notifications for jobs that match your profile as soon as they are posted.',
      icon: Bell,
      color: 'bg-brand-50 text-brand-600'
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">Powerful AI Features</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need to navigate the modern job market with confidence and efficiency.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onFeatureClick(feature.id)}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative`}>
                <feature.icon className="w-7 h-7" />
                {feature.isLive && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-6 flex items-center text-brand-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Try Feature <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Upload your current resume or build one from scratch. Our AI extracts your core skills and experiences.'
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our advanced algorithms analyze your profile against millions of data points to identify your market value and best-fit roles.'
    },
    {
      number: '03',
      title: 'Smart Matching',
      description: 'Receive a curated list of job openings that match your skills, preferences, and career aspirations.'
    },
    {
      number: '04',
      title: 'Apply & Succeed',
      description: 'Use our automated tools to optimize your application and prepare for interviews. Land your dream job faster.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-8">How It Works</h2>
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-display font-bold text-lg shadow-lg shadow-brand-200">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-brand-50 rounded-[40px] flex items-center justify-center p-8 lg:p-16">
              <div className="relative w-full h-full bg-white rounded-3xl shadow-xl border border-brand-100 p-8 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Cpu className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">AI Core Engine</h4>
                <p className="text-slate-500 text-sm mb-8">
                  Powered by state-of-the-art Large Language Models and proprietary matching algorithms.
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-2 h-8 bg-brand-200 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-20 h-20 border-4 border-brand-200 rounded-full opacity-20"></div>
              <div className="absolute bottom-10 left-10 w-12 h-12 bg-brand-400 rounded-lg rotate-12 opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-brand-950 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">About the Project</h2>
            <p className="text-brand-100 text-lg mb-8 leading-relaxed">
              Our mission is to democratize career success. In a rapidly changing job market, we believe everyone deserves a smart companion that understands their potential and helps them reach it.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-brand-800 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-brand-300" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Our Goal</h4>
                  <p className="text-sm text-brand-200">To reduce job search time by 60% through intelligent automation.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-brand-800 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-brand-300" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Target Users</h4>
                  <p className="text-sm text-brand-200">Students, career changers, and seasoned professionals.</p>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-4 pt-0 sm:pt-12">
              <div className="bg-brand-900/50 backdrop-blur-sm border border-brand-800 p-6 rounded-3xl">
                <h5 className="text-3xl font-bold text-brand-400 mb-2">95%</h5>
                <p className="text-sm text-brand-100">Success Rate</p>
              </div>
              <div className="bg-brand-900/50 backdrop-blur-sm border border-brand-800 p-6 rounded-3xl">
                <h5 className="text-3xl font-bold text-brand-400 mb-2">10k+</h5>
                <p className="text-sm text-brand-100">Active Users</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-brand-900/50 backdrop-blur-sm border border-brand-800 p-6 rounded-3xl">
                <h5 className="text-3xl font-bold text-brand-400 mb-2">500+</h5>
                <p className="text-sm text-brand-100">Partner Companies</p>
              </div>
              <div className="bg-brand-900/50 backdrop-blur-sm border border-brand-800 p-6 rounded-3xl">
                <h5 className="text-3xl font-bold text-brand-400 mb-2">24/7</h5>
                <p className="text-sm text-brand-100">AI Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Save to Firestore for reliability
      await addDoc(collection(db, 'messages'), {
        name: formState.name,
        email: formState.email,
        message: formState.message,
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("There was an error sending your message. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-6 sm:p-8 lg:p-16 bg-slate-50">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 mb-6">Get in Touch</h2>
              <p className="text-slate-600 mb-10 text-sm sm:text-base">
                Have questions or feedback? We'd love to hear from you. Our team is here to help you on your journey.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Email Us</p>
                    <a href="mailto:smartjobai5@gmail.com" className="text-sm sm:text-base font-bold text-slate-900 hover:text-brand-600 transition-colors">smartjobai5@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Support</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900">24/7 AI Assistant</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4">Follow Us</p>
                <div className="flex gap-4">
                  {[
                    { Icon: Twitter, href: "#" },
                    { Icon: Linkedin, href: "https://www.linkedin.com/in/anisha68/" },
                    { Icon: Github, href: "https://github.com/anishasuman" }
                  ].map(({ Icon, href }, i) => (
                    <a 
                      key={i} 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-brand-600 hover:shadow-md transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 lg:p-16">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="John Doe"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="john@example.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                    placeholder="How can we help you?"
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}
                {submitted && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    Message sent successfully!
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || submitted}
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : submitted ? (
                    'Message Sent!'
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onAdminClick, isAdmin }: { onAdminClick?: () => void, isAdmin?: boolean }) => {
  return (
    <footer className="py-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-1 rounded-lg">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">
              SmartJob<span className="text-brand-600">AI</span>
            </span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Terms of Service</a>
            <button 
              onClick={onAdminClick}
              className="flex items-center gap-1 hover:text-brand-600 transition-colors"
            >
              <Lock className="w-3 h-3" />
              {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
            </button>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} SmartJobAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 sm:p-8 max-h-[85vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const FeatureModals = ({ activeFeature, onClose, onSignIn, user }: { activeFeature: string | null, onClose: () => void, onSignIn: () => Promise<boolean>, user: User | null }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (activeFeature) {
      setLoading(false);
      setSigningIn(false);
      setResult(null);
      setError(null);
    }
  }, [activeFeature]);

  const handleResumeAnalysis = async () => {
    if (!resumeText.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing. Please check your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: 'user',
          parts: [{
            text: `Analyze the following resume text and provide a score out of 100 and 3-5 specific, actionable improvement suggestions. 
            
            Resume Text:
            ${resumeText}
            
            Return the result in JSON format with 'score' (number) and 'suggestions' (array of strings) fields.`
          }]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["score", "suggestions"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("The AI returned an empty response. Please try again with more detailed resume text.");
      }

      // Clean the response text in case it contains markdown formatting
      const cleanText = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanText);
      
      if (typeof data.score !== 'number' || !Array.isArray(data.suggestions)) {
        throw new Error("The AI returned an invalid data format.");
      }

      setResult(data);
    } catch (err: any) {
      console.error("Resume Analysis Error:", err);
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing.");
      }
      const ai = new GoogleGenAI({ apiKey });

      if (action === 'matching') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{
            parts: [{
              text: `Generate 3 realistic job matches for a professional with the following target role or skills: ${targetRole || 'Software Engineer'}. 
              Return the result in JSON format with a 'matches' array. Each match should have 'company', 'role', 'match' (percentage string), and 'location' fields.`
            }]
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matches: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      company: { type: Type.STRING },
                      role: { type: Type.STRING },
                      match: { type: Type.STRING },
                      location: { type: Type.STRING }
                    },
                    required: ["company", "role", "match", "location"]
                  }
                }
              },
              required: ["matches"]
            }
          }
        });
        
        const text = response.text;
        if (!text) throw new Error("Empty response from AI");
        const cleanText = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanText);
        setResult(data);
      } else if (action === 'interview') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{
            parts: [{
              text: `Generate 3-5 challenging interview questions for the role: ${targetRole || 'Software Engineer'}. 
              Return the result in JSON format with a 'questions' array of strings.`
            }]
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["questions"]
            }
          }
        });
        
        const text = response.text;
        if (!text) throw new Error("Empty response from AI");
        const cleanText = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanText);
        setResult(data);
      } else if (action === 'alerts') {
        // For alerts, we just simulate success with a nice message
        setResult({
          status: 'Success',
          message: `Smart alerts activated for "${targetRole || 'Product Designer'}" roles.`
        });
      }
    } catch (err: any) {
      console.error("AI Action Error:", err);
      setError("AI service unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal 
        isOpen={activeFeature === 'matching'} 
        onClose={onClose} 
        title="Smart Job Matching"
      >
        <div className="space-y-6">
          <p className="text-slate-600">Scan your profile against our global database to find your perfect match.</p>
          {!result && !loading && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Target Role or Skills</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Product Designer" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <button 
                onClick={() => handleAction('matching')}
                disabled={loading}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Scanning...' : 'Start AI Matching Scan'}
              </button>
              {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Analyzing 10,000+ job postings...</p>
            </div>
          )}
          {result?.matches && (
            <div className="space-y-4">
              {result.matches.map((job: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-slate-900">{job.role}</p>
                    <p className="text-sm text-slate-500">{job.company} • {job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-600 font-bold">{job.match}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Match Score</p>
                  </div>
                </motion.div>
              ))}
              <button onClick={onClose} className="w-full mt-4 text-slate-500 font-bold text-sm hover:text-brand-600 transition-colors">
                Close and View All Results
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={activeFeature === 'resume'} 
        onClose={onClose} 
        title="Resume Optimization"
      >
        <div className="space-y-6">
          {!result && !loading && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Paste your resume text below for a comprehensive AI analysis and optimization suggestions.</p>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-48 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none text-sm"
              />
              {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
              <button 
                onClick={handleResumeAnalysis}
                disabled={!resumeText.trim()}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze & Optimize
              </button>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium">AI is analyzing your career path...</p>
            </div>
          )}
          {result?.suggestions && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-brand-50 rounded-2xl border border-brand-100">
                <div>
                  <p className="text-xs font-bold text-brand-600 uppercase">AI Resume Score</p>
                  <p className="text-3xl font-bold text-brand-900">{result.score}/100</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-brand-200 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-brand-600" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-slate-900">AI Optimization Suggestions:</p>
                {result.suggestions.map((s: string, i: number) => (
                  <div key={i} className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  setResult(null);
                  setResumeText('');
                }}
                className="w-full text-brand-600 font-bold text-sm hover:underline"
              >
                Analyze Another Resume
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={activeFeature === 'interview'} 
        onClose={onClose} 
        title="Interview Preparation"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Target Role</label>
            <input 
              type="text" 
              placeholder="e.g. Senior Frontend Developer" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>
          {!result && !loading && (
            <div className="space-y-4">
              <button 
                onClick={() => handleAction('interview')}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all"
              >
                Generate Practice Questions
              </button>
              {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Researching company culture...</p>
            </div>
          )}
          {result?.questions && (
            <div className="space-y-4">
              {result.questions.map((q: string, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-brand-600 uppercase mb-1">Question {i+1}</p>
                  <p className="font-medium text-slate-900">{q}</p>
                </div>
              ))}
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mt-4">
                Start Mock Interview
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={activeFeature === 'alerts'} 
        onClose={onClose} 
        title="Personalized Job Alerts"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Keywords</label>
              <input 
                type="text" 
                placeholder="e.g. Product Designer" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
              <input type="text" defaultValue="Remote" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
          {!result && !loading && (
            <div className="space-y-4">
              <button 
                onClick={() => handleAction('alerts')}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Enable Smart Alerts
              </button>
              {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Configuring notification engine...</p>
            </div>
          )}
          {result?.status === 'Success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">Alerts Active!</h4>
              <p className="text-slate-500 text-sm">{result.message}</p>
              <button onClick={onClose} className="mt-8 text-brand-600 font-bold">Back to Dashboard</button>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={activeFeature === 'get-started'} 
        onClose={onClose} 
        title="Welcome to SmartJobAI"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-brand-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-brand-200 rotate-3">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">
              {user ? `Welcome back, ${user.displayName?.split(' ')[0]}!` : 'Ready to accelerate your career?'}
            </h4>
            <p className="text-slate-500">
              {user ? 'Continue your journey to landing your dream role with AI-powered tools.' : 'Join 10,000+ professionals using AI to land their dream roles.'}
            </p>
          </div>
          {!user ? (
            <div className="space-y-3 pt-4">
              <button 
                disabled={signingIn}
                onClick={async () => {
                  setSigningIn(true);
                  const success = await onSignIn();
                  setSigningIn(false);
                  if (success) {
                    onClose();
                  }
                }}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {signingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                )}
                {signingIn ? 'Signing in...' : 'Sign In with Google'}
              </button>
              <button className="w-full bg-white text-slate-900 border border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                Continue with Email
              </button>
            </div>
          ) : (
            <div className="pt-4">
              <button 
                onClick={onClose}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
          <p className="text-xs text-slate-400">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </Modal>
    </>
  );
};

const AdminDashboard = ({ user, onSignOut }: { user: User, onSignOut: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'messages', deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Messages Dashboard</h1>
            <p className="text-slate-500 text-sm sm:text-base">Manage incoming inquiries from SmartJobAI</p>
          </div>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No messages yet</h3>
            <p className="text-slate-500">When users contact you, their messages will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {messages.map((msg) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{msg.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
                      <Clock className="w-3 h-3" />
                      {msg.createdAt?.toDate().toLocaleString() || 'Just now'}
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${msg.email}&su=Reply from SmartJobAI&body=Hi ${msg.name}, thank you for reaching out.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                        title="Reply via Gmail"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Reply</span>
                      </a>
                      <button 
                        onClick={() => setDeleteId(msg.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 border border-slate-100">
                  {msg.message}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Confirm Deletion"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Delete Message?</h4>
            <p className="text-slate-500">This action cannot be undone. Are you sure you want to permanently delete this message?</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setDeleteId(null)}
              className="flex-1 bg-white text-slate-900 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Homepage embedded chat preview section ──────────────────────
const ChatSection = ({ onOpenBot }: { onOpenBot: () => void }) => {
  const previews = [
    { role: 'bot', text: "👋 Hi! Paste a Job Description + your resume and I'll give you an ATS score, matched skills, and what you're missing." },
    { role: 'user', text: "Here's the JD for a Senior React Developer role at Google..." },
    { role: 'bot', text: "✅ Analysis complete! ATS Score: 82/100 | Match: 76%\n\n✅ Matched: React, TypeScript, REST APIs\n❌ Missing: GraphQL, Jest, System Design" },
    { role: 'user', text: "How do I improve my resume?" },
    { role: 'bot', text: "🚀 Add quantified achievements — instead of 'built features', write 'reduced load time by 40%'. Also add GraphQL to your skills section!" },
  ];

  return (
    <section id="chat-assistant" className="py-24 bg-gradient-to-br from-slate-900 via-[#0a1628] to-brand-950 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Bot className="w-3 h-3" />
              AI Resume Analyzer
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Chat with your <span className="text-brand-400">Career AI</span> Assistant
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Just paste any job description and your resume. Our WhatsApp-style AI bot instantly scores your ATS compatibility, spots missing skills, and gives you a clear action plan.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                '📊 ATS Score out of 100 with match percentage',
                '✅ Matched skills & ❌ missing skills highlighted',
                '🚀 Personalized rewrite & improvement tips',
                '🎤 Interview prep questions for your target role',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onOpenBot}
              className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-brand-900/50 flex items-center gap-2 group"
            >
              <Bot className="w-5 h-5" />
              Open ResumeBot Chat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Right - chat preview mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="bg-[#eae6df] rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-w-sm mx-auto">
              {/* Fake WA header */}
              <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-blue-400 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">ResumeBot AI</p>
                  <p className="text-[11px] text-green-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> online
                  </p>
                </div>
              </div>
              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[320px]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8b8a2' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
              >
                {previews.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-sm
                      ${msg.role === 'bot'
                        ? 'bg-white text-slate-800 rounded-tl-sm'
                        : 'bg-[#dcf8c6] text-slate-800 rounded-tr-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Fake input */}
              <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2 border-t border-slate-200">
                <div className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-slate-400 shadow-sm">
                  Type a message...
                </div>
                <div className="w-8 h-8 bg-[#075e54] rounded-full flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-brand-500/20 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// =============================================
// WHATSAPP-STYLE AI RESUME ANALYZER CHATBOT
// =============================================

type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  type?: 'score' | 'skills' | 'normal';
  data?: any;
};

type ChatStep = 'intro' | 'awaiting_jd' | 'awaiting_resume' | 'analyzing' | 'done';

const SYSTEM_PROMPT = `You are ResumeBot, an expert AI Resume Analyzer integrated into SmartJobAI. 
You help job seekers analyze how well their resume matches a job description.

Your analysis MUST follow this exact structure and return JSON:
{
  "ats_score": <number 0-100>,
  "match_percentage": <number 0-100>,
  "overall_grade": "<A+/A/B+/B/C+/C/D>",
  "summary": "<2-3 sentence friendly summary>",
  "matched_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "weak_sections": ["section description", ...],
  "ats_issues": ["issue1", "issue2", ...],
  "top_recommendations": ["action 1", "action 2", "action 3"],
  "future_skills": ["emerging skill 1", "emerging skill 2", ...]
}

Be encouraging, specific, and actionable. Focus on real ATS optimization advice.`;

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ScoreCard = ({ data }: { data: any }) => (
  <div className="mt-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-brand-600 to-blue-500 p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">ATS Score</p>
          <p className="text-4xl font-bold">{data.ats_score}<span className="text-lg">/100</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Match</p>
          <p className="text-4xl font-bold">{data.match_percentage}<span className="text-lg">%</span></p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-2xl font-black">{data.overall_grade}</span>
        </div>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
      
      {data.matched_skills?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-green-600 uppercase mb-2">✅ Matched Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {data.matched_skills.map((s: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">{s}</span>
            ))}
          </div>
        </div>
      )}

      {data.missing_skills?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-red-500 uppercase mb-2">❌ Missing Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {data.missing_skills.map((s: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100">{s}</span>
            ))}
          </div>
        </div>
      )}

      {data.ats_issues?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-orange-500 uppercase mb-2">⚠️ ATS Issues</p>
          <ul className="space-y-1">
            {data.ats_issues.map((issue: string, i: number) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2"><span className="text-orange-400">•</span>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {data.top_recommendations?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-brand-600 uppercase mb-2">🚀 Top Recommendations</p>
          <ul className="space-y-1">
            {data.top_recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2"><span className="text-brand-400">→</span>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {data.future_skills?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-purple-600 uppercase mb-2">🔮 Future Skills to Learn</p>
          <div className="flex flex-wrap gap-1.5">
            {data.future_skills.map((s: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1 items-center h-4">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// Render simple markdown: **bold**, *italic*, newlines, bullet points
const RenderText = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  return (
    <span>
      {lines.map((line, li) => {
        // Parse bold (**text**) and italic (*text*)
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        const rendered = parts.map((part, pi) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pi}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <em key={pi}>{part.slice(1, -1)}</em>;
          }
          return <span key={pi}>{part}</span>;
        });
        return (
          <span key={li}>
            {rendered}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
};

const ChatBubble = ({ msg }: { msg: ChatMessage; key?: string }) => {
  const isBot = msg.role === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 mb-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {isBot && (
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] ${isBot ? '' : ''}`}>
        <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed
          ${isBot 
            ? 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm' 
            : 'bg-brand-600 text-white rounded-br-sm'
          }`}
        >
          {isBot
            ? <RenderText text={msg.text} />
            : msg.text}
          {msg.type === 'score' && msg.data && <ScoreCard data={msg.data} />}
        </div>
        <p className={`text-[10px] text-slate-400 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
          {formatTime(msg.timestamp)}
          {!isBot && <span className="ml-1 text-brand-400">✓✓</span>}
        </p>
      </div>
    </motion.div>
  );
};

const ResumeAnalyzerBot = ({ externalOpen, onExternalOpenHandled }: { externalOpen?: boolean; onExternalOpenHandled?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<ChatStep>('intro');
  const [jd, setJd] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastResume, setLastResume] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle external open trigger (from homepage button)
  useEffect(() => {
    if (externalOpen) {
      handleOpen();
      onExternalOpenHandled?.();
      // Scroll to bottom of page to show the bot
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }
  }, [externalOpen]);

  const addBotMessage = useCallback((text: string, type?: 'score' | 'skills' | 'normal', data?: any) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: 'bot',
      text,
      timestamp: new Date(),
      type,
      data,
    };
    setMessages(prev => [...prev, msg]);
    if (!isOpen) setHasNewMessage(true);
  }, [isOpen]);

  const addUserMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  };

  // Initialize chat on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage("👋 Hi! I'm *ResumeBot*, your AI-powered career assistant.\n\nI can analyze your resume against a job description and give you:\n• 📊 ATS Score & Match %\n• ✅ Matched & ❌ Missing Skills\n• 🚀 Actionable recommendations\n\nReady to get started?");
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              addBotMessage("📋 *Step 1 of 2:* Please paste the **Job Description** you want to apply for.");
              setStep('awaiting_jd');
            }, 1000);
          }, 600);
        }, 1200);
      }, 400);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  // File upload handler — uses client-side extraction (pdfjs-dist for PDF, mammoth for DOCX)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const fileName = file.name.toLowerCase();
    const validExts = ['.pdf', '.txt', '.docx', '.doc'];
    if (!validExts.some(ext => fileName.endsWith(ext))) {
      addBotMessage('⚠️ Please upload a **PDF**, **TXT**, or **DOCX** file.');
      return;
    }

    addUserMessage(`📎 Uploaded: ${file.name}`);
    setUploadingFile(true);
    setIsTyping(true);

    try {
      let extractedText = '';

      if (fileName.endsWith('.txt')) {
        extractedText = await file.text();
      } else if (fileName.endsWith('.pdf')) {
        // Extract text from PDF using pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const textParts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          textParts.push(pageText);
        }
        extractedText = textParts.join('\n\n');
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        // Extract text from DOCX using mammoth
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }

      setIsTyping(false);
      setUploadingFile(false);

      if (extractedText.length < 50) {
        addBotMessage('⚠️ Could not extract enough text from the file. Please try pasting your resume text instead.');
        return;
      }

      addBotMessage(`✅ Resume extracted from *${file.name}*! (${extractedText.length} characters)\n\nAnalyzing against the job description...`);
      setLastResume(extractedText);
      await analyzeResume(extractedText);
    } catch (err: any) {
      console.error('File extraction error:', err);
      setIsTyping(false);
      setUploadingFile(false);
      addBotMessage(`❌ Could not process the file. Error: ${err?.message || 'Unknown'}\n\nPlease try pasting your resume text instead.`);
    }
  };

  const analyzeResume = async (resumeText: string) => {
    setIsTyping(true);
    setStep('analyzing');
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `${SYSTEM_PROMPT}

JOB DESCRIPTION:
${jd}

RESUME:
${resumeText}

Analyze thoroughly and return ONLY valid JSON following the exact structure specified.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean);

      setIsTyping(false);
      addBotMessage(`✅ Analysis complete! Here are your results:`, 'score', data);

      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage("💬 Want me to do anything else? You can:\n• Type *'improve'* to get resume rewrite tips\n• Type *'interview'* for interview prep questions\n• Type *'new'* to analyze a different resume");
          setStep('done');
        }, 1000);
      }, 800);

    } catch (err: any) {
      console.error("ResumeBot Analysis Error:", err);
      setIsTyping(false);
      const errorMsg = err?.message?.includes('API Key') 
        ? "❌ API Key is missing. Please make sure the GEMINI_API_KEY environment variable is set.\n\nType *'new'* to start over."
        : `❌ Sorry, I couldn't complete the analysis. Error: ${err?.message || 'Unknown error'}\n\nPlease try again or type *'new'* to start over.`;
      addBotMessage(errorMsg);
      setStep('done');
    }
  };

  const handleFollowUp = async (text: string) => {
    const lower = text.toLowerCase().trim();
    setIsTyping(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      let prompt = '';
      if (lower === 'rewrite' || lower === 'regenerate' || lower === 'rewrite resume') {
        if (!lastResume) {
          setIsTyping(false);
          addBotMessage('⚠️ I don\'t have your resume text saved. Please start a *new* analysis first so I can rewrite it for you.');
          return;
        }
        prompt = `You are ResumeBot, an expert ATS resume writer. The user wants you to COMPLETELY REWRITE their resume to be optimized for this job description.

JOB DESCRIPTION:
"${jd}"

ORIGINAL RESUME:
"${lastResume}"

Generate a COMPLETE, PROFESSIONAL, ATS-OPTIMIZED resume in plain text format. Follow these rules:
1. Use the same personal info (name, contact, education) from the original resume
2. Rewrite ALL bullet points with strong action verbs and quantified achievements
3. Add relevant keywords from the JD naturally throughout
4. Structure it as: SUMMARY → SKILLS → EXPERIENCE → PROJECTS → EDUCATION → CERTIFICATIONS
5. Make each bullet point impactful with metrics where possible
6. Keep it concise (1-2 pages worth of text)
7. Output ONLY the resume text, no commentary

Generate the complete rewritten resume now:`;
      } else if (lower === 'improve' || lower === 'tips') {
        prompt = `You are ResumeBot. The user's resume was analyzed against this job description:
"${jd}"

Their resume was:
"${lastResume?.substring(0, 500) || 'Not available'}"

Give 5 specific, actionable bullet-point tips on how to rewrite and improve their resume to better match the JD. Focus on wording, structure, ATS keywords, and impact metrics. Be concrete and practical. Plain text, use • for bullets.`;
      } else if (lower === 'interview' || lower === 'interview prep') {
        prompt = `You are ResumeBot. Generate 5 targeted interview questions for a candidate applying to a role described by:
"${jd}"

For each question, briefly explain what the interviewer is looking for. Format: Q: [question]\nLook for: [what to highlight]. Plain text, no markdown.`;
      } else if (lower === 'help') {
        setIsTyping(false);
        addBotMessage("Here's what I can help you with:\n\n• Type *'rewrite'* — get a complete ATS-optimized resume rewrite\n• Type *'improve'* — get specific improvement tips\n• Type *'interview'* — get interview questions for this role\n• Type *'new'* — analyze a different resume vs a new JD\n• Or just ask me anything about your resume or the job!");
        return;
      } else {
        prompt = `You are ResumeBot, a career assistant. The user previously analyzed their resume against a job description. Their JD was: "${jd.substring(0, 300)}...". They now say: "${text}". Give a helpful, friendly, concise response (2-3 short paragraphs). Be specific and actionable. Plain conversational text, use • for any lists.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      setIsTyping(false);
      addBotMessage(response.text || "I'd be happy to help! Could you give me more details?");
    } catch {
      setIsTyping(false);
      addBotMessage("Sorry, I'm having trouble connecting. Please try again!");
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    
    setInput('');
    addUserMessage(text);

    if (step === 'awaiting_jd') {
      if (text.length < 50) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addBotMessage("⚠️ That seems too short for a job description. Please paste the full JD (at least a few paragraphs) for an accurate analysis.");
          }, 800);
        }, 300);
        return;
      }
      setJd(text);
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage("✅ Got the job description!\n\n📄 *Step 2 of 2:* Now paste your **Resume** text below, or click the 📎 button to upload your CV file (PDF/TXT/DOCX).\n\nThe more detail you include, the better the analysis.");
          setStep('awaiting_resume');
        }, 900);
      }, 300);
      return;
    }

    if (step === 'awaiting_resume') {
      if (text.length < 100) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addBotMessage("⚠️ Your resume seems too brief. Please paste more content — include your experience, skills, and education sections.");
          }, 800);
        }, 300);
        return;
      }
      setLastResume(text);
      await analyzeResume(text);
      return;
    }

    if (step === 'done') {
      if (text.toLowerCase() === 'new') {
        setJd('');
        setStep('awaiting_jd');
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addBotMessage("🔄 Let's start fresh!\n\n📋 *Step 1 of 2:* Please paste the new **Job Description**.");
          }, 700);
        }, 300);
        return;
      }
      await handleFollowUp(text);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const panelClass = isFullscreen
    ? 'fixed inset-0 z-[100] flex flex-col bg-[#eae6df]'
    : 'fixed bottom-24 right-6 z-[100] w-[380px] max-h-[600px] flex flex-col bg-[#eae6df] rounded-2xl shadow-2xl overflow-hidden';

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-[100] w-16 h-16 bg-gradient-to-br from-brand-600 to-blue-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bot className="w-7 h-7 text-white" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-bounce">
                1
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={panelClass}
          >
            {/* Header - WhatsApp style */}
            <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-blue-400 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">ResumeBot AI</p>
                <p className="text-xs text-green-300 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                  {isTyping ? 'typing...' : 'online'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setMessages([]);
                      setStep('intro');
                      setJd('');
                      setInput('');
                      setIsTyping(false);
                    }}
                    title="Clear chat"
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-xs font-bold text-white/70 hover:text-white"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8b8a2' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            >
              {/* Date chip */}
              <div className="flex justify-center mb-4">
                <span className="bg-[#d1d7db] text-slate-700 text-[11px] font-medium px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply chips — shown in 'done' step */}
            <AnimatePresence>
              {step === 'done' && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 pb-2 flex gap-2 flex-wrap"
                >
                  {['rewrite', 'improve', 'interview', 'new'].map(chip => (
                    <button
                      key={chip}
                      onClick={() => {
                        setInput(chip);
                        setTimeout(() => {
                          addUserMessage(chip);
                          setInput('');
                          if (chip === 'new') {
                            setJd('');
                            setLastResume('');
                            setStep('awaiting_jd');
                            setTimeout(() => {
                              setIsTyping(true);
                              setTimeout(() => {
                                setIsTyping(false);
                                addBotMessage("🔄 Let's start fresh!\n\n📋 *Step 1 of 2:* Please paste the new **Job Description**.");
                              }, 700);
                            }, 300);
                          } else {
                            handleFollowUp(chip);
                          }
                        }, 0);
                      }}
                      className="px-3 py-1.5 bg-white border border-[#075e54] text-[#075e54] rounded-full text-xs font-bold hover:bg-[#075e54] hover:text-white transition-colors shadow-sm"
                    >
                      {chip === 'rewrite' ? '📝 Rewrite Resume' :
                       chip === 'improve' ? '✍️ Improve Tips' :
                       chip === 'interview' ? '🎤 Interview Prep' :
                       '🔄 New Analysis'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step indicator */}
            {(step === 'awaiting_jd' || step === 'awaiting_resume') && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full ${step === 'awaiting_jd' ? 'bg-brand-600' : 'bg-green-500'}`} />
                  <div className={`w-2 h-2 rounded-full ${step === 'awaiting_resume' ? 'bg-brand-600' : 'bg-slate-200'}`} />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {step === 'awaiting_jd' ? 'Paste job description' : 'Paste your resume'}
                </p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Input area - WhatsApp style */}
            <div className="bg-[#f0f2f5] px-3 py-2 flex items-end gap-2 flex-shrink-0 border-t border-slate-200">
              {/* Paperclip button - visible during resume step */}
              {(step === 'awaiting_resume') && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping || uploadingFile}
                  title="Upload resume file (PDF, TXT, DOCX)"
                  className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-[#075e54] hover:bg-white rounded-full transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow-sm flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    step === 'awaiting_jd' ? 'Paste job description here...' :
                    step === 'awaiting_resume' ? 'Paste resume or click 📎 to upload...' :
                    step === 'analyzing' ? 'Analyzing...' :
                    uploadingFile ? 'Processing file...' :
                    "Type a message..."
                  }
                  disabled={isTyping || step === 'analyzing' || uploadingFile}
                  rows={1}
                  className="flex-1 text-sm text-slate-800 outline-none resize-none max-h-32 py-1 placeholder:text-slate-400 disabled:opacity-50 bg-transparent"
                  style={{ lineHeight: '1.4' }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || step === 'analyzing' || uploadingFile}
                className="w-11 h-11 bg-[#075e54] hover:bg-[#128c7e] rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white ml-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [botOpen, setBotOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Check if user is the admin email
      if (currentUser?.email === 'anisha77suman1980@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return !!result.user;
    } catch (error) {
      console.error("Auth Error:", error);
      return false;
    }
  };

  const handleSignOut = () => signOut(auth);

  const handleGetStarted = () => setActiveFeature('get-started');
  const handleFeatureClick = (feature: string) => setActiveFeature(feature);
  const handleCloseModal = () => setActiveFeature(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  // If logged in as admin, show dashboard if they want to see it
  // For simplicity, let's add a toggle or a specific view

  if (isAdmin && showDashboard) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowDashboard(false)}>
                <div className="bg-brand-600 p-1.5 rounded-lg">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                  SmartJob<span className="text-brand-600">AI</span> Admin
                </span>
              </div>
              <button 
                onClick={() => setShowDashboard(false)}
                className="text-sm font-bold text-brand-600 hover:underline"
              >
                Back to Site
              </button>
            </div>
          </div>
        </nav>
        <AdminDashboard user={user!} onSignOut={handleSignOut} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onGetStarted={handleGetStarted} user={user} onSignOut={handleSignOut} />
      <main>
        <Hero onGetStarted={handleGetStarted} onMatchingClick={() => handleFeatureClick('matching')} />
        <Features onFeatureClick={handleFeatureClick} />
        <ChatSection onOpenBot={() => setBotOpen(true)} />
        <HowItWorks />
        <About />
        <Contact />
      </main>
      <Footer onAdminClick={() => {
        if (isAdmin) {
          setShowDashboard(true);
        } else {
          handleSignIn();
        }
      }} isAdmin={isAdmin} />
      
      <FeatureModals 
        activeFeature={activeFeature} 
        onClose={handleCloseModal} 
        onSignIn={handleSignIn}
        user={user}
      />
      <ResumeAnalyzerBot externalOpen={botOpen} onExternalOpenHandled={() => setBotOpen(false)} />
    </div>
  );
}
