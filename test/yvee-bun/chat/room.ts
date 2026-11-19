export const chatPath = "/ws/chat";
export const messageLimit = 500;

export interface ChatMessage {
  sender: string;
  text: string;
}
