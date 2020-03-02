FROM nginx:1.12-alpine

COPY ./entrypoint.sh /entrypoint.sh
RUN set -x && chmod +x /entrypoint.sh

COPY ./out /sigcom

EXPOSE 80

ENV NEXT_PUBLIC_METADATA_API=/sigcom
ENV NEXT_PUBLIC_DATA_API=/enrichmentapi
ENV NEXT_PUBLIC_ENRICHR_URL=https://amp.pharm.mssm.edu/Enrichr

ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]
