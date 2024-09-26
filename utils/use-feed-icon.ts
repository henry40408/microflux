import localforage from "localforage";

export default function useFeedIcon(
  feedId: number,
  iconId: number | undefined,
) {
  const cacheKey = `feed:${feedId}:icon`;
  const { $client } = useNuxtApp();
  return useAsyncData(
    `feed:${feedId}:icon`,
    async () => {
      if (!iconId) return null;
      const cached = await localforage.getItem<string>(cacheKey);
      if (cached) return JSON.parse(cached);
      const fetched = await $client.miniflux.getIcon.query(iconId);
      localforage.setItem(cacheKey, JSON.stringify(fetched));
      return fetched;
    },
    { server: false },
  );
}
