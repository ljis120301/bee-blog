/**
 * CommonJS wrapper for ensure-admin.mjs
 * =======================================
 * Delegates to the ESM version which uses Better Auth's hashPassword.
 * This wrapper exists so any caller of ensure-admin.js still works.
 */
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'ensure-admin.mjs');
execSync(`node ${scriptPath}`, { stdio: 'inherit' });
