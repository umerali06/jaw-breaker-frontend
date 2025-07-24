import React from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  Hero,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "../components/ui";

// Sample logo component
const Logo = () => (
  <div className="flex items-center">
    <svg
      className="w-10 h-10 text-primary"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
    <span className="ml-2 text-2xl font-bold text-primary">Jawbreaker</span>
  </div>
);

// Sample hero image
const HeroImage = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-10 rounded-2xl"></div>
    <img
      src="/images/dashboard-preview.png"
      alt="Jawbreaker Dashboard"
      className="rounded-2xl shadow-xl"
    />
  </div>
);

// Sample feature icons
const DocumentIcon = () => (
  <svg
    className="w-12 h-12"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
      clipRule="evenodd"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-12 h-12"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
      clipRule="evenodd"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    className="w-12 h-12"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

// Sample social icons
const FacebookIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
      clipRule="evenodd"
    />
  </svg>
);

const TwitterIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      clipRule="evenodd"
    />
  </svg>
);

const HomePage = () => {
  // Navigation links
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Features", to: "#features" },
    { label: "How It Works", to: "#how-it-works" },
    { label: "Testimonials", to: "#testimonials" },
  ];

  // Navigation actions
  const navActions = [
    { label: "Login", to: "/auth", variant: "outline" },
    { label: "Sign Up", to: "/auth", variant: "accent" },
  ];

  // Features data
  const features = [
    {
      icon: <DocumentIcon />,
      title: "Smart Documentation",
      description:
        "Our AI-powered system automatically analyzes clinical documents, extracting key information and generating structured reports.",
    },
    {
      icon: <ClockIcon />,
      title: "Time-Saving",
      description:
        "Reduce documentation time by up to 60% with automated analysis and report generation, allowing you to focus more on patient care.",
    },
    {
      icon: <ChartIcon />,
      title: "Accurate Analysis",
      description:
        "Advanced machine learning algorithms ensure high accuracy in clinical data extraction and analysis, reducing errors and improving quality.",
    },
  ];

  // How it works steps
  const steps = [
    {
      title: "Upload",
      description: "Upload your clinical documents securely to our platform.",
    },
    {
      title: "Analyze",
      description:
        "Our AI analyzes the documents and extracts key information.",
    },
    {
      title: "Review",
      description: "Review the analysis and make any necessary adjustments.",
    },
    {
      title: "Use",
      description:
        "Use the structured data for reports, billing, or patient care.",
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote:
        "Jawbreaker has revolutionized our clinical documentation process. We've reduced our documentation time by 50% while improving accuracy.",
      author: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      rating: 5,
    },
    {
      quote:
        "The AI-powered analysis is incredibly accurate. It catches details I might miss and helps ensure our documentation is complete and compliant.",
      author: "Dr. Michael Chen",
      role: "Family Physician",
      rating: 5,
    },
    {
      quote:
        "As a busy clinician, Jawbreaker has been a game-changer. I can focus more on my patients and less on paperwork.",
      author: "Dr. Emily Rodriguez",
      role: "Pediatrician",
      rating: 4,
    },
  ];

  // Footer links
  const footerLinks = [
    {
      title: "Product",
      items: [
        { label: "Features", to: "#features" },
        { label: "Pricing", to: "/pricing" },
        { label: "Security", to: "/security" },
        { label: "Roadmap", to: "/roadmap" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Documentation", to: "/docs" },
        { label: "Guides", to: "/guides" },
        { label: "API Reference", to: "/api" },
        { label: "Support", to: "/support" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About Us", to: "/about" },
        { label: "Blog", to: "/blog" },
        { label: "Careers", to: "/careers" },
        { label: "Contact", to: "/contact" },
      ],
    },
  ];

  // Social links
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: <FacebookIcon />,
    },
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: <TwitterIcon />,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      icon: <LinkedInIcon />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar logo={<Logo />} links={navLinks} actions={navActions} />

      {/* Hero Section */}
      <Hero
        title="AI-Powered Clinical Documentation Assistant"
        subtitle="Streamline your clinical documentation process with our advanced AI technology. Save time, reduce errors, and improve patient care."
        primaryCTA={{ label: "Try Demo", to: "/auth" }}
        secondaryCTA={{ label: "Learn More", to: "#features" }}
        image={<HeroImage />}
      />

      {/* Features Section */}
      <FeaturesSection
        id="features"
        title="Powerful Features"
        subtitle="Our AI-powered platform offers a range of features to streamline your clinical documentation process."
        features={features}
      />

      {/* How It Works Section */}
      <HowItWorksSection
        id="how-it-works"
        title="How It Works"
        subtitle="Our simple four-step process makes clinical documentation easier than ever."
        steps={steps}
      />

      {/* Testimonials Section */}
      <TestimonialsSection
        id="testimonials"
        title="What Our Users Say"
        subtitle="Trusted by healthcare professionals around the world."
        testimonials={testimonials}
      />

      {/* CTA Section */}
      <CTASection
        title="Ready to streamline your clinical documentation?"
        subtitle="Join thousands of healthcare professionals who are saving time and improving accuracy with Jawbreaker."
        buttonText="Get Started Now"
        buttonLink="/auth"
      />

      {/* Footer */}
      <Footer
        logo={<Logo />}
        description="Jawbreaker is an AI-powered clinical documentation assistant that helps healthcare professionals save time and improve accuracy."
        links={footerLinks}
        socialLinks={socialLinks}
      />
    </div>
  );
};

export default HomePage;
