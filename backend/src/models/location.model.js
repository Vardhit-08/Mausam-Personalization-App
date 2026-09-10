import { db } from '../config/firebase.js';

const COLLECTION = 'saved_locations';

export class LocationModel {
  static async listByOwner(ownerId) {
    const snapshot = await db.collection(COLLECTION).where('owner', '==', ownerId).get();
    const locations = [];
    snapshot.forEach((doc) => {
      locations.push({ id: doc.id, ...doc.data() });
    });
    return locations;
  }

  static async add(ownerId, locationData) {
    const record = {
      owner: ownerId,
      label: locationData.label || 'Saved Location',
      latitude: Number(locationData.latitude),
      longitude: Number(locationData.longitude),
      city: locationData.city || '',
      createdAt: new Date().toISOString(),
    };

    const res = await db.collection(COLLECTION).add(record);
    return { id: res.id, ...record };
  }

  static async delete(id, ownerId) {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    if (doc.data().owner !== ownerId) return false;

    await docRef.delete();
    return true;
  }
}

