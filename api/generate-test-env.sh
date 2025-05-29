cat <<EOF > .env
ENVIRONMENT=development
# ---------- CACHE CONFIGURATION (Redis) ----------

REDIS_URL=redis://localhost:6379

# ---------- JWT CONFIGURATION ----------

JWT_SECRET=test_secret
JWT_SALT='wgv~eb6v=VWwC9GIG1q6rZ]J.tUM(M'
JWT_EXPIRATION=1d

# ---------- DEFAULT USER CONFIGURATION ----------

ADMIN_USER=admin
ADMIN_PASSWORD=4dm1n
EOF