import { default as Redis } from "ioredis"
import {getEnv} from "./utils.js";

// remember to call .quit(). Optionally prefix client.
export const getRedisClient = async (prefix?: string) => {
  const redis = new Redis(getEnv('REDIS_URL'), {keyPrefix: prefix})
  return redis
};
