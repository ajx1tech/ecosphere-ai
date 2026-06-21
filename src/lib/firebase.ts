import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore'
import { CarbonProfile, FootprintBreakdown } from './types'

// Firebase configuration using Next.js public environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)

/**
 * Retrieves or creates an anonymous user ID stored in localStorage.
 * Assumption: The application operates with anonymous tracking, so no strict auth is required.
 * Handles SSR safety by checking for the window object.
 *
 * @returns A UUID string representing the user.
 */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') {
    // Return a fallback during Server-Side Rendering
    return 'ssr-placeholder-id'
  }

  let userId = localStorage.getItem('ecosphere_user_id')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('ecosphere_user_id', userId)
  }
  return userId
}

/**
 * Saves a carbon profile and its calculated breakdown to Firestore.
 *
 * @param userId The anonymous user identifier.
 * @param profile The user's carbon profile data.
 * @param breakdown The calculated footprint breakdown.
 * @returns A promise that resolves when the profile is successfully saved.
 */
export async function saveProfile(
  userId: string,
  profile: CarbonProfile,
  breakdown: FootprintBreakdown
): Promise<void> {
  try {
    const profilesRef = collection(db, 'profiles')
    await addDoc(profilesRef, {
      userId,
      profile,
      breakdown,
      timestamp: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error saving profile to Firebase:', error)
  }
}

/**
 * Fetches the user's historical profile data from the last 6 months.
 *
 * @param userId The anonymous user identifier.
 * @returns An array of profile entries ordered by timestamp descending (newest first).
 */
export async function getProfileHistory(
  userId: string
): Promise<
  { profile: CarbonProfile; breakdown: FootprintBreakdown; timestamp: Date }[]
> {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const profilesRef = collection(db, 'profiles')
    const q = query(
      profilesRef,
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(sixMonthsAgo)),
      orderBy('timestamp', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        profile: data.profile as CarbonProfile,
        breakdown: data.breakdown as FootprintBreakdown,
        timestamp: (data.timestamp as Timestamp).toDate(),
      }
    })
  } catch (error) {
    console.error('Error fetching profile history:', error)
    return []
  }
}

/**
 * Records the completion status of a gamification mission.
 *
 * @param userId The anonymous user identifier.
 * @param missionId The unique ID of the mission.
 * @param completed Boolean indicating if the mission was completed.
 * @returns A promise that resolves when the progress is saved.
 */
export async function saveMissionProgress(
  userId: string,
  missionId: string,
  completed: boolean
): Promise<void> {
  try {
    const missionsRef = collection(db, 'mission_progress')
    await addDoc(missionsRef, {
      userId,
      missionId,
      completed,
      timestamp: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error saving mission progress:', error)
  }
}
