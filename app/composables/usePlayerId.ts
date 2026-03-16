import { useStorage } from "@vueuse/core";

export function usePlayerId() {
  return useStorage("room-player-id", () => crypto.randomUUID());
}
