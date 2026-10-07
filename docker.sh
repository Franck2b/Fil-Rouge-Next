#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

IMAGE="gabarit-next:latest"
URL="http://localhost:3000"

check_env() {
  command -v docker >/dev/null || { echo "Docker n'est pas installé."; exit 1; }
  docker info >/dev/null 2>&1 || { echo "Le démon Docker ne répond pas (est-il démarré ?)."; exit 1; }
  if [[ ! -f .env.local ]]; then
    echo "Fichier .env.local absent : cp .env.example .env.local, puis renseigner les valeurs Supabase."
    exit 1
  fi
  if grep -q "xxxxxxxx" .env.local; then
    echo ".env.local contient encore les valeurs d'exemple : renseigner les clés Supabase."
    exit 1
  fi
}

up() {
  check_env
  docker compose up --build --detach
  printf "Attente du démarrage"
  for _ in $(seq 1 30); do
    if [[ "$(docker inspect --format '{{.State.Health.Status}}' "$(docker compose ps -q web)")" == "healthy" ]]; then
      echo
      echo "Gabarit est disponible sur $URL"
      return
    fi
    printf "."
    sleep 2
  done
  echo
  echo "Le conteneur ne répond pas. Derniers journaux :"
  docker compose logs --tail 30 web
  exit 1
}

scan() {
  docker image inspect "$IMAGE" >/dev/null 2>&1 || { echo "Image absente : lancer d'abord ./docker.sh up"; exit 1; }
  docker scout version >/dev/null 2>&1 || { echo "Docker Scout n'est pas installé (voir README, section Docker)."; exit 1; }
  docker scout quickview "$IMAGE"
  docker scout cves --only-severity critical,high "$IMAGE"
}

case "${1:-up}" in
  up) up ;;
  down) docker compose down ;;
  logs) docker compose logs --follow web ;;
  scan) scan ;;
  *) echo "Usage : $0 [up|down|logs|scan]"; exit 1 ;;
esac
