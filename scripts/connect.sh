#!/usr/bin/env bash
# solofounder-canvas: Connect to the canvas service using your Anthropic API key
# Usage: ./scripts/connect.sh [URL]
#
# Reads ANTHROPIC_API_KEY from environment or .dev.vars

set -euo pipefail

CANVAS_URL="${1:-http://localhost:8787}"

# Try to get API key from environment, then .dev.vars
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  if [[ -f .dev.vars ]]; then
    ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' .dev.vars | cut -d'=' -f2 | tr -d '\n\r"')
  fi
fi

if [[ -z "${ANTHROPIC_API_KEY:-}" ]] || [[ "$ANTHROPIC_API_KEY" == "sk-ant-REPLACE_ME" ]]; then
  echo "Error: ANTHROPIC_API_KEY not set"
  echo "Set it via: export ANTHROPIC_API_KEY=sk-ant-..."
  echo "Or add to .dev.vars: ANTHROPIC_API_KEY=sk-ant-..."
  exit 1
fi

echo "Connecting to $CANVAS_URL..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CANVAS_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\": \"$ANTHROPIC_API_KEY\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [[ "$HTTP_CODE" == "200" ]]; then
  TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || echo "")
  if [[ -n "$TOKEN" ]]; then
    echo "Authenticated successfully"
    echo "Session token: $TOKEN"
    echo ""
    echo "Open in browser: $CANVAS_URL"
    echo "Or use with curl: curl -H 'Authorization: Bearer $TOKEN' $CANVAS_URL/stream"

    # Try to open in browser
    if command -v open &>/dev/null; then
      open "$CANVAS_URL"
    fi
  else
    echo "Authentication succeeded but could not parse token"
    echo "$BODY"
  fi
else
  echo "Authentication failed (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi
