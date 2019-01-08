FROM nginx:1.12-alpine
COPY ./build /usr/share/nginx/html/sigcomm/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]