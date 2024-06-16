# Fetching the minified node image on apline linux
FROM node:slim

# Setting up the work directory
WORKDIR /avows

# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

#Solve the problem reinstaling bcrypt
RUN npm uninstall bcrypt
RUN npm i bcrypt

# Starting our application
CMD [ "node","index.js","npm","start","dev","redis-server" ]

# Exposing server port
EXPOSE 8080