SPACE_ADMIN_API_KEY=$(./retrieve-space-api-key.sh)

cat <<EOF > .env
VITE_ENVIRONMENT="development"
VITE_SPACE_BASE_URL=http://localhost:3000/api/v1
VITE_SPACE_ADMIN_API_KEY=$SPACE_ADMIN_API_KEY
EOF