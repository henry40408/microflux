export default function useFeedIcon(
  feedId: number,
  iconId: number | undefined,
) {
  const { $client } = useNuxtApp();
  return useAsyncData(
    `feed:${feedId}:icon`,
    async () => {
      if (!iconId) return null;
      return await $client.miniflux.getIcon.query(iconId);
    },
    { server: false },
  );
}
