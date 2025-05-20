test_files=$(find src/test -name "*.test.ts")
command=""

for file in $test_files; do
  if [ -z "$command" ]; then
    command="npx tsx --tsconfig tsconfig.json ./scripts/seedMongo.ts && vitest --run $file"
  else
    command="$command && npx tsx --tsconfig tsconfig.json ./scripts/seedMongo.ts && vitest --run $file"
  fi
done

eval $command