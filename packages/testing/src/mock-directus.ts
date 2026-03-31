import type { MockDirectusConfig, MockDirectusClient } from './types.js';

/**
 * Creates a mock Directus client that intercepts request() calls
 * and returns configured data. Tracks all calls for assertions.
 *
 * When multiple collections are configured, provide a `resolver` function
 * to route queries to the correct collection data, since Directus SDK
 * query objects don't expose collection names in a standard property.
 */
export function createMockDirectus(config?: MockDirectusConfig): MockDirectusClient {
  const _config: MockDirectusConfig = {
    data: {},
    singletons: {},
    shouldFail: false,
    ...config,
  };

  const _calls: Array<{ query: any; timestamp: number }> = [];

  const client: MockDirectusClient = {
    _config,
    _calls,

    async request(query: any): Promise<any> {
      _calls.push({ query, timestamp: Date.now() });

      if (_config.shouldFail) {
        throw _config.error || new Error('Mock Directus request failed');
      }

      // If a custom resolver is provided, use it to determine the response
      if (_config.resolver) {
        return _config.resolver(query);
      }

      // Try to extract collection name from the query
      if (_config.data) {
        for (const [collection, data] of Object.entries(_config.data)) {
          if (query?._collection === collection || query?.collection === collection) {
            return data;
          }
        }
      }

      if (_config.singletons) {
        for (const [collection, data] of Object.entries(_config.singletons)) {
          if (query?._collection === collection || query?.collection === collection) {
            return data;
          }
        }
      }

      // Default: return the first data set or empty array
      const allData = Object.values(_config.data || {});
      if (allData.length > 0) return allData[0];

      const allSingletons = Object.values(_config.singletons || {});
      if (allSingletons.length > 0) return allSingletons[0];

      return [];
    },

    _reset() {
      _calls.length = 0;
    },
  };

  return client;
}
