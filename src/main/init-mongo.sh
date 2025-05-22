# mongo-init/init-mongo.sh
echo "Creating mongo users..."
mongosh admin --host localhost -u $MONGO_ROOT_USERNAME -p $MONGO_ROOT_USERNAME <<-EOJS
    use $DATABASE_NAME;
    db.createUser({
        user: '$DATABASE_USERNAME',
        pwd: '$DATABASE_PASSWORD',
        roles: [{role: 'readWrite', db: '$DATABASE_NAME'}, {role: 'dbAdmin', db: '$DATABASE_NAME'}]
    });
EOJS
echo "Mongo users created."