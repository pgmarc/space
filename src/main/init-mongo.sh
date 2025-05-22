# mongo-init/init-mongo.sh
echo "Creating mongo users..."

# Extract credentials and database name from MONGO_URI if it is defined
if [[ -n "$MONGO_URI" ]]; then
  echo "Extracting credentials from MONGO_URI..."
  DATABASE_USERNAME=$(echo "$MONGO_URI" | sed -n 's|.*://\([^:]*\):.*@\([^/]*\)/.*|\1|p')
  DATABASE_PASSWORD=$(echo "$MONGO_URI" | sed -n 's|.*://[^:]*:\([^@]*\)@[^/]*/.*|\1|p')
  DATABASE_NAME=$(echo "$MONGO_URI" | sed -n 's|.*/\([^?]*\).*|\1|p')
fi

mongosh admin --host localhost -u $MONGO_ROOT_USERNAME -p $MONGO_ROOT_PASSWORD <<-EOJS
  use $DATABASE_NAME;
  db.createUser({
    user: '$DATABASE_USERNAME',
    pwd: '$DATABASE_PASSWORD',
    roles: [{role: 'readWrite', db: '$DATABASE_NAME'}, {role: 'dbAdmin', db: '$DATABASE_NAME'}]
  });
EOJS
echo "Mongo users created."