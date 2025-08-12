import PocketBase from 'pocketbase';

console.log('Initializing PocketBase...');
const baseUrl = (process.env.PB_BASE_URL || 'https://api.whoisjason.me/').replace(/\/$/, '/');
export const pb = new PocketBase(baseUrl);
// Disable request auto-cancellation to avoid unintended aborts during rapid UI updates
try { pb.autoCancellation(false); } catch {}
console.log('PocketBase initialized at', baseUrl);
