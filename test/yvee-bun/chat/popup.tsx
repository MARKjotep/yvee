import { State } from "@/core/core.core";
import { SocketController, socketRoute, type SocketHub } from "@/yvee";
import { chatPath, messageLimit, type ChatMessage } from "./room";

@socketRoute(chatPath)
export class ChatSocket extends SocketController {}

export function chatPopup(hub: SocketHub) {
  const status = State("Connecting…");
  const offline = State(true);
  const transcript = State("");
  const messages: string[] = [];
  let socket: SocketController | undefined;

  function connect() {
    if (socket?.connection && socket.connection.readyState < WebSocket.CLOSING) return;
    status.value = "Connecting…";
    const peer = hub.load(chatPath);
    socket = peer;
    peer.open = () => {
      offline.value = false;
      status.value = "Connected";
    };
    peer.onMessage<ChatMessage>(({ sender, text }) => {
      messages.push(sender + ": " + text);
      if (messages.length > 100) messages.shift();
      transcript.value = messages.join("\n");
    }, { validate: (value): value is ChatMessage => typeof value === "object" && value !== null && "sender" in value && typeof value.sender === "string" && "text" in value && typeof value.text === "string" });
    peer.close = () => {
      if (peer !== socket) return;
      offline.value = true;
      status.value = "Disconnected. Reopen chat to reconnect.";
    };
  }

  return <details class="chat-popup" on={{ toggle(event) {
    if ((event.currentTarget as HTMLDetailsElement).open) connect();
  } }}>
    <summary>Room chat</summary>
    <div class="chat-panel">
      <small role="status">{status}</small>
      <pre role="log" aria-live="polite">{transcript}</pre>
      <form on={{ submit(event) {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const text = String(new FormData(form).get("message") ?? "").trim();
        if (!text || socket?.connection?.readyState !== WebSocket.OPEN) return;
        socket.sendJson({ text });
        form.reset();
      } }}>
        <input name="message" aria-label="Chat message" placeholder="Write a message" maxlength={messageLimit} required />
        <button type="submit" disabled={offline}>Send</button>
      </form>
    </div>
  </details>;
}
