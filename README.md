##DEPLOYMENT_GUIDE
# Trandaiz Application Deployment Guide (Conceptual)

This guide provides conceptual steps for deploying the Trandaiz application.
**Important:** This version of Trandaiz uses in-memory data storage for backend services. It is **not suitable for a production environment** where data persistence is required. For a real production deployment, you would need to integrate a persistent database (e.g., PostgreSQL, MongoDB) for the backend.

## Prerequisites

*   Docker installed on your local machine or deployment server.
*   Access to a terminal or command prompt.

## Project Structure

The application is split into two main parts:
*   `trandaiz/`: The backend Node.js/Express application.
*   `client/`: The frontend React application.

Each part has its own Dockerfile for containerization.

## Building Docker Images

1.  **Backend Service (`trandaiz`):**
    *   Navigate to the `trandaiz` directory:
        ```bash
        cd path/to/your/project/trandaiz
        ```
    *   Build the Docker image:
        ```bash
        docker build -t trandaiz-backend .
        ```
    *   The `Dockerfile` for the backend uses `node:18-alpine`, installs production dependencies, and exposes port 3000.
    *   **Security Note:** The `JWT_SECRET` is set via an `ENV` instruction in the Dockerfile (`ENV JWT_SECRET=your_production_jwt_secret_from_env_or_secrets_manager`). For actual production, this secret must be managed securely, for example, by injecting it as an environment variable at runtime by your hosting provider or using Docker secrets, rather than hardcoding it or leaving a weak default.

2.  **Frontend Application (`client`):**
    *   Navigate to the `client` directory:
        ```bash
        cd path/to/your/project/client
        ```
    *   Build the Docker image:
        ```bash
        docker build -t trandaiz-frontend .
        ```
    *   The `Dockerfile` for the frontend is a multi-stage build. Stage 1 builds the React application using `node:18-alpine`. Stage 2 serves the static build output using `nginx:stable-alpine` on port 80.
    *   It includes a custom `nginx.conf` to correctly handle client-side routing with React Router.

## Running Locally with Docker (Example)

This setup assumes you want to run both containers on the same machine, mapping their ports to different host ports.

1.  **Create a Docker Network (Recommended for service discovery):**
    ```bash
    docker network create trandaiz-net
    ```

2.  **Run Backend:**
    *   Replace `your_actual_strong_jwt_secret` with a real, strong secret.
    ```bash
    docker run -d \
      -p 3001:3000 \
      --network trandaiz-net \
      --name trandaiz_backend_container \
      -e JWT_SECRET="your_actual_strong_jwt_secret" \
      -e PORT=3000 \
      trandaiz-backend
    ```
    *   The backend will be accessible on `http://localhost:3001` on your host machine. Within the Docker network `trandaiz-net`, other containers can reach it at `http://trandaiz_backend_container:3000`.

3.  **Run Frontend:**
    ```bash
    docker run -d \
      -p 8080:80 \
      --network trandaiz-net \
      --name trandaiz_frontend_container \
      trandaiz-frontend
    ```
    *   The frontend will be accessible on `http://localhost:8080` on your host machine.
    *   **API Configuration for Frontend:** The frontend needs to know where the backend API is. If you're running locally as above, the frontend (served from `localhost:8080`) would need to make API calls to `http://localhost:3001/api`.
        *   For `create-react-app`, you can set an environment variable `REACT_APP_API_URL=http://localhost:3001/api` (or your deployed backend URL) during the frontend build process or configure it at runtime if your app supports it. This was not explicitly added in the current frontend code but is a standard practice. The Nginx config in the frontend container does not proxy API requests; the client browser makes direct calls.

## Deployment Suggestions (Conceptual for Production)

*   **Backend:**
    *   Host on platforms like AWS Elastic Beanstalk, Google Cloud Run, Heroku (using Docker deployment), or any VPS with Docker.
    *   **Database:** Replace in-memory stores with a persistent database (e.g., PostgreSQL, MongoDB). Use managed database services like AWS RDS, Google Cloud SQL, or MongoDB Atlas. Update backend code and provide `DATABASE_URL` as an environment variable.
    *   **Environment Variables:** Manage `JWT_SECRET`, `DATABASE_URL`, `PORT`, etc., securely through your hosting provider's mechanisms.
*   **Frontend:**
    *   **Static Hosting:** For React builds, static hosting (Netlify, Vercel, AWS S3 + CloudFront, GitHub Pages) is often most efficient. The `npm run build` output from the `client` directory can be deployed directly.
    *   **Containerized:** Alternatively, deploy the `trandaiz-frontend` Docker container as you would the backend.
    *   **API URL:** Ensure the frontend is built with the correct `REACT_APP_API_URL` pointing to your deployed backend service.
*   **Networking:**
    *   Use a reverse proxy (like Nginx or Traefik) or an API Gateway in front of your backend service.
    *   Configure DNS records for your domain(s).
    *   Enable HTTPS using SSL/TLS certificates (e.g., Let's Encrypt).

## CI/CD (Continuous Integration/Continuous Deployment)

A CI/CD pipeline automates testing, building, and deployment.
*   **Tools:** GitHub Actions, GitLab CI/CD, Jenkins.
*   **Pipeline Steps:**
    1.  Checkout code from repository.
    2.  Run backend tests (`npm test` in `trandaiz` directory).
    3.  (Optional) Run frontend tests (`npm test` in `client` directory, if implemented).
    4.  Build backend Docker image, tag it, and push to a container registry (Docker Hub, AWS ECR, Google Container Registry).
    5.  Build frontend application (if deploying statically) or build frontend Docker image, tag, and push to registry/hosting.
    6.  Deploy new versions to your chosen hosting platform(s), updating services with new image tags and managing environment variables.

This guide provides a starting point. Adapt these steps based on your specific hosting choices, scaling needs, and security requirements.
Remember, the current in-memory data model is for development/demonstration only.
```
