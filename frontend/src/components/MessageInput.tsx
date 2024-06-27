import React, { FC, ChangeEvent, KeyboardEvent } from "react";
import { Box, IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleBackendResponse: (
    response: {
      generated_text: string;
      generated_audio: string;
      transcription: string;
    },
    id?: number | null
  ) => void;
}

const MessageInput: FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSendMessage,
}) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
      <TextField
        variant="outlined"
        fullWidth
        label="Type your message"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
      <IconButton
        color="primary"
        onClick={handleSendMessage}
        disabled={message.trim() === ""}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;
