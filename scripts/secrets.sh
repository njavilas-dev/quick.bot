#!/bin/bash

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: File $ENV_FILE not found"
    exit 1
fi

while IFS='=' read -r key value; do
    if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
        gh secret set "$key" --body "$value"
    fi
done < "$ENV_FILE"