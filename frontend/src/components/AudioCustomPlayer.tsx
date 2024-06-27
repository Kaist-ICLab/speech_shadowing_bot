import React, { FC, useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import Pause from "@mui/icons-material/Pause";
import { PlayArrow } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface AudioCustomPlayerProps {
  isUserAudio: boolean;
  audioElement: HTMLAudioElement | null;
  isAutoPlayed?: boolean;
  playbackRate?: number;
}

const AudioCustomPlayer: FC<AudioCustomPlayerProps> = ({
  isUserAudio,
  audioElement,
  isAutoPlayed = false,
  playbackRate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioBarArrs, setAudioBarArray] = useState<number[]>([]);
  const [indicatorPosition, setIndicatorPosition] = useState<number>(-1);

  const numBars = 16;
  const barWidth = 4;
  const barSpace = 2;
  const barHeight = 36;

  const theme = useTheme();
  const _playedSoundColor = isUserAudio
    ? theme.palette.primary.contrastText
    : theme.palette.text.secondary;
  const _unplayedSoundColor = isUserAudio
    ? theme.palette.text.disabled
    : theme.palette.text.disabled;

  const durationDisplay = (t: number) => {
    const addLeadingZero = (s: string) => {
      return "0".repeat(Math.max(0, 2 - s.length)) + s;
    };

    let hour = Math.round(t / 3600);
    t -= hour * 3600;
    let minute = Math.round(t / 60);
    t -= minute * 60;
    let second = t;

    return (
      (hour > 0 ? addLeadingZero(hour.toString()) + ":" : "") +
      addLeadingZero(minute.toString()) +
      ":" +
      addLeadingZero(second.toString())
    );
  };

  useEffect(() => {
    // This can be re-rendered multiple times
    if (audioElement) {
      audioElement.playbackRate = playbackRate ?? 1.0;

      // On audio end callback
      audioElement.onended = () => {
        setIsPlaying(false);
        audioElement.currentTime = 0;
      };

      // Load the duration & data to draw the soundwave.
      // It needs time to load so call audioElement.duration will return NaN instead
      audioElement.addEventListener("canplay", (e: Event) => {
        const duration = (e.target as HTMLAudioElement).duration;
        setAudioDuration(duration);

        // On audio currentTime update
        audioElement.ontimeupdate = () => {
          const _currentTime = audioElement.currentTime;
          setAudioCurrentTime(_currentTime);

          // Used for update color of the soundwave
          var _indicatorPosition =
            Math.round((_currentTime / duration) * 10000) / 100;
          setIndicatorPosition(_indicatorPosition);
        };

        // Assuming that the src starts with 'data:audio/mp3;base64,....'
        const generatedAudio = (e.target as HTMLAudioElement).src.slice(22);

        // Start getting audio data to draw soundwave
        var binaryString = atob(generatedAudio);
        var bytes = new Float32Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blockSize = Math.round(bytes.length / numBars);

        var barAvgs = [];

        var _min = Number.POSITIVE_INFINITY;
        var _max = 0;

        for (let i = 0; i < numBars; i++) {
          var sum = 0;
          for (var j = i * blockSize; j < (i + 1) * blockSize; j++) {
            sum += bytes[j];
          }
          sum /= blockSize;
          sum = Number.isNaN(sum) ? 0 : sum;
          _min = Math.min(_min, sum);
          _max = Math.max(_max, sum);
          // Normalizing the value to [0, 1]
          barAvgs.push(_min === _max ? 0 : (sum - _min) / (_max - _min));
        }

        setAudioBarArray(barAvgs);
      });
    }

    if (audioElement && isAutoPlayed) {
      setIsPlaying(true);
      audioElement.play();
    }
  }, [audioElement, isAutoPlayed, playbackRate]);

  return (
    audioElement && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconButton
          aria-label="play-message"
          onClick={() => {
            if (isPlaying) {
              audioElement.pause();
              setIsPlaying(false);
            } else {
              setIsPlaying(true);
              audioElement.play();
            }
          }}
        >
          {isPlaying ? (
            <Pause style={{ cursor: "pointer" }} fontSize="small" />
          ) : (
            <PlayArrow style={{ cursor: "pointer" }} fontSize="small" />
          )}
        </IconButton>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {audioBarArrs.map((barHeightRatio, index) => {
            var _isPlayed = (numBars * indicatorPosition) / 100 > index;
            return (
              <div
                key={index}
                style={{
                  height: `${barHeightRatio * barHeight + 4}px`,
                  backgroundColor: _isPlayed
                    ? _playedSoundColor
                    : _unplayedSoundColor,
                  borderRadius: "50px",
                  width: `${barWidth}px`,
                  marginLeft: `${barSpace / 2}px`,
                  marginRight: `${barSpace / 2}px`,
                }}
              ></div>
            );
          })}
        </div>
        <div style={{ marginLeft: "8px", fontSize: "small" }}>
          {durationDisplay(Math.round(audioDuration - audioCurrentTime))}
        </div>
      </div>
    )
  );
};

export default AudioCustomPlayer;
