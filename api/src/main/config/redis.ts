import {createClient} from "redis";

const initRedis: any = async () => {
  
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL environment variable is not defined. It is not possible to init the Redis client.");
  }
  
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  redisClient.on("ready", () => console.log("Redis Client Connected"));
  await redisClient.connect();

  return redisClient;
};

export { initRedis };