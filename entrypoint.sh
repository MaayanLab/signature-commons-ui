#!/bin/sh

if [ -z "${PREFIX}" ]; then
  echo "warning: PREFIX environment variable should be specified explicitly"
  export PREFIX="/"
fi

if [ -z "${NEXT_PUBLIC_ENRICHR_URL}" ]; then
  export NEXT_PUBLIC_ENRICHR_URL="https://amp.pharm.mssm.edu/Enrichr/"
fi

if [ -d /usr/share/nginx/html/ ]; then
  echo "Removing old nginx directory..."
  rm -r /usr/share/nginx/html/
fi

echo "Mounting sigcom on '${PREFIX}'..."
if [ "${PREFIX}" == "/" ]; then
  mkdir -p /usr/share/nginx/
  ln -s /sigcom /usr/share/nginx/html
else
  mkdir -p /usr/share/nginx/html/
  ln -s /sigcom /usr/share/nginx/html${PREFIX}
fi

# runtime config for website

echo "Writing config.json..."
tee /sigcom/static/config.json << EOF
{
  "NEXT_PUBLIC_METADATA_API": "${NEXT_PUBLIC_METADATA_API}",
  "NEXT_PUBLIC_DATA_API": "${NEXT_PUBLIC_DATA_API}",
  "NEXT_PUBLIC_ENRICHR_URL": "${NEXT_PUBLIC_ENRICHR_URL}",
  "NEXT_PUBLIC_EXTERNAL_API": "${NEXT_PUBLIC_EXTERNAL_API}",
  "NEXT_PUBLIC_GA_TRACKING_ID": "${NEXT_PUBLIC_GA_TRACKING_ID}"
}
EOF

exec "$@"
