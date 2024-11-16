import PocketBase from 'pocketbase';

console.log('Initializing PocketBase...');
export const pb = new PocketBase('https://api.whoisjason.me/');
console.log('PocketBase initialized');
