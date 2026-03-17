import type { MaybeRefOrGetter, ShallowRef } from "vue";
import PartySocket from "partysocket";

export type PartySocketStatus = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED";

export interface UsePartySocketOptions<Data = any> {
  onConnected?: (ws: PartySocket) => void;
  onDisconnected?: (ws: PartySocket, event: CloseEvent) => void;
  onMessage?: (ws: PartySocket, event: MessageEvent, data: Data) => void;
  onError?: (ws: PartySocket, event: Event) => void;
  immediate?: boolean;
}

export interface UsePartySocketReturn<Data = any> {
  data: ShallowRef<Data | null>;
  status: Ref<PartySocketStatus>;
  send: (data: string | object) => void;
  open: () => void;
  close: () => void;
}

export function usePartySocket<Data = any>(
  room: MaybeRefOrGetter<string>,
  options: UsePartySocketOptions<Data> = {},
): UsePartySocketReturn<Data> {
  const {
    onConnected,
    onDisconnected,
    onMessage,
    onError,
    immediate = true,
  } = options;

  const config = useRuntimeConfig();
  const ws = ref<PartySocket | null>(null);
  const data = shallowRef<Data | null>(null);
  const status = ref<PartySocketStatus>("CLOSED");

  const _getRoomId = () => toValue(room);

  const open = () => {
    if (ws.value)
      return;

    const roomId = _getRoomId();
    status.value = "CONNECTING";

    const socket = new PartySocket({
      host: config.public.partykitHost,
      room: roomId,
    });

    ws.value = socket;

    socket.addEventListener("open", () => {
      status.value = "OPEN";
      onConnected?.(socket);
    });

    socket.addEventListener("message", (event) => {
      try {
        data.value = JSON.parse(event.data);
      }
      catch {
        data.value = event.data;
      }
      onMessage?.(socket, event, data.value!);
    });

    socket.addEventListener("close", (event) => {
      status.value = "CLOSED";
      onDisconnected?.(socket, event);
      ws.value = null;
    });

    socket.addEventListener("error", (event) => {
      onError?.(socket, event);
    });
  };

  const close = () => {
    ws.value?.close();
    ws.value = null;
    status.value = "CLOSED";
  };

  const send = (message: string | object) => {
    if (!ws.value || status.value !== "OPEN") {
      console.warn("WebSocket is not connected");
      return;
    }

    const payload = typeof message === "string" ? message : JSON.stringify(message);
    ws.value.send(payload);
  };

  if (immediate) {
    open();
  }

  tryOnScopeDispose(() => {
    close();
  });

  return {
    data,
    status,
    send,
    open,
    close,
  };
}
