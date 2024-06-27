import React, { useState, FC, ReactElement, useEffect } from "react";
import { IconButton } from "@mui/material";
import { PauseCircle, PlayArrow } from "@mui/icons-material";
import { enableAutoTTS } from "enable-auto-tts";

interface AudioMessageProps {
  level?: number;
  generatedText?: string | ReactElement | ReactElement[];
  transcribed?: boolean;
  showAudio?: boolean;
  showGeneratedText?: boolean;
}

const AgentAudioMessage: FC<AudioMessageProps> = ({
  level = 0,
  generatedText,
  transcribed,
  showAudio,
  showGeneratedText,
}) => {
  const synth = window.speechSynthesis;
  const [utter, setUtter] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [hasEnabledVoice, setHasEnabledVoice] = useState<boolean>(false);

  useEffect(() => {
    // This is used to get available voices for synthesis
    if (!showAudio) {
      return;
    }

    const getVoices = () => {
      let voices = synth.getVoices();
      setVoices(voices);
    };

    getVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = getVoices;
    }
  }, [showAudio, generatedText]);

  useEffect(() => {
    if (!hasEnabledVoice) {
      enableAutoTTS();
      setHasEnabledVoice(true);
    }
  }, [hasEnabledVoice]);

  useEffect(() => {
    if (!showAudio || voices.length === 0) {
      return;
    }

    const utter = new SpeechSynthesisUtterance(generatedText as string);
    if (voices.length !== 0) {
      utter.voice = voices[0];
      for (let id in voices) {
        if (voices[id].lang === "en-US") {
          utter.voice = voices[id];
          break;
        }
      }
    }

    const { detect } = require("detect-browser");
    const browser = detect();

    let _playbackRate = 0.0;
    if (browser.os === "Mac OS") {
      if (level === 1) {
        _playbackRate = 0.1;
      } else if (level === 2) {
        _playbackRate = 0.2;
      } else if (level === 3) {
        _playbackRate = 0.3;
      } else if (level === 4) {
        _playbackRate = 0.4;
      } else if (level === 5) {
        _playbackRate = 0.5;
      } else if (level === 6) {
        _playbackRate = 0.6;
      } else {
        _playbackRate = 0.7;
      }
    } else {
      if (level === 1) {
        _playbackRate = 0.3;
      } else if (level === 2) {
        _playbackRate = 0.3;
      } else if (level === 3) {
        _playbackRate = 0.3;
      } else if (level === 4) {
        _playbackRate = 0.4;
      } else if (level === 5) {
        _playbackRate = 0.5;
      } else if (level === 6) {
        _playbackRate = 0.6;
      } else {
        _playbackRate = 0.7;
      }
    }

    utter.pitch = 1;
    utter.rate = _playbackRate;
    utter.addEventListener("end", () => {
      setIsPlaying(false);
    });
    synth.speak(utter);
    setIsPlaying(true);
    setUtter(utter);
  }, [voices, generatedText, level, showAudio]);

  const playSpeech = () => {
    if (utter == null) {
      return;
    }
    setIsPlaying(true);
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
    } else {
      synth.speak(utter);
    }
  };

  const pauseSpeech = () => {
    if (utter !== null) {
      setIsPlaying(false);
      setIsPaused(true);
      synth.pause();
    }
  };

  return (
    <span>
      {transcribed && <span>Your transcribed text: </span>}
      {showGeneratedText ? (generatedText ? generatedText : "") : ""}
      {showAudio ? (
        <IconButton onClick={() => (isPlaying ? pauseSpeech() : playSpeech())}>
          {isPlaying ? <PauseCircle /> : <PlayArrow />}
        </IconButton>
      ) : (
        <div />
      )}
    </span>
  );
};

export default AgentAudioMessage;
