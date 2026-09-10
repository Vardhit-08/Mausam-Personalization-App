import { db } from '../config/firebase.js';

const COLLECTION = 'packing_checklists';

export class PackingModel {
  static async create(userId, checklistData) {
    const record = {
      user: userId,
      destination: checklistData.destination,
      startDate: checklistData.startDate,
      endDate: checklistData.endDate,
      generatedItems: checklistData.generatedItems || [],
      customItems: checklistData.customItems || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await db.collection(COLLECTION).add(record);
    return { id: res.id, ...record };
  }

  static async listByUser(userId) {
    const snapshot = await db.collection(COLLECTION).where('user', '==', userId).get();
    const lists = [];
    snapshot.forEach((doc) => {
      lists.push({ id: doc.id, ...doc.data() });
    });
    return lists;
  }

  static async getById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async updateCustomItems(id, userId, customItems) {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().user !== userId) return null;

    await docRef.set({ customItems, updatedAt: new Date().toISOString() }, { merge: true });
    return this.getById(id);
  }
}

