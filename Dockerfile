FROM node

ADD . /app
WORKDIR /app
RUN npm install
RUN npm install react-scripts -g

ENV NODE_ENV development

CMD [ "npm", "start" ]