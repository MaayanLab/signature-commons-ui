FROM nginx:1.12-alpine

COPY ./entrypoint.sh /entrypoint.sh
RUN set -x && chmod +x /entrypoint.sh

COPY ./out /sigcom

EXPOSE 80

ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]
