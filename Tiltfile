rpc_port_solana = "8899"

local_resource(
    "build-programs",
    "cargo build-sbf",
)

local_resource(
    "svm-localnet",
    serve_cmd="solana-test-validator $(./solana-test-validator-config.sh)",
    serve_dir="./tilt",
    # check readiness by sending a health GET query to the RPC url
    readiness_probe=probe(
        period_secs=10,
        http_get = http_get_action(port=8899, host="localhost", scheme="http", path="/health")
    ),
    resource_deps=["build-programs"],
)