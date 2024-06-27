import React, { FC, useState } from "react";
import "../App.css";

// Material UI
import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { Message } from "../interaces/Message";
import PreSurveyForm from "./PreSurveyForm";

interface MessageWrapperProps {
  align?: string;
}

const MessageWrapper = styled("div")<MessageWrapperProps>`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  justify-content: ${({ align }) =>
    align === "user" ? "flex-end" : "flex-start"};
`;

const UserMessage = styled("div")`
  position: relative;
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  border-radius: 1rem;
  border-top-right-radius: 0;
  align-self: flex-end;
  max-width: 80%;
  word-wrap: break-word;
`;

const AgentMessage = styled("div")`
  position: relative;
  background-color: ${({ theme }) => theme.palette.grey[300]};
  color: ${({ theme }) => theme.palette.text.primary};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  border-radius: 1rem;
  border-top-left-radius: 0;
  align-self: flex-end;
  max-width: 80%;
  word-wrap: break-word;
`;

interface ChatMessagesProps {
  msgs: Message[];
  bottomRef?: React.RefObject<HTMLDivElement>;
  status?: string;
  setUserProfile?: React.Dispatch<React.SetStateAction<string | null>>;
}

const ChatMessages: FC<ChatMessagesProps> = ({
  msgs,
  bottomRef,
  status,
  setUserProfile,
}) => {
  const theme = useTheme();

  return (
    <Container>
      <Box
        sx={{
          width: "100%",
          mt: 4,
          maxHeight: "68vh",
          minHeight: "68vh",
          overflow: "auto",
        }}
      >
        <Paper elevation={0} sx={{ padding: 2 }}>
          <List>
            {msgs.map((message, index) => (
              <ListItem key={index} sx={{ padding: 0 }}>
                <ListItemText
                  sx={{ margin: 0 }}
                  primary={
                    <MessageWrapper align={message.role}>
                      {message.role === "user" ? (
                        <>
                          <UserMessage theme={theme}>
                            {message.text}
                          </UserMessage>
                        </>
                      ) : message.key === "thinking" ||
                        message.audio ||
                        (message.audio === null &&
                          message.role === "assistant") ? (
                        <AgentMessage theme={theme}>
                          {message.text}
                        </AgentMessage>
                      ) : (
                        <AgentMessage theme={theme}>
                          {typeof message.text === "string" &&
                            message.text
                              .split(" ")
                              .map((word: string, index: number) => (
                                <React.Fragment key={index}>
                                  {index > 0 && " "}
                                  {word === "start" ? (
                                    <strong>{word}</strong>
                                  ) : (
                                    word
                                  )}
                                </React.Fragment>
                              ))}
                        </AgentMessage>
                      )}
                    </MessageWrapper>
                  }
                />
              </ListItem>
            ))}
            <div ref={bottomRef} />
          </List>
        </Paper>
        {status === "intro" && setUserProfile != undefined ? (
          <PreSurveyForm setUserProfile={setUserProfile} />
        ) : (
          ""
        )}
      </Box>
    </Container>
  );
};

export default ChatMessages;
