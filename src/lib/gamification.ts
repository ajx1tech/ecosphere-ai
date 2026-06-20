import { CarbonProfile, FootprintBreakdown } from './types';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

export interface Mission {
  id: string;
  title: string;
  xpReward: number;
  estimatedSavingsKg: number;
}

/**
 * Calculates the user's gamification level, title, and XP needed for the next level.
 * 
 * @param totalXP The total experience points accumulated by the user.
 * @returns Level data including current level index, descriptive title, and XP remaining for promotion.
 */
export function calculateLevel(totalXP: number): { level: number; title: string; xpToNext: number } {
  if (totalXP < 100) return { level: 1, title: "Polluter 🏭", xpToNext: 100 - totalXP };
  if (totalXP < 300) return { level: 2, title: "Aware Citizen 🌱", xpToNext: 300 - totalXP };
  if (totalXP < 600) return { level: 3, title: "Climate Hero 🦸", xpToNext: 600 - totalXP };
  return { level: 4, title: "Planet Protector 🌍", xpToNext: 0 };
}

/**
 * Generates dynamic, weekly missions tailored to the user's highest emission categories.
 * Provides realistic XP rewards and estimated carbon savings based on the carbon engine logic.
 * 
 * @param profile The current carbon profile.
 * @param breakdown The calculated footprint breakdown.
 * @returns An array of 3 personalized missions.
 */
export function generateWeeklyMissions(profile: CarbonProfile, breakdown: FootprintBreakdown): Mission[] {
  const missions: Mission[] = [];
  const { transport, diet, shopping, energy, digital } = breakdown;
  const maxCategory = Math.max(transport, diet, shopping, energy, digital);

  if (maxCategory === diet && (profile.dietType === 'high-meat' || profile.dietType === 'moderate-meat')) {
    missions.push({
      id: 'diet_no_meat_3_days',
      title: 'Go Meatless for 3 Days',
      xpReward: 30,
      estimatedSavingsKg: Math.round(((3300 - 1700) / 365) * 3)
    });
  } else if (maxCategory === transport && profile.transportMode === 'car-solo') {
    missions.push({
      id: 'transport_carpool',
      title: 'Carpool or Transit for 2 Commutes',
      xpReward: 40,
      estimatedSavingsKg: Math.round(profile.commuteDistanceKm * 2 * (0.21 - 0.04))
    });
  } else if (maxCategory === shopping && profile.fastFashionPerMonth > 0) {
    missions.push({
      id: 'shopping_no_new_clothes',
      title: 'Zero New Clothes This Week',
      xpReward: 50,
      estimatedSavingsKg: Math.round(22 * 0.25) // Approx weekly savings
    });
  } else if (maxCategory === energy) {
    missions.push({
      id: 'energy_turn_off_lights',
      title: 'Unplug Standby Devices All Week',
      xpReward: 20,
      estimatedSavingsKg: 5
    });
  } else {
    missions.push({
      id: 'digital_screen_time',
      title: 'Cut Streaming by 1 Hour Daily',
      xpReward: 20,
      estimatedSavingsKg: Math.round(7 * 0.36)
    });
  }

  // Add generic missions to fill out the 3
  missions.push({
    id: 'generic_reusable_cup',
    title: 'Use a Reusable Cup 5 Times',
    xpReward: 15,
    estimatedSavingsKg: 2
  });
  missions.push({
    id: 'generic_locally_sourced',
    title: 'Buy Locally Sourced Groceries',
    xpReward: 25,
    estimatedSavingsKg: 10
  });

  return missions.slice(0, 3);
}

/**
 * Evaluates the user's current and historical profiles to determine eligible badges.
 * 
 * @param profile The current carbon profile.
 * @param history An array of past carbon profiles to check for sustained patterns.
 * @returns An array of badges, marking which ones have been earned.
 */
export function checkBadgeEligibility(profile: CarbonProfile, history: CarbonProfile[]): Badge[] {
  const badges: Badge[] = [
    {
      id: 'no_meat_monday',
      name: 'No Meat Monday',
      icon: '🥗',
      description: 'Achieve a vegetarian or vegan diet profile.',
      earned: profile.dietType === 'vegetarian' || profile.dietType === 'vegan'
    },
    {
      id: 'green_commuter',
      name: 'Green Commuter',
      icon: '🚲',
      description: 'Use public transit or zero-emission modes for your primary commute.',
      earned: profile.transportMode === 'public-transit' || profile.transportMode === 'bike-walk'
    },
    {
      id: 'minimalist_month',
      name: 'Minimalist Month',
      icon: '📦',
      description: 'Keep online shopping and fast fashion purchases to a minimum.',
      earned: profile.onlineShoppingPerMonth <= 1 && profile.fastFashionPerMonth === 0
    },
    {
      id: 'energy_saver',
      name: 'Energy Saver',
      icon: '💡',
      description: 'Maintain electricity consumption below 150 kWh per month.',
      earned: profile.electricityKwhPerMonth < 150
    }
  ];

  return badges;
}
