# Run the local development server
dev:
    npm run dev

# Build the application locally
build:
    npm run build

# Run linting
lint:
    npm run lint

# Deploy changes to AWS Amplify (commits and pushes to main)
# Usage: just deploy "my commit message"
deploy message="Update website content":
    git add .
    git commit -m "{{message}}"
    git push origin main
