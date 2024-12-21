export default function (v: Ref<string | string[] | null>) {
  const value = toValue(v);
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value[0]) return value[0];
  return undefined;
}
