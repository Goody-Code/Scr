# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install project dependencies
# Using --omit=dev as devDependencies (like jest, supertest) are not needed for production
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
# (Assuming your app runs on port 3000, adjust if necessary)
EXPOSE 3000

# Define environment variable for JWT secret (example)
# For real production, manage secrets securely (e.g., Docker secrets, environment variables injected by hosting provider)
ENV JWT_SECRET=your_production_jwt_secret_from_env_or_secrets_manager

# Run app.js when the container launches
CMD ["node", "src/app.js"]
