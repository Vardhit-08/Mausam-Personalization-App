import { db } from '../config/firebase.js';
import { PERSONAS } from '../config/constants.js';

const COLLECTION = 'users';

export class UserModel {
  static async getById(uid) {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async upsert(uid, userData) {
    const data = {
      uid,
      fullName: userData.fullName || 'User',
      email: userData.email || '',
      fcmToken: userData.fcmToken || '',
      activePersona: (userData.activePersona || PERSONAS.STUDENT).toUpperCase(),
      city: userData.city || 'New Delhi',
      latitude: userData.latitude ? Number(userData.latitude) : 28.6139,
      longitude: userData.longitude ? Number(userData.longitude) : 77.2090,
      notificationsEnabled: userData.notificationsEnabled !== false,
      units: userData.units || 'metric',
      updatedAt: new Date().toISOString(),
    };

    const docRef = db.collection(COLLECTION).doc(uid);
    const existing = await docRef.get();
    if (!existing.exists) {
      data.createdAt = new Date().toISOString();
    }
    await docRef.set(data, { merge: true });
    return { id: uid, ...data };
  }

  static async updatePersona(uid, persona) {
    const docRef = db.collection(COLLECTION).doc(uid);
    await docRef.set({ activePersona: persona.toUpperCase(), updatedAt: new Date().toISOString() }, { merge: true });
    return this.getById(uid);
  }

  /**
   * Finds targeted users affected by an alert:
   * 1. Matches relevant personas
   * 2. Matches affected location/region
   * 3. Confirms notification eligibility (notificationsEnabled and fcmToken/token present)
   */
  static async findAffectedUsers({ relevantPersonas = [], city, latitude, longitude }) {
    // Retrieve users from collection
    const snapshot = await db.collection(COLLECTION).get();
    const allUsers = [];
    snapshot.forEach((doc) => allUsers.push({ id: doc.id, ...doc.data() }));

    // If database is currently empty (e.g. initial dev test), supply seeded mock users for the 4 personas
    if (allUsers.length === 0) {
      this.seedDevUsers();
      return this.findAffectedUsers({ relevantPersonas, city, latitude, longitude });
    }

    const personaSet = new Set(relevantPersonas.map((p) => String(p).toUpperCase()));

    // Filter by persona, location, and notification eligibility
    return allUsers.filter((user) => {
      // 1. Persona match
      const userPersona = (user.activePersona || '').toUpperCase();
      if (!personaSet.has(userPersona)) return false;

      // 2. Notification eligibility
      if (user.notificationsEnabled === false) return false;

      // 3. Location match (by city substring or coordinates fallback)
      if (city && user.city) {
        const cityMatch =
          user.city.toLowerCase().includes(city.toLowerCase()) ||
          city.toLowerCase().includes(user.city.toLowerCase());
        if (!cityMatch) return false;
      }

      return true;
    });
  }

  /**
   * Helper to seed standard test users covering the 4 personas for demonstration
   */
  static seedDevUsers() {
    const seeds = [
      {
        uid: 'usr_farmer_01',
        fullName: 'Ramesh Patel (Farmer)',
        activePersona: PERSONAS.FARMER,
        city: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        fcmToken: 'fcm_dev_token_farmer_1',
        notificationsEnabled: true,
      },
      {
        uid: 'usr_tourist_01',
        fullName: 'Sarah Jenkins (Tourist)',
        activePersona: PERSONAS.TOURIST,
        city: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        fcmToken: 'fcm_dev_token_tourist_1',
        notificationsEnabled: true,
      },
      {
        uid: 'usr_student_01',
        fullName: 'Aarav Sharma (Student)',
        activePersona: PERSONAS.STUDENT,
        city: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        fcmToken: 'fcm_dev_token_student_1',
        notificationsEnabled: true,
      },
      {
        uid: 'usr_parent_01',
        fullName: 'Sunita Mehra (Parent)',
        activePersona: PERSONAS.PARENT,
        city: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        fcmToken: 'fcm_dev_token_parent_1',
        notificationsEnabled: true,
      },
      {
        uid: 'usr_student_mumbai',
        fullName: 'Priya Nair (Student)',
        activePersona: PERSONAS.STUDENT,
        city: 'Mumbai',
        latitude: 19.0760,
        longitude: 72.8777,
        fcmToken: 'fcm_dev_token_student_mumbai',
        notificationsEnabled: true,
      },
    ];

    for (const seed of seeds) {
      db.collection(COLLECTION).doc(seed.uid).set(seed);
    }
  }
}
