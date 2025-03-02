# Build environment
FROM node:16-alpine as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV PUBLIC_URL https://konekta.onrender.com
ENV REACT_APP_API_URI https://konekta.onrender.com
ENV REACT_APP_BASENAME /

COPY package.json ./
COPY package-lock.json ./

RUN npm install --force

COPY . ./

RUN npm run build

# Production environment
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]