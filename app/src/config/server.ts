import "server-only";

/* eslint-disable n/no-process-env */

export const SOLANA_RPC = process.env.SOLANA_RPC || "http://localhost:8899";
export const FUNDER_KEY =
  process.env.FUNDER_KEY || "[132,120,2,153,218,63,40,152,13,218,139,155,32,40,160,145,162,42,167,245,178,167,68,243,49,70,182,135,200,3,99,62,233,24,9,215,22,116,198,254,79,145,12,118,12,237,162,254,12,159,207,57,113,252,237,105,140,61,34,104,49,26,242,110]";
