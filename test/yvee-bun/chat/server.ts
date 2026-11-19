import type { WebSocketHandler } from "bun";
import { messageLimit, type ChatMessage } from "./room";

const room = "demo-chat";

export const chatRoom: WebSocketHandler<{ sender: string }> = {
  maxPayloadLength: 8192,
  publishToSelf: true,
  open(peer) {
    peer.subscribe(room);
  },
  message(peer, raw) {
    if (typeof raw !== "string") return;
    let message: unknown;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }
    if (!message || typeof message !== "object" || !("text" in message)) return;
    if (typeof message.text !== "string") return;
    const text = message.text.trim();
    if (!text || text.length > messageLimit) return;
    peer.publish(room, JSON.stringify({ sender: peer.data.sender, text } satisfies ChatMessage));
  },
};
