/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/counter.json`.
 */
export type Counter = {
  "address": "5oCzLdFoo8qqeo5ftdLcaXpRwSAbQGppzLids5Lo512G",
  "metadata": {
    "name": "counter",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "increment",
      "discriminator": [
        11,
        18,
        104,
        9,
        104,
        174,
        59,
        33
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "agent",
          "signer": true
        },
        {
          "name": "counter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "agent.delegator",
                "account": "delegation"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "counter",
      "discriminator": [
        255,
        176,
        4,
        245,
        188,
        253,
        124,
        25
      ]
    },
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
      "name": "counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counter",
            "type": "u64"
          }
        ]
      }
    },
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
