import PocketBase from 'pocketbase';

console.log('Initializing PocketBase...');
export const pb = new PocketBase('https://api.whoisjason.me/');
// Disable request auto-cancellation to avoid unintended aborts during rapid UI updates
try { pb.autoCancellation(false); } catch {}
console.log('PocketBase initialized');
