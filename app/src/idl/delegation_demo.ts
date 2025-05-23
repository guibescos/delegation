/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/delegation_demo.json`.
 */
export type DelegationDemo = {
  "address": "5QdNueoih49C6pmYCaUvX5TN2Sar47FQkGXKMpt5HmHg",
  "metadata": {
    "name": "delegationDemo",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "setDelegation",
      "discriminator": [
        28,
        231,
        56,
        197,
        225,
        173,
        129,
        74
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "delegator"
        },
        {
          "name": "delegation",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "transact",
      "discriminator": [
        217,
        149,
        130,
        143,
        221,
        52,
        252,
        119
      ],
      "accounts": [
        {
          "name": "agent",
          "signer": true
        },
        {
          "name": "delegation",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "agent"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "delegation",
      "discriminator": [
        237,
        90,
        140,
        159,
        124,
        255,
        243,
        80
      ]
    }
  ],
  "types": [
    {
      "name": "delegation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "delegator",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
