#!/bin/bash
set -e

echo "Kong Custom Entrypoint: Processing configuration template..."

# check if the template file exists
if [ -f "/kong/config.template.yaml" ]; then
    echo "Found template file, generating configuration..."
    # Use envsubst to replace environment variables in the template
    envsubst < /kong/config.template.yaml > /kong/config.yaml
    # Set the KONG_DECLARATIVE_CONFIG environment variable to point to the generated config
    export KONG_DECLARATIVE_CONFIG=/kong/config.yaml
else
    echo "No template file found at /kong/kong.yml.template"
    echo "Using existing configuration or default settings"
fi

. /docker-entrypoint.sh