import IconButton from "@mui/material/IconButton";
import React, { FC, useEffect, useState } from "react";
import { PauseCircle, PlayArrow } from "@mui/icons-material";

interface SimpleAudioMessageProps {
  audioElement: HTMLAudioElement | null;
}

export const SimpleAudioMessage: FC<SimpleAudioMessageProps> = ({
  audioElement,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleOnClick = () => {
    if (audioElement === null) {
      return;
    }
    if (audioElement.paused) {
      audioElement.play();
      setIsPlaying(true);
    } else {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioElement != null) {
      audioElement.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [audioElement]);

  return (
    <div>
      <IconButton onClick={handleOnClick}>
        {isPlaying ? <PauseCircle /> : <PlayArrow />}
      </IconButton>
    </div>
  );
};
