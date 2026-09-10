import { db } from '../config/firebase.js';

const COLLECTION = 'alerts_log';

export class AlertModel {
  static async listByUser(userId, limit = 20) {
    const snapshot = await db.collection(COLLECTION).where('user', '==', userId).get();
    const alerts = [];
    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    // Also include broadcast alerts
    const broadcastSnapshot = await db.collection(COLLECTION).where('user', '==', 'broadcast_all').get();
    broadcastSnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });

    return alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  }

  static async markAsRead(alertId) {
    const docRef = db.collection(COLLECTION).doc(alertId);
    await docRef.set({ isRead: true }, { merge: true });
    return true;
  }
}

