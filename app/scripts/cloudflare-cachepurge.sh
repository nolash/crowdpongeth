#!/bin/bash
# Clear CloudFlare cache for index.html

echo "Purging cloudflare cache for index.html"

# These env vars have to be set before this script is run
# CF_ZONE=12345 # cloudflare Zone ID - see Overview page
# CF_USER=demo@example.com #  Email address associated with cloudflare account
# CF_API_KEY=123456 #   API key generated on the "My Account" page in cloudflare
# CF_ROOT=https://demo.example.com # Actual domain name that is used in cloudflare

curl -v -X DELETE "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/purge_cache" \
-H "X-Auth-Email: $CF_USER" \
-H "X-Auth-Key: $CF_API_KEY" \
-H "Content-Type:application/json" \
--data "{\"files\": [\"$CF_ROOT\"]}" \

echo "Cloudflare cache purged, domain should serve fresh index.html now"
