import { useStorage } from "@vueuse/core";

export function useUser() {
  const username = useStorage<string | null>("username", null);

  const isUserSet = computed(() => !!username.value?.trim());

  const setUsername = (name: string) => {
    username.value = name.trim();
  };

  const clearUsername = () => {
    username.value = null;
  };

  return {
    username,
    isUserSet,
    setUsername,
    clearUsername,
  };
}
