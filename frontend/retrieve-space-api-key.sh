# Step 1: Access the MongoDB container and execute commands
API_KEY=$(docker exec dev-space-mongodb mongosh -u root -p 4dm1n --quiet --eval 'db = db.getSiblingDB("space_db"); db.users.findOne({}, { apiKey: 1, _id: 0 }).apiKey' | tail -n 1 | tr -d '\r')

# Step 2: Check if the API_KEY was retrieved successfully
if [ -n "$API_KEY" ]; then
  echo "$API_KEY"
else
  echo "Failed to retrieve API key."
fi