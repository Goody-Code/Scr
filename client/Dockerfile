# Stage 1: Build the React app
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
# Using --legacy-peer-deps because it was needed during manual i18n setup.
# This ensures consistency in the Docker build environment.
# If the peer dependency issue was resolved differently (e.g., by upgrading TypeScript),
# this flag might not be needed.
RUN npm install --legacy-peer-deps
COPY . ./
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
# Copy a custom nginx config if needed, otherwise default serves index.html
# For create-react-app with react-router, a custom config is usually needed.
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
