FROM node

ADD . /app
WORKDIR /app
RUN npm install

ENV ADMIN_USERNAME ""
ENV ADMIN_PASSWORD ""
ENV NODE_ENV production

CMD [ "npm", "start" ]