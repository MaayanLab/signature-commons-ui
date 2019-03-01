FROM nginx:1.12-alpine
COPY ./out /usr/share/nginx/html/${PREFIX:-sigcom}/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]