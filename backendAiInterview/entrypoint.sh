#!/bin/sh
if [ -f /run/secrets/backend_secret ]; then
  echo "Loading backend secrets..."
  set -a
  . /run/secrets/backend_secret
  set +a
fi

exec "$@"
