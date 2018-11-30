FROM nginx:1.12-alpine
COPY ./build /usr/share/nginx/html/signature-commons-ui/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]