#!/usr/bin/env bash

CONTAINER_NAME="juno-console"
VOLUME="juno_console"

if docker ps -a -q -f name="^/${CONTAINER_NAME}$" | grep -q .; then
  if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME")" = "true" ]; then
    echo "✋  Container '$CONTAINER_NAME' is already running..."
  else
    echo "▶️  Starting the emulator..."
    docker start -a -i "$CONTAINER_NAME"
  fi
else
  echo "🚀  Running new emulator..."

  docker run -it \
    --name "$CONTAINER_NAME" \
    -p 5987:5987 \
    -p 5999:5999 \
    -v "$VOLUME":/juno/.juno \
    -v "$(pwd)/target/deploy:/juno/target/deploy" \
    junobuild/console:latest
fi
