#!/usr/bin/env node
/**
 * Generate JWT_PRIVATE_KEY and JWKS for Convex Auth.
 * Run: node scripts/generate-auth-keys.mjs
 * Then set the two output values in your Convex dashboard:
 * https://dashboard.convex.dev → your project → Settings → Environment Variables
 */
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256");
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

const JWT_PRIVATE_KEY = privateKey.trimEnd().replace(/\n/g, " ");
console.log("Add these to your Convex deployment (Settings → Environment Variables):\n");
console.log("JWT_PRIVATE_KEY=" + JWT_PRIVATE_KEY);
console.log("\nJWKS=" + jwks);
