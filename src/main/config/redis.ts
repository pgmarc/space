import {createClient} from "redis";

const initRedis: any = async () => {
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  redisClient.on("ready", () => console.log("Redis Client Connected"));
  await redisClient.connect();

  return redisClient;
};

export { initRedis };