import PocketBase from 'pocketbase';

console.log('Initializing PocketBase...');
export const pb = new PocketBase('http://10.1.9.143:3069/');
// Disable request auto-cancellation to avoid unintended aborts during rapid UI updates
try { pb.autoCancellation(false); } catch {}
console.log('PocketBase initialized');
