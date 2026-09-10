import admin from 'firebase-admin';
import { config } from './env.js';

let firestoreDb = null;
let firebaseAuth = null;
let fcmMessaging = null;

if (config.firebase.isConfigured) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
      databaseURL: config.firebase.databaseURL,
    });

    firestoreDb = admin.firestore();
    firebaseAuth = admin.auth();
    fcmMessaging = admin.messaging();
    console.log('[Firebase] Admin SDK initialized successfully.');
  } catch (error) {
    console.warn('[Firebase] Initialization error, falling back to mock mode:', error.message);
  }
} else {
  console.log('[Firebase] Credentials not provided in .env. Running in Mock/Development Mode.');
}

// In-memory mock storage for development when Firebase is not connected yet
class MockFirestoreCollection {
  constructor(name) {
    this.name = name;
    this.data = new Map();
  }

  doc(id) {
    const coll = this;
    return {
      async get() {
        const item = coll.data.get(id);
        return {
          exists: Boolean(item),
          id,
          data: () => item || null,
        };
      },
      async set(newData, options = {}) {
        if (options.merge && coll.data.has(id)) {
          const merged = { ...coll.data.get(id), ...newData, updatedAt: new Date().toISOString() };
          coll.data.set(id, merged);
          return merged;
        }
        const item = { ...newData, id, updatedAt: new Date().toISOString() };
        coll.data.set(id, item);
        return item;
      },
      async update(updateData) {
        if (!coll.data.has(id)) {
          throw new Error(`Document ${id} not found`);
        }
        const merged = { ...coll.data.get(id), ...updateData, updatedAt: new Date().toISOString() };
        coll.data.set(id, merged);
        return merged;
      },
      async delete() {
        coll.data.delete(id);
        return true;
      },
    };
  }

  async add(item) {
    const id = item.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = { ...item, id, createdAt: item.createdAt || new Date().toISOString() };
    this.data.set(id, record);
    return { id, get: async () => ({ id, data: () => record }) };
  }

  where(field, op, val) {
    const coll = this;
    return {
      async get() {
        const results = [];
        for (const item of coll.data.values()) {
          if (op === '==' && item[field] === val) {
            results.push({ id: item.id, data: () => item });
          }
        }
        return {
          docs: results,
          empty: results.length === 0,
          forEach(cb) { results.forEach(cb); },
        };
      },
    };
  }

  async get() {
    const docs = Array.from(this.data.values()).map((item) => ({
      id: item.id,
      data: () => item,
    }));
    return {
      docs,
      empty: docs.length === 0,
      forEach(cb) { docs.forEach(cb); },
    };
  }
}

class MockFirestore {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MockFirestoreCollection(name));
    }
    return this.collections.get(name);
  }
}

export const db = firestoreDb || new MockFirestore();
export const auth = firebaseAuth;
export const messaging = fcmMessaging;
export { admin };

