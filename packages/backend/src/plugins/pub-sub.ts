import type { PubSubMessage, PubSubPlugin } from "fastify";
import { publicPlugin } from "#lib";

declare module "fastify" {
  interface PubSubMessage {
    action: string;
    userId?: string;
    data: any;
  }
  interface PubSubPlugin {
    publish: (channel: string, message: PubSubMessage) => Promise<void>;
    subscribe: (channel: string, callback: (message: PubSubMessage) => void) => Promise<void>;
    unsubscribe: (channel: string, callback: (message: PubSubMessage) => void) => Promise<void>;
  }
  interface FastifyInstance {
    pubsub: PubSubPlugin;
  }
}

const pubSubPlugin = publicPlugin(async (fastify) => {
  const listeners = new Map<string, Set<(message: PubSubMessage) => void>>();

  fastify.redis.sub.on("message", (channel, message) => {
    const messageListeners = listeners.get(channel);

    if (messageListeners) {
      for (const listener of messageListeners) {
        if (channel.includes("__keyevent@0__")) {
          listener({
            action: channel,
            data: message
          });
        } else {
          listener(JSON.parse(message));
        }
      }
    }
  });
  fastify.decorate("pubsub", {
    async publish(channel, message) {
      await fastify.redis.publish(channel, JSON.stringify(message));
    },
    async subscribe(channel, callback) {
      if (!listeners.has(channel)) {
        await fastify.redis.sub.subscribe(channel);
        listeners.set(channel, new Set());
      }

      listeners.get(channel)!.add(callback);
    },
    async unsubscribe(channel, callback) {
      if (listeners.has(channel)) {
        listeners.get(channel)!.delete(callback);

        if (listeners.get(channel)!.size === 0) {
          listeners.delete(channel);
        }
      }

      if (listeners.size === 0) {
        await fastify.redis.sub.unsubscribe(channel);
      }
    }
  } as PubSubPlugin);
});

export { pubSubPlugin };
