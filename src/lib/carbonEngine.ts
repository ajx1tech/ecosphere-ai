import {
  CarbonProfile,
  FootprintBreakdown,
  CarbonDNA,
  CarbonTwin,
  WhatIfScenario,
} from './types'

/**
 * Calculates the total carbon footprint based on the user's profile.
 * Uses approximate but defensible emission factors.
 *
 * Sources & Assumptions:
 * - Transport: 250 working days/year.
 *   car-solo = 0.21 kg/km, car-pool = 0.105 kg/km, public-transit = 0.04 kg/km, bike-walk = 0, mixed = 0.125 kg/km.
 *   Domestic flight equivalent = 250 kg CO2e per flight.
 * - Diet: Annual figures based on Oxford research.
 *   high-meat = 3300 kg, moderate-meat = 2500 kg, pescatarian = 1900 kg, vegetarian = 1700 kg, vegan = 1500 kg.
 * - Shopping: Online shopping = 15 kg per order (packaging + last mile). Fast fashion = 22 kg per item (production + transport).
 * - Energy: Grid average = 0.42 kg/kWh. Scaled by home size multiplier (small=0.8, medium=1.0, large=1.3). Shared across household.
 * - Digital: Video streaming = 0.36 kg per hour. Food delivery = 1.2 kg per order (packaging + delivery transport).
 *
 * @param profile The user's carbon profile data.
 * @returns A breakdown of carbon footprint by category in kg CO2e/year.
 */
export function calculateFootprint(profile: CarbonProfile): FootprintBreakdown {
  // Transport
  const workingDays = 250
  let transportFactor = 0.21
  switch (profile.transportMode) {
    case 'car-solo':
      transportFactor = 0.21
      break
    case 'car-pool':
      transportFactor = 0.105
      break
    case 'public-transit':
      transportFactor = 0.04
      break
    case 'bike-walk':
      transportFactor = 0
      break
    case 'mixed':
      transportFactor = 0.125
      break
  }
  const transportCommute =
    profile.commuteDistanceKm * workingDays * transportFactor
  const transportFlights = profile.flightsPerYear * 250
  const transportTotal = transportCommute + transportFlights

  // Diet
  let dietTotal = 3300
  switch (profile.dietType) {
    case 'high-meat':
      dietTotal = 3300
      break
    case 'moderate-meat':
      dietTotal = 2500
      break
    case 'pescatarian':
      dietTotal = 1900
      break
    case 'vegetarian':
      dietTotal = 1700
      break
    case 'vegan':
      dietTotal = 1500
      break
  }

  // Shopping
  const shoppingTotal =
    profile.onlineShoppingPerMonth * 12 * 15 +
    profile.fastFashionPerMonth * 12 * 22

  // Energy
  let homeMultiplier = 1.0
  if (profile.homeSize === 'small') homeMultiplier = 0.8
  if (profile.homeSize === 'large') homeMultiplier = 1.3
  const household = Math.max(1, profile.householdSize)
  const energyTotal =
    (profile.electricityKwhPerMonth * 12 * 0.42 * homeMultiplier) / household

  // Digital & Lifestyle
  const digitalTotal =
    profile.streamingHoursPerDay * 365 * 0.36 +
    profile.foodDeliveryPerWeek * 52 * 1.2

  const total =
    transportTotal + dietTotal + shoppingTotal + energyTotal + digitalTotal

  return {
    transport: Math.round(transportTotal),
    diet: Math.round(dietTotal),
    shopping: Math.round(shoppingTotal),
    energy: Math.round(energyTotal),
    digital: Math.round(digitalTotal),
    total: Math.round(total),
    unit: 'kg CO2e/year',
  }
}

/**
 * Derives a user's Carbon DNA (archetype, behavioral patterns, and labels) from their footprint.
 * Uses logical rules to categorize the dominant sources of emissions.
 *
 * @param profile The user's carbon profile data.
 * @param breakdown The calculated footprint breakdown.
 * @returns The user's Carbon DNA summary.
 */
export function deriveCarbonDNA(
  profile: CarbonProfile,
  breakdown: FootprintBreakdown
): CarbonDNA {
  const { transport, diet, shopping, energy, digital, total } = breakdown
  const maxCategory = Math.max(transport, diet, shopping, energy, digital)

  let archetype = 'Urban Explorer'
  if (transport === maxCategory && profile.flightsPerYear > 3) {
    archetype = 'Frequent Flyer'
  } else if (shopping === maxCategory) {
    archetype = 'Convenience Consumer'
  } else if (diet === maxCategory && profile.dietType === 'high-meat') {
    archetype = 'Traditional Eater'
  } else if (total < 2000) {
    archetype = 'Eco Minimalist'
  } else if (energy === maxCategory && profile.homeSize === 'large') {
    archetype = 'Suburban Settler'
  }

  let riskProfile: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate'
  if (total < 2000) riskProfile = 'Low'
  else if (total < 4000) riskProfile = 'Moderate'
  else if (total < 7000) riskProfile = 'High'
  else riskProfile = 'Critical'

  let behaviorPattern = 'Balanced'
  if (transport === maxCategory) behaviorPattern = 'Mobility-Heavy'
  else if (shopping === maxCategory || digital === maxCategory)
    behaviorPattern = 'Convenience-Driven'
  else if (diet === maxCategory) behaviorPattern = 'Diet-Heavy'
  else if (energy === maxCategory) behaviorPattern = 'Energy-Intensive'
  else if (riskProfile === 'Low') behaviorPattern = 'Resource-Conscious'

  return {
    archetype,
    dietLabel: profile.dietType.replace('-', ' ').toUpperCase(),
    travelLabel:
      profile.flightsPerYear > 0
        ? `${profile.flightsPerYear} Flights/yr`
        : 'Grounded',
    shoppingLabel:
      profile.onlineShoppingPerMonth > 4
        ? 'Frequent Shopper'
        : 'Occasional Buyer',
    energyLabel: `${profile.homeSize} Home`.toUpperCase(),
    riskProfile,
    behaviorPattern,
  }
}

/**
 * Generates an optimized "Carbon Twin" profile by applying realistic behavioral improvements
 * based on the user's current habits.
 *
 * @param profile The current carbon profile.
 * @param breakdown The current footprint breakdown.
 * @returns The twin's footprint, savings, and equivalent environmental metrics.
 */
export function generateCarbonTwin(
  profile: CarbonProfile,
  breakdown: FootprintBreakdown
): CarbonTwin {
  let savingsKg = 0
  const twinBehaviors: string[] = []

  // Diet optimization
  if (profile.dietType === 'high-meat') {
    // 2 vegetarian days a week ~ 28% of difference between high-meat and vegetarian
    const saving = (3300 - 1700) * 0.28
    savingsKg += saving
    twinBehaviors.push('Eats vegetarian 2 days a week')
  } else if (profile.dietType === 'moderate-meat') {
    const saving = (2500 - 1700) * 0.28
    savingsKg += saving
    twinBehaviors.push('Eats vegetarian 2 days a week')
  }

  // Transport optimization
  if (profile.transportMode === 'car-solo' && profile.commuteDistanceKm > 10) {
    // Switch to public transit 2 days a week (40% of commute)
    const saving = profile.commuteDistanceKm * 250 * 0.4 * (0.21 - 0.04)
    savingsKg += saving
    twinBehaviors.push('Uses public transit twice a week')
  }

  // Flights optimization
  if (profile.flightsPerYear > 2) {
    // Replace 1 flight with train
    savingsKg += 200
    twinBehaviors.push('Replaces 1 flight with domestic train travel')
  }

  // Streaming optimization
  if (profile.streamingHoursPerDay > 4) {
    // Reduce streaming quality / duration
    const saving = (profile.streamingHoursPerDay - 4) * 365 * 0.36
    savingsKg += saving
    twinBehaviors.push('Limits high-definition streaming to 4 hours daily')
  }

  savingsKg = Math.round(savingsKg)
  const twinFootprint = breakdown.total - savingsKg

  return {
    currentFootprint: breakdown.total,
    twinFootprint: Math.max(0, twinFootprint),
    savingsKg,
    twinBehaviors,
    equivalents: {
      treesPlanted: Math.round(savingsKg / 21), // 1 tree absorbs ~21kg CO2/year
      phoneChargesSaved: Math.round(savingsKg / 0.005), // ~0.005kg per charge
      carsOffRoad: Number((savingsKg / 4600).toFixed(2)), // Avg car = 4600kg/year
    },
  }
}

/**
 * Calculates a risk score from 0 to 100 based on the total footprint.
 * 100 is the best (lowest footprint), 0 is the worst.
 *
 * @param breakdown The calculated footprint breakdown.
 * @returns A score from 0 to 100.
 */
export function calculateRiskScore(breakdown: FootprintBreakdown): number {
  const score = Math.max(0, Math.min(100, 100 - breakdown.total / 100))
  return Math.round(score)
}

/**
 * Translates a numeric risk score into a human-readable category.
 *
 * @param score The risk score from 0 to 100.
 * @returns A string category ('Excellent', 'Low', 'Moderate', 'High', 'Critical').
 */
export function getRiskCategory(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Low'
  if (score >= 40) return 'Moderate'
  if (score >= 20) return 'High'
  return 'Critical'
}

/**
 * Runs a simulation to project future footprints across three scenarios:
 * "Business as Usual", "Moderate Changes", and "Full Transition".
 *
 * @param profile The current carbon profile.
 * @param changes Proposed hypothetical changes to the profile.
 * @returns An array of scenarios with projected emissions for 2030, 2040, and 2050.
 */
export function runWhatIfSimulation(
  profile: CarbonProfile,
  changes: Partial<CarbonProfile>
): WhatIfScenario[] {
  const currentTotal = calculateFootprint(profile).total

  const newProfile = { ...profile, ...changes }
  const targetTotal = calculateFootprint(newProfile).total

  const delta = targetTotal - currentTotal
  const moderateTotal = currentTotal + delta * 0.5

  return [
    {
      label: 'Business as Usual',
      year2030: currentTotal,
      year2040: currentTotal,
      year2050: currentTotal,
    },
    {
      label: 'Moderate Changes',
      year2030: Math.round(moderateTotal),
      year2040: Math.round(moderateTotal * 0.9), // 10% reduction over 10 years
      year2050: Math.round(moderateTotal * 0.8), // continued trend
    },
    {
      label: 'Full Transition',
      year2030: Math.round(targetTotal),
      year2040: Math.round(targetTotal * 0.9),
      year2050: Math.round(targetTotal * 0.8),
    },
  ]
}

/**
 * Ranks personalized action recommendations based on the user's highest emission areas.
 *
 * @param profile The current carbon profile.
 * @returns A sorted array of top recommendations.
 */
export function rankRecommendations(
  profile: CarbonProfile
): {
  action: string
  estimatedSavingsKg: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
}[] {
  const recs: {
    action: string
    estimatedSavingsKg: number
    difficulty: 'Easy' | 'Medium' | 'Hard'
  }[] = []

  // Diet recommendations
  if (
    profile.dietType === 'high-meat' ||
    profile.dietType === 'moderate-meat'
  ) {
    const baseDiet = profile.dietType === 'high-meat' ? 3300 : 2500
    recs.push({
      action: 'Replace 2 weekly meat meals with plant-based alternatives',
      estimatedSavingsKg: Math.round((baseDiet - 1700) * 0.28),
      difficulty: 'Medium',
    })
  }

  // Transport recommendations
  if (profile.transportMode === 'car-solo') {
    recs.push({
      action: 'Use public transit twice a week for commuting',
      estimatedSavingsKg: Math.round(
        profile.commuteDistanceKm * 250 * 0.4 * (0.21 - 0.04)
      ),
      difficulty: 'Medium',
    })
  }
  if (profile.flightsPerYear > 0) {
    recs.push({
      action: 'Skip one domestic flight per year',
      estimatedSavingsKg: 250,
      difficulty: 'Hard',
    })
  }

  // Shopping recommendations
  if (profile.onlineShoppingPerMonth >= 2) {
    recs.push({
      action: 'Consolidate online orders to halve deliveries',
      estimatedSavingsKg: Math.round(
        (profile.onlineShoppingPerMonth / 2) * 12 * 15
      ),
      difficulty: 'Easy',
    })
  }
  if (profile.fastFashionPerMonth >= 1) {
    recs.push({
      action: 'Buy one less new clothing item per month',
      estimatedSavingsKg: 22 * 12,
      difficulty: 'Medium',
    })
  }

  // Energy recommendations
  if (profile.electricityKwhPerMonth > 200) {
    const homeMult =
      profile.homeSize === 'small'
        ? 0.8
        : profile.homeSize === 'large'
          ? 1.3
          : 1.0
    // Switch to renewable tariff (effectively 0 for the portion) - assume 80% reduction
    const currentEnergy =
      (profile.electricityKwhPerMonth * 12 * 0.42 * homeMult) /
      profile.householdSize
    recs.push({
      action: 'Switch to a renewable energy tariff',
      estimatedSavingsKg: Math.round(currentEnergy * 0.8),
      difficulty: 'Medium',
    })
  }

  // Digital recommendations
  if (profile.streamingHoursPerDay > 2) {
    recs.push({
      action: 'Reduce streaming resolution from 4K to 1080p',
      estimatedSavingsKg: Math.round(profile.streamingHoursPerDay * 365 * 0.18), // Half the emissions
      difficulty: 'Easy',
    })
  }
  if (profile.foodDeliveryPerWeek >= 1) {
    recs.push({
      action: 'Cook one extra meal at home instead of ordering delivery',
      estimatedSavingsKg: Math.round(52 * 1.2),
      difficulty: 'Easy',
    })
  }

  // Sort descending by savings
  return recs
    .sort((a, b) => b.estimatedSavingsKg - a.estimatedSavingsKg)
    .slice(0, 8)
}
