"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarbonProfile, FootprintBreakdown, CarbonDNA } from '@/lib/types';
import { calculateFootprint, deriveCarbonDNA, calculateRiskScore } from '@/lib/carbonEngine';

interface OnboardingWizardProps {
  onComplete: (profile: CarbonProfile, breakdown: FootprintBreakdown, dna: CarbonDNA, riskScore: number) => void;
}

const steps = [
  'Transport',
  'Diet',
  'Shopping',
  'Energy',
  'Digital Habits',
  'Household & Region'
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<CarbonProfile>>({
    transportMode: 'car-solo',
    commuteDistanceKm: 15,
    flightsPerYear: 1,
    dietType: 'moderate-meat',
    foodDeliveryPerWeek: 1,
    onlineShoppingPerMonth: 2,
    fastFashionPerMonth: 1,
    electricityKwhPerMonth: 250,
    homeSize: 'medium',
    householdSize: 2,
    streamingHoursPerDay: 3,
    workMode: 'hybrid',
    region: 'North America'
  });

  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Focus management on step change
  useEffect(() => {
    if (stepContainerRef.current) {
      const firstInput = stepContainerRef.current.querySelector('input, select, button');
      if (firstInput) {
        (firstInput as HTMLElement).focus();
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step submit
      const finalProfile = profile as CarbonProfile;
      const breakdown = calculateFootprint(finalProfile);
      const dna = deriveCarbonDNA(finalProfile, breakdown);
      const score = calculateRiskScore(breakdown);
      onComplete(finalProfile, breakdown, dna, score);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateProfile = (key: keyof CarbonProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-50">How do you primarily commute?</h2>
            <div>
              <label htmlFor="transportMode" className="block text-sm font-medium text-emerald-200 mb-2">Transport Mode</label>
              <select 
                id="transportMode"
                value={profile.transportMode} 
                onChange={(e) => updateProfile('transportMode', e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Select your primary transport mode"
              >
                <option value="car-solo">Car (Solo Driver)</option>
                <option value="car-pool">Car (Carpool)</option>
                <option value="public-transit">Public Transit</option>
                <option value="bike-walk">Bike / Walk</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label htmlFor="commuteDistanceKm" className="block text-sm font-medium text-emerald-200 mb-2">Daily Commute Distance (km)</label>
              <input 
                id="commuteDistanceKm"
                type="number" 
                min="0" max="200"
                value={profile.commuteDistanceKm} 
                onChange={(e) => updateProfile('commuteDistanceKm', Math.max(0, Math.min(200, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter your daily commute distance in kilometers"
              />
            </div>
            <div>
              <label htmlFor="flightsPerYear" className="block text-sm font-medium text-emerald-200 mb-2">Flights per year</label>
              <input 
                id="flightsPerYear"
                type="number" 
                min="0" max="50"
                value={profile.flightsPerYear} 
                onChange={(e) => updateProfile('flightsPerYear', Math.max(0, Math.min(50, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter number of flights per year"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-50">What is your typical diet?</h2>
            <div>
              <label htmlFor="dietType" className="block text-sm font-medium text-emerald-200 mb-2">Diet Type</label>
              <select 
                id="dietType"
                value={profile.dietType} 
                onChange={(e) => updateProfile('dietType', e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Select your typical diet"
              >
                <option value="high-meat">High Meat (2+ meals/day)</option>
                <option value="moderate-meat">Moderate Meat (1 meal/day)</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-50">Tell us about your shopping habits</h2>
            <div>
              <label htmlFor="onlineShopping" className="block text-sm font-medium text-emerald-200 mb-2">Online Orders per Month</label>
              <input 
                id="onlineShopping"
                type="number" 
                min="0" max="100"
                value={profile.onlineShoppingPerMonth} 
                onChange={(e) => updateProfile('onlineShoppingPerMonth', Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter number of online orders per month"
              />
            </div>
            <div>
              <label htmlFor="fastFashion" className="block text-sm font-medium text-emerald-200 mb-2">New Clothing Items per Month</label>
              <input 
                id="fastFashion"
                type="number" 
                min="0" max="50"
                value={profile.fastFashionPerMonth} 
                onChange={(e) => updateProfile('fastFashionPerMonth', Math.max(0, Math.min(50, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter number of new clothing items per month"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-50">Energy & Home</h2>
            <div>
              <label htmlFor="electricity" className="block text-sm font-medium text-emerald-200 mb-2">Monthly Electricity (kWh)</label>
              <input 
                id="electricity"
                type="number" 
                min="0" max="5000"
                value={profile.electricityKwhPerMonth} 
                onChange={(e) => updateProfile('electricityKwhPerMonth', Math.max(0, Math.min(5000, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter your average monthly electricity usage in kWh"
              />
            </div>
            <div>
              <label htmlFor="homeSize" className="block text-sm font-medium text-emerald-200 mb-2">Home Size</label>
              <select 
                id="homeSize"
                value={profile.homeSize} 
                onChange={(e) => updateProfile('homeSize', e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Select your home size"
              >
                <option value="small">Small (Apartment / Flat)</option>
                <option value="medium">Medium (Townhouse / Small Home)</option>
                <option value="large">Large (Suburban Home)</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-50">Digital Habits & Lifestyle</h2>
            <div>
              <label htmlFor="streaming" className="block text-sm font-medium text-emerald-200 mb-2">Video Streaming (Hours/Day)</label>
              <input 
                id="streaming"
                type="number" 
                min="0" max="24"
                value={profile.streamingHoursPerDay} 
                onChange={(e) => updateProfile('streamingHoursPerDay', Math.max(0, Math.min(24, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter hours per day spent streaming video"
              />
            </div>
            <div>
              <label htmlFor="foodDelivery" className="block text-sm font-medium text-emerald-200 mb-2">Food Delivery (Times/Week)</label>
              <input 
                id="foodDelivery"
                type="number" 
                min="0" max="30"
                value={profile.foodDeliveryPerWeek} 
                onChange={(e) => updateProfile('foodDeliveryPerWeek', Math.max(0, Math.min(30, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter number of food deliveries per week"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-50">Household Details</h2>
            <div>
              <label htmlFor="householdSize" className="block text-sm font-medium text-emerald-200 mb-2">Household Size (People)</label>
              <input 
                id="householdSize"
                type="number" 
                min="1" max="15"
                value={profile.householdSize} 
                onChange={(e) => updateProfile('householdSize', Math.max(1, Math.min(15, Number(e.target.value))))}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Enter number of people in your household"
              />
            </div>
            <div>
              <label htmlFor="workMode" className="block text-sm font-medium text-emerald-200 mb-2">Work Mode</label>
              <select 
                id="workMode"
                value={profile.workMode} 
                onChange={(e) => updateProfile('workMode', e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-3 border border-emerald-900/50 focus:ring-2 focus:ring-emerald-500"
                aria-label="Select your current work mode"
              >
                <option value="remote">Remote (Work from Home)</option>
                <option value="hybrid">Hybrid</option>
                <option value="office">Full-time Office</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-emerald-900/30">
      <div className="mb-8" aria-hidden="true">
        <div className="flex justify-between text-xs text-emerald-400 mb-2 font-medium tracking-wider uppercase">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{steps[currentStep]}</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div 
        aria-live="polite" 
        className="sr-only"
      >
        Now on step {currentStep + 1} of {steps.length}: {steps[currentStep]}
      </div>

      <div ref={stepContainerRef} className="min-h-[300px] outline-none" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-between pt-6 border-t border-slate-800">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${currentStep === 0 ? 'opacity-50 cursor-not-allowed text-slate-500 bg-slate-800' : 'text-emerald-100 bg-slate-800 hover:bg-slate-700 focus:ring-2 focus:ring-emerald-500'}`}
          aria-label="Go to previous step"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 transition-all active:scale-95 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label={currentStep === steps.length - 1 ? "Calculate my footprint" : "Go to next step"}
        >
          {currentStep === steps.length - 1 ? 'Calculate My Footprint' : 'Next Step'}
        </button>
      </div>
    </div>
  );
}
