/**
 * supabase.js
 * 
 * Centralized Supabase Client and Application Data Service for SIH26076 Mausam.
 * 
 * Responsibilities:
 * - Supabase owns Application Backend / PostgreSQL Data (User Profiles, Preferences, Saved Locations).
 * - Firebase owns User Authentication / Identity (Firebase UID).
 * - The Firebase UID acts as the foreign key: user_id VARCHAR(128) references users(id).
 * 
 * Includes an offline-resilient local cache fallback for hackathon stage presentations.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo-key-mausam-sih26076';

// Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LOCAL_PROFILE_CACHE_KEY = 'mausam_supabase_profile_cache';
const LOCAL_LOCATIONS_KEY = 'mausam_saved_locations';

/**
 * Fetch application profile for an authenticated Firebase UID
 * Maps to PostgreSQL schema: user_profiles
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  try {
    // Attempt Supabase fetch
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      // Sync local cache
      setLocalProfileCache(userId, data);
      return data;
    }
  } catch (err) {
    console.warn('[Supabase Service] Falling back to local cache:', err?.message || err);
  }

  // Resilient fallback to cached profile
  return getLocalProfileCache(userId);
}

/**
 * Upsert application profile in Supabase
 */
export async function upsertUserProfile(userId, profileData) {
  if (!userId) return null;

  const payload = {
    user_id: userId,
    display_name: profileData.name || profileData.display_name || 'Demo User',
    persona_type: profileData.persona || profileData.persona_type || 'COMMUTER',
    language: profileData.language || 'en',
    home_station_id: profileData.home_station_id || 'nanded',
    home_lat: profileData.home_lat || 19.15,
    home_lng: profileData.home_lng || 77.32,
    updated_at: new Date().toISOString(),
  };

  // Always update local cache immediately for zero-latency UI reactivity
  setLocalProfileCache(userId, payload);

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload)
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('[Supabase Service] Offline/mock upsert recorded locally:', err?.message || err);
  }

  return payload;
}

/**
 * Fetch saved locations for the user
 */
export async function getSavedLocations(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch {
    // Return cached locations
  }

  try {
    const raw = localStorage.getItem(`${LOCAL_LOCATIONS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [
      { id: 'loc-1', station_code: 'nanded', city_name: 'Nanded', is_default: true },
      { id: 'loc-2', station_code: 'london', city_name: 'London', is_default: false },
    ];
  } catch {
    return [];
  }
}

/**
 * Local cache helpers for resilient offline state
 */
function getLocalProfileCache(userId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROFILE_CACHE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalProfileCache(userId, data) {
  try {
    localStorage.setItem(`${LOCAL_PROFILE_CACHE_KEY}_${userId}`, JSON.stringify(data));
  } catch (e) {
    console.warn('[Supabase Service] Failed to write local cache', e);
  }
}

export default supabase;
