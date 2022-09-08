import {default as Redis} from "ioredis"
import {getEnv} from "./utils.js";

// remember to call .quit(). Optionally prefix client.
export const getRedisClient = (prefix?: string) => {
  return new Redis(getEnv('REDIS_URL'), {keyPrefix: prefix})
};
