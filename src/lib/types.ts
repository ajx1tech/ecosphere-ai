export interface CarbonProfile {
  transportMode:
    | 'car-solo'
    | 'car-pool'
    | 'public-transit'
    | 'bike-walk'
    | 'mixed'
  commuteDistanceKm: number
  flightsPerYear: number
  dietType:
    | 'high-meat'
    | 'moderate-meat'
    | 'pescatarian'
    | 'vegetarian'
    | 'vegan'
  foodDeliveryPerWeek: number
  onlineShoppingPerMonth: number
  fastFashionPerMonth: number
  electricityKwhPerMonth: number
  homeSize: 'small' | 'medium' | 'large'
  householdSize: number
  streamingHoursPerDay: number
  workMode: 'remote' | 'hybrid' | 'office'
  region: string
}

export interface FootprintBreakdown {
  transport: number
  diet: number
  shopping: number
  energy: number
  digital: number
  total: number
  unit: 'kg CO2e/year'
}

export interface CarbonDNA {
  archetype: string
  dietLabel: string
  travelLabel: string
  shoppingLabel: string
  energyLabel: string
  riskProfile: 'Low' | 'Moderate' | 'High' | 'Critical'
  behaviorPattern: string
}

export interface CarbonTwin {
  currentFootprint: number
  twinFootprint: number
  savingsKg: number
  twinBehaviors: string[]
  equivalents: {
    treesPlanted: number
    phoneChargesSaved: number
    carsOffRoad: number
  }
}

export interface WhatIfScenario {
  label: string
  year2030: number
  year2040: number
  year2050: number
}
