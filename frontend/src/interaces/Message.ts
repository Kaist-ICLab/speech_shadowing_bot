import { ReactElement } from "react";

export interface Message {
  role: string;
  content: string | ReactElement | ReactElement[];
  text: string | ReactElement;
  audio?: HTMLAudioElement | SpeechSynthesisUtterance | null;
  id?: number;
  key?: string;
}

export default Message;
