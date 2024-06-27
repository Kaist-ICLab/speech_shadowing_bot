import React, { FC, ReactElement, useEffect, useState } from "react";
import "../App.css";

// Audio controls
import HelpIcon from "@mui/icons-material/Help";

// Material UI
import { Box, Container, Grid, IconButton, Tooltip } from "@mui/material";
import { Message } from "../interaces/Message";
import { Mic, StopCircle } from "@mui/icons-material";

interface AudioControlsProps {
  filterMessageObjects: (
    list: Message[]
  ) => { role: string; content: string | ReactElement | ReactElement[] }[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleBackendResponse: (
    response: {
      generated_text: string;
      generated_audio: string;
      transcription: string;
    },
    id?: number | null
  ) => void;
  stopRecording: () => void;
  isRecording: boolean;
  delaySecond: number;
}

const AudioControls: FC<AudioControlsProps> = ({
  stopRecording,
  isRecording,
  delaySecond,
}) => {
  const [size, setSize] = useState<number>(24);

  useEffect(() => {
    setSize(isRecording ? 36 : 20);
  }, [isRecording]);

  return (
    <Container>
      <Box sx={{ width: "100%", mt: 2 }}>
        <Grid
          container
          spacing={2}
          direction={"row"}
          justifyContent={"flex-end"}
        >
          <Grid
            item
            xs={8}
            md
            sx={{ display: "flex", justifyContent: "center" }}
          >
            {delaySecond === 0 ? (
              <IconButton
                color="error"
                aria-label="stop recording"
                onClick={stopRecording}
                disabled={!isRecording}
                style={{
                  transition: "transform width 0.2s, height 0.2s",
                  padding: "2px",
                }}
              >
                {isRecording ? (
                  <StopCircle style={{ fontSize: `${size}px` }} />
                ) : (
                  <Mic style={{ fontSize: `${size}px` }} />
                )}
              </IconButton>
            ) : (
              <span style={{ fontSize: `${size}px`, fontWeight: "400" }}>
                {delaySecond}
              </span>
            )}
          </Grid>
          <Grid item xs="auto">
            <Tooltip
              title={
                <div
                  style={{ maxWidth: "60vw", fontSize: "16px", padding: "2px" }}
                >
                  Speech shadowing is the process of mimicking a speaker
                  immediately after hearing his/her speech. This exercise is
                  best enjoyed through speakerphone.
                </div>
              }
              arrow
              placement="left"
            >
              <IconButton color="secondary" aria-label="help">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AudioControls;
