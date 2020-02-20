#!/bin/sh

if [ -z "${PREFIX}" ]; then
  echo "deprecation warning: `PREFIX` environment variable should be specified explicitly"
  export PREFIX="/sigcom"
fi

if [ ! -z "${NEXT_PUBLIC_ENRICHR_URL}" ]; then
  export NEXT_PUBLIC_ENRICHR_URL="https://amp.pharm.mssm.edu/Enrichr/"
fi

echo "Mounting sigcom on ${PREFIX}..."

mkdir -p /usr/share/nginx/html/


# runtime config for website

cat > /sigcom/static/config.json << EOF
{
  "NEXT_PUBLIC_METADATA_API": "${NEXT_PUBLIC_METADATA_API}",
  "NEXT_PUBLIC_DATA_API": "${NEXT_PUBLIC_DATA_API}",
  "NEXT_PUBLIC_ENRICHR_URL": "${NEXT_PUBLIC_ENRICHR_URL}"
}
EOF

# link sigcom into nginx directory
ln -s /sigcom /usr/share/nginx/html${PREFIX}

exec "$@"
