#!/bin/bash

function print_args {
  echo "--bpf-program $(solana-keygen pubkey ./keypairs/counter.json) ../target/deploy/counter.so"
  echo "--bpf-program $(solana-keygen pubkey ./keypairs/delegation-registry.json) ../target/deploy/delegation_registry.so"
  echo "--mint $(solana-keygen pubkey ./keypairs/payer.json)"
  echo "--reset"
}

print_args
