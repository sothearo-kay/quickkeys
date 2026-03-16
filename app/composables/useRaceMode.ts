export function useRaceMode() {
  return useState("race-mode", () => false);
}
