import { db } from '../config/firebase.js';

const COLLECTION = 'persona_preferences';

export class PreferenceModel {
  static async getByUser(userId) {
    const doc = await db.collection(COLLECTION).doc(userId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    // Default preferences
    return {
      id: userId,
      user: userId,
      persona: 'STUDENT',
      aqiThreshold: 100,
      pollenAlert: true,
      commuteMorning: '08:00',
      commuteEvening: '17:30',
      updatedAt: new Date().toISOString(),
    };
  }

  static async update(userId, preferences) {
    const docRef = db.collection(COLLECTION).doc(userId);
    const data = {
      user: userId,
      ...preferences,
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(data, { merge: true });
    return { id: userId, ...data };
  }
}

