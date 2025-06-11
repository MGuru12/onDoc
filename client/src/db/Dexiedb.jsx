import Dexie from "dexie";

const db = new Dexie('OnDoc');

db.version(1).stores({
  ur: '_i, n, e', // '++id' = auto-increment
  tn: 'at, ut',
});

export default db;