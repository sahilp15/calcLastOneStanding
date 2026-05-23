import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    })

    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redis.on('connect', () => {
      console.log('Redis connected')
    })

    redis.on('reconnecting', () => {
      console.log('Redis reconnecting...')
    })
  }
  return redis
}

export default getRedis
