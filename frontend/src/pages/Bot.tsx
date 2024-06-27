import React, { useState, useEffect, useRef, FC, ReactElement } from "react";
import "../App.css";
import ChatHeader from "../components/ChatHeader";
import ChatMessages from "../components/ChatMessages";
import AgentAudioMessage from "../components/AgentAudioMessage";
import LevelChart from "../components/LevelChart";
import MessageInput from "../components/MessageInput";
import AudioControls from "../components/AudioControls";
import { Amplify, API } from "aws-amplify";
import axios from "axios";
import DiffMatchPatch from "diff-match-patch";
import parse from "html-react-parser";

// Material UI
import { useTheme } from "@mui/material/styles";
import { keyframes, styled } from "@mui/system";
import { Box, Grid, TextField, Theme } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// Audio controls
import MicRecorder from "mic-recorder-to-mp3";
// import { useSelector, useDispatch } from "react-redux";
// import { setAudioFile, unsetAudioFile } from "./slices/audioFileSlice";
// import Diff from "diff";
// const Diff = require("diff");
import { Message } from "../interaces/Message";
import { SimpleAudioMessage } from "../components/SimpleAudioMessage";

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const ThinkingBubbleStyled = styled(MoreHorizIcon)`
  animation: ${pulse} 1.2s ease-in-out infinite;
  margin-bottom: -5px;
`;

interface ThinkingBubbleProps {
  theme: Theme;
  sx?: { marginBottom: string };
}

const ThinkingBubble = ({ theme, sx }: ThinkingBubbleProps): ReactElement => {
  return <ThinkingBubbleStyled theme={theme} sx={sx} />;
};

const filterMessageObjects = (list: Message[]) => {
  return list.map(({ role, content }) => ({ role, content }));
};

Amplify.configure({
  Auth: {
    mandatorySignIn: false,
  },
  API: {
    endpoints: [
      {
        name: "api",
        endpoint: "AWS_LAMBDA_ENDPOINT",
      },
    ],
  },
});

const Bot: FC = () => {
  // redux
  // const audioState = useSelector((state) => state.audioFile.file);
  // const dispatch = useDispatch();
  const personalization = true;
  const theme = useTheme();
  const [message, setMessage] = useState<string>("");
  const [lessonStatus, setLessonStatus] = useState<string>("askUser"); // "askUser", "init", "waiting", "started"
  const [chatGPTLesson, setchatGPTLesson] = useState<string>("");
  const [loadedLevel, setLoadedLevel] = useState<number>(
    localStorage.getItem("level")
      ? parseInt(localStorage.getItem("level") as string)
      : 1
  );
  const [level, setLevel] = useState<number>(0);
  const [levels, setLevels] = useState<number[]>([]);
  const [user, setUser] = useState<string | null>(
    localStorage.getItem("userName")
  );
  const [storyTheme, setStoryTheme] = useState<string | null>(
    localStorage.getItem("theme")
  );
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const beepAudio = new Audio(`${process.env.PUBLIC_URL}/ping.mp3`);

  const mockMessages: Message[] = [
    {
      role: "assistant",
      content: "Hello, please enter your name and grant mic access",
      text: "Hello, please enter your name and grant mic access",
    },
  ];

  const mockMessagesExisting: Message[] = [
    {
      role: "assistant",
      content:
        level === 10
          ? `Hey ${user}, welcome back! Please type start to begin your lesson on ${storyTheme}. Your current level is: 10, the highest level!`
          : `Hey ${user}, welcome back! Please type start to begin your lesson on ${storyTheme}. Your current level is: ${loadedLevel}`,
      text:
        level === 10
          ? `Hey ${user}, welcome back! Please type start to begin your lesson on ${storyTheme}. Your current level is: 10, the highest level!`
          : `Hey ${user}, welcome back! Please type start to begin your lesson on ${storyTheme}. Your current level is: ${loadedLevel}`,
    },
  ];

  const [messages, setMessages] = useState(
    user ? mockMessagesExisting : mockMessages
  );

  const [recorderDelaySecond, setRecorderDelaySecond] = useState<number>(0);
  const [recordTimerId, setRecordTimerId] = useState<NodeJS.Timeout | null>(
    null
  );

  const checkUserInputAddThinkingBubble = (): void => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message, text: message, audio: null },
    ]);

    setMessage("");

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />,
        text: <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />,
        key: "thinking",
      },
    ]);

    setMessages((prevMessages) => {
      return prevMessages.filter((message) => message.key !== "thinking");
    });
  };

  const addBotResponse = (sentence: string): void => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: sentence,
        text: sentence,
      },
    ]);
  };

  const setSecondsDelay = (i: number): void => {
    if (i === 0) {
      startLesson();
      return;
    }

    setTimeout(() => {
      addBotResponse(i.toString());
      beepAudio.play();
      setSecondsDelay(i - 1);
    }, 1000);
  };

  const [userProfile, setUserProfile] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      console.log(userProfile);
      handleUserIntroduction()
        .catch(() => {
          addBotResponse("There is something wrong, please try again");
        })
        .then((_level) => {
          if (_level) {
            addBotResponse(
              `From you introduction, your initial level is ${_level}`
            );
            personalization
              ? addBotResponse("Please set a theme for your lesson")
              : addBotResponse(
                  `Ok ${user} please type start when you're ready to begin`
                );
            personalization
              ? setLessonStatus("init")
              : setLessonStatus("waiting");
          }
        });
    }
  }, [userProfile]);

  const handleUserIntroduction = async (): Promise<number | undefined> => {
    let messageObjects = [
      {
        role: "system",
        // fix this prompt to output better
        content: `Grade the following self-introduction using the demographics and likert scale data on a scale from 1-10. Level 1 is total beginner and level 7 is an advanced English speaker. Only return the number`,
      },
      { role: "user", content: userProfile },
    ];

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />,
        text: <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />,
        key: "thinking",
      },
    ]);

    try {
      const response = await API.post("api", "/get-answer", {
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          text: message,
          messages: messageObjects,
          isAudioResponse: false,
        },
      });

      setMessages((prevMessages) => {
        return prevMessages.filter((message) => message.key !== "thinking");
      });

      let _level = parseInt(response["generated_text"]);

      setLevel(_level);
      setLevels([_level]);
      localStorage.setItem("level", _level.toString());
      addEntryToMongo(response, true);
      return _level;
    } catch (error) {
      console.error("Error sending text message:", error);
      return undefined;
    }
  };

  const [lessonHistory, setLessonHistory] = useState<string[]>([]);

  useEffect(() => {
    if (lessonHistory.length > 5) {
      setLessonHistory((prevHistory) => prevHistory.slice(1));
    }
  }, [lessonHistory]);

  const startLesson = async (): Promise<void> => {
    // https://www.appstate.edu/~steelekm/classes/psy2664/Flesch.htm

    let lessonPrompts: {
      [key: number]: {
        wordsPerSentence: number;
        syllablesPerWord: number;
        description: string;
      };
    } = {
      1: { wordsPerSentence: 3, syllablesPerWord: 1, description: "beginner" },
      2: {
        wordsPerSentence: 5,
        syllablesPerWord: 1,
        description: "early elementary",
      },
      3: {
        wordsPerSentence: 7,
        syllablesPerWord: 1,
        description: "elementary",
      },
      4: {
        wordsPerSentence: 8,
        syllablesPerWord: 1,
        description: "lower intermediate",
      },
      5: {
        wordsPerSentence: 10,
        syllablesPerWord: 2,
        description: "intermediate",
      },
      6: {
        wordsPerSentence: 12,
        syllablesPerWord: 2,
        description: "upper intermediate",
      },
      7: {
        wordsPerSentence: 14,
        syllablesPerWord: 2,
        description: "medium proficiency",
      },
      8: {
        wordsPerSentence: 16,
        syllablesPerWord: 3,
        description: "professional working proficiency",
      },
      9: {
        wordsPerSentence: 18,
        syllablesPerWord: 3,
        description: "full professional proficiency",
      },
      10: {
        wordsPerSentence: 20,
        syllablesPerWord: 4,
        description: "native or bilingual",
      },
    };

    let d = lessonPrompts[level]["description"];
    let w = lessonPrompts[level]["wordsPerSentence"];
    let s = lessonPrompts[level]["syllablesPerWord"];

    let messageObjects = [
      {
        role: "system",
        content: personalization
          ? `Generate a new, unique sentence for ${d} english speakers with the theme ${storyTheme}. The sentence should include ${w} words and ${s} syllables. Only return the lesson in quotes`
          : `Generate a new, unique sentence for ${d} english speakers. The sentence should include ${w} words and ${s} syllables. Only return the lesson in quotes`,
      },
    ];

    // `Given the theme "${storyTheme}" and based on the following example sentences:
    // "${formattedLessonHistory}", generate a new sentence for ${d} users that includes
    // exactly ${w} words and totals ${s} syllables. Return only the sentence in quotes.`

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />,
        text: <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />,
        key: "thinking",
      },
    ]);

    try {
      const response = await API.post("api", "/get-answer", {
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          text: message,
          messages:
            lessonHistory.length === 0
              ? messageObjects
              : [
                  {
                    role: "system",
                    content: `Based on the following example sentences at given levels: ${lessonHistory.join(
                      '", "'
                    )}, ${messageObjects[0].content}`,
                  },
                ],
          isAudioResponse: false,
        },
      });

      let lesson = response["generated_text"].replace(/["']/g, "");

      setLessonHistory((prevHistory) => [
        ...prevHistory,
        `level: ${level} ${lesson}`,
      ]);
      setchatGPTLesson(lesson);

      setMessages((prevMessages) => {
        return prevMessages.filter((message) => message.key !== "thinking");
      });
      handleBackendAudioResponse(response);
    } catch (error) {
      console.error("Error sending text message:", error);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    const msg = message.trim();

    if (lessonStatus === "askUser") {
      checkUserInputAddThinkingBubble();
      setUser(msg);
      localStorage.setItem("userName", msg);

      addBotResponse(
        `Hello ${msg}, please fill out the pre-survey form, your initial level will be graded from this profile`
      );
      setLessonStatus("intro");
    } else if (lessonStatus === "intro") {
      if (personalization && storyTheme?.length === 0) {
        checkUserInputAddThinkingBubble();
        addBotResponse(
          `Hello please set a theme in the change theme box to the left for your next lesson before continuing.`
        );
      } else {
        addBotResponse(`Hello please type start to begin your lesson`);
        setLessonStatus("waiting");
      }
      // setLessonStatus("init");
    } else if (lessonStatus === "init") {
      checkUserInputAddThinkingBubble();
      if (personalization)
        addBotResponse(
          `Ok ${user} please type start when you're ready to begin`
        );
      setLessonStatus("waiting");
      if (personalization) {
        setStoryTheme(msg);
        localStorage.setItem("theme", msg);
      } else {
        setStoryTheme("This user is using non personalized speech shadowing");
      }
    } else if (personalization && storyTheme?.length === 0) {
      checkUserInputAddThinkingBubble();
      addBotResponse(
        `Hello please set a theme in the change theme box to the left for your next lesson before continuing.`
      );
    } else if (lessonStatus === "waiting" && msg.toLowerCase() === "start") {
      checkUserInputAddThinkingBubble();
      personalization
        ? addBotResponse(
            `Ok the lesson's theme is ${storyTheme} and will begin in 3 seconds. When the audio clip begins to play, wait until the audio finishes and shadow the sentence aloud.`
          )
        : addBotResponse(
            `Ok the lesson will begin in 3 seconds. When the audio clip begins to play, wait until the audio finishes and shadow the sentence aloud.`
          );
      setLessonStatus("started");
      setSecondsDelay(3);
    } else {
      checkUserInputAddThinkingBubble();
      lessonStatus === "waiting"
        ? addBotResponse(
            "Sorry, I didn't get that. Please respond with start when you're ready for the lesson"
          )
        : addBotResponse("Sorry, lesson currently in progress");

      setMessage("");
    }
  };

  const [recorder, setRecorder] = useState<MicRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const startRecording = async (): Promise<void> => {
    const newRecorder = new MicRecorder({ bitRate: 128 });

    try {
      await newRecorder.start();
      setIsRecording(true);
      setRecorder(newRecorder);
    } catch (e) {
      console.error(e);
    }
  };

  const startRecordingWithDelay = (delaySecond: number) => {
    setRecorderDelaySecond(delaySecond);
    if (delaySecond === 0) {
      startRecording();
    } else {
      setTimeout(() => {
        startRecordingWithDelay(delaySecond - 1);
      }, 1000);
    }
  };

  const computeScore = (diffs: [number, string][]): number => {
    let similarities = 0;
    let differences = 0;

    for (const [changeType, text] of diffs) {
      if (changeType === DiffMatchPatch.DIFF_EQUAL) {
        similarities += text.length;
      } else {
        differences += text.length;
      }
    }

    // Rounding the result 2 digits after decimal
    return (
      Math.round((similarities / (similarities + differences)) * 10000) / 100
    );
  };

  const filterPunctuations = (s: string) => {
    //https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
    return s.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
  };

  const gradeTranscription = (response: {
    generated_text: string;
  }): [number, number] => {
    // https://github.com/kpdecker/jsdiff
    // https://stackoverflow.com/questions/68260965/how-to-compare-two-textfield-contents-and-highlight-the-characters-that-are-chan
    // https://stackoverflow.com/questions/38037163/how-to-highlight-the-difference-of-two-texts-with-css
    // https://github.com/JackuB/diff-match-patch
    let s1 = response["generated_text"];
    let s2 = chatGPTLesson;

    s1 = filterPunctuations(s1).toLowerCase();
    s2 = filterPunctuations(s2).toLowerCase();

    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(s1, s2);
    const score = computeScore(diffs);

    let newLevel = level;
    if (score >= 90 && level < 10) {
      newLevel += 1;
    } else if (score < 56 && level > 1) {
      newLevel -= 1;
    }

    localStorage.setItem("level", newLevel.toString());
    setLevel(newLevel);
    setLevels((prev) => [...prev, newLevel]);
    setLessonStatus("waiting");

    return [score, newLevel];
  };

  const addEntryToMongo = async (
    response: {
      generated_text: string;
    },
    profile?: boolean
  ): Promise<void> => {
    const entry = {
      user,
      originalText: profile ? userProfile : chatGPTLesson,
      transcribedText: response.generated_text,
      level,
      theme: storyTheme,
      timestamp: Date.now(),
    };
    const json = JSON.stringify(entry);
    await axios
      .post(
        "MONGOD_DB_ENDPOINT",
        json,
        {
          headers: {
            // Overwrite Axios's automatically set Content-Type
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  };

  const uploadAudio = async (audioFile: File): Promise<void> => {
    if (!audioFile) {
      console.log("No audio file to upload");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const messageId = new Date().getTime();

        let messageObjects = filterMessageObjects(messages);

        const userAudio = new Audio(base64Audio);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "user",
            content: "🎤 Audio Message",
            audio: userAudio,
            text: <SimpleAudioMessage audioElement={userAudio} />,
            id: messageId,
          },
        ]);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: (
              <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />
            ),
            text: (
              <ThinkingBubble theme={theme} sx={{ marginBottom: "-5px" }} />
            ),
            key: "thinking",
          },
        ]);

        const response = await API.post("api", "/get-answer", {
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            audio: base64Audio,
            messages: messageObjects,
            isAudioResponse: false,
          },
        });

        setMessages((prevMessages) => {
          return prevMessages.filter((message) => message.key !== "thinking");
        });
        addEntryToMongo(response);
        handleBackendAudioResponse(response, messageId);
      };
      reader.readAsDataURL(audioFile);
    } catch (error) {
      console.error("Error uploading audio file:", error);
    }
  };

  const stopRecording = async (): Promise<void> => {
    if (!recorder) return;

    try {
      const [buffer, blob] = await (await recorder.stop()).getMp3();
      const audioFile = new File(buffer, "voice-message.mp3", {
        type: blob.type,
        lastModified: Date.now(),
      });
      setIsRecording(false);
      if (recordTimerId != null) {
        clearTimeout(recordTimerId);
        setRecordTimerId(null);
      }
      // dispatch(setAudioFile(audioFile));
      uploadAudio(audioFile);
    } catch (e) {
      console.error(e);
    }
  };

  // Decode the Base64-encoded audio data
  const decodeAudio = (base64Data: string): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioContext = new window.AudioContext();
      audioContext.decodeAudioData(bytes.buffer, resolve, reject);
    });
  };

  // Get the duration of the audio
  const getAudioDuration = (text: string): number => {
    try {
      const words = text.split(/\s+/).filter((word) => word.length > 0);
      const wordCount = words.length;
      const averageWPM = 150; // average words per minute
      const durationInSeconds = (wordCount / averageWPM) * 60;
      return durationInSeconds;
    } catch (error) {
      console.error("Error:", error);
      return 0;
    }
  };

  const handleBackendAudioResponse = (
    response: {
      generated_text: string;
      generated_audio: string;
      transcription: string;
    },
    id: number | null = null
  ): void => {
    const generatedText = response.generated_text;
    // const generatedAudio = response.generated_audio;
    const transcription = response.transcription;

    const dmp = new DiffMatchPatch();

    let s1 = filterPunctuations(chatGPTLesson).toLowerCase();
    let s2 = filterPunctuations(generatedText).toLowerCase();

    const diff = dmp.diff_main(s1, s2);
    dmp.diff_cleanupSemantic(diff);
    const pretty = dmp.diff_prettyHtml(diff);

    const utterance = new SpeechSynthesisUtterance(generatedText);
    // let audioElement: HTMLAudioElement = new Audio();
    if (generatedText && id == null) {
      // audioElement = new Audio(`data:audio/mp3;base64,${generatedAudio}`);
      // audioElement.preload = "auto";

      let duration = getAudioDuration(generatedText);
      // Adjust duration based on level
      if (level === 4) duration += 0.5;
      else if (level === 5) duration += 0.5;
      else if (level === 6) duration += 1.0;
      else if (level >= 7) duration += 1.0;

      // Start recording with the adjusted duration
      startRecordingWithDelay(Math.ceil(duration));
    }

    let newLevel = level;
    if (id) {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((message) => {
          if (message.id && message.id === id) {
            return {
              ...message,
              content: transcription,
            };
          }
          return message;
        });
        const [grade, updatedLevel] = gradeTranscription(response);
        newLevel = updatedLevel;
        return [
          ...updatedMessages,
          {
            role: "assistant",
            content: parse(pretty),
            audio: utterance,
            text: (
              <AgentAudioMessage
                generatedText={parse(pretty)}
                transcribed={true}
                showGeneratedText={true}
              />
            ),
          },
          {
            role: "assistant",
            content: `You received a score of ${grade} out of 100`,
            text: `You received a score of ${grade} out of 100`,
          },
          {
            role: "assistant",
            content:
              newLevel === 10
                ? `Please type start for your next lesson. Your current level is: 10, the highest level!`
                : `Please type start for your next lesson. Your current level is: ${newLevel}`,
            text:
              newLevel === 10
                ? `Please type start for your next lesson. Your current level is: 10, the highest level!`
                : `Please type start for your next lesson. Your current level is: ${newLevel}`,
          },
        ];
      });
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: generatedText,
          audio: utterance,
          text: (
            <AgentAudioMessage
              level={level}
              generatedText={generatedText}
              showAudio={true}
            />
          ),
        },
      ]);
    }
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    const current = bottomRef.current as HTMLDivElementExtended;

    if (current) {
      if (typeof current.scrollIntoViewIfNeeded === "function") {
        current.scrollIntoViewIfNeeded({ behavior: "smooth" });
      } else {
        current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getMicrophoneAccess = async (): Promise<void> => {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        console.log("Microphone access granted!");
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    getMicrophoneAccess();

    if (localStorage.getItem("userName") && localStorage.getItem("level")) {
      setLessonStatus("waiting");
    }
  }, []);

  useEffect(() => {
    setLevel(loadedLevel);
    setLevels([loadedLevel]);
  }, [loadedLevel]);

  useEffect(() => {
    if (recorder != null && isRecording) {
      const _recordingTimeoutId = setTimeout(() => {
        stopRecording();
      }, 30000);
      setRecordTimerId(_recordingTimeoutId);
    } else {
      if (recordTimerId != null) {
        clearTimeout(recordTimerId);
        setRecordTimerId(null);
      }
    }
  }, [recorder, isRecording]);

  interface HTMLDivElementExtended extends HTMLDivElement {
    scrollIntoViewIfNeeded: (options?: ScrollIntoViewOptions) => void;
  }

  let typingTimer: ReturnType<typeof setTimeout> | undefined = undefined;

  const handleThemeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const temp = event.target.value;
    setStoryTheme(temp);
    localStorage.setItem("theme", temp);
    setSnackbarOpen(false); // Reset autohide
    clearTimeout(typingTimer);
    if (temp !== "") {
      typingTimer = setTimeout(() => {
        setSnackbarOpen(true);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimer);
      if (storyTheme !== "") {
        setSnackbarOpen(false);
      }
    };
  }, []);

  const handleCloseSnackbar = (): void => {
    setSnackbarOpen(false);
  };

  return (
    <Grid container spacing={2} style={{ height: "100%" }}>
      <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
        <Box sx={{ background: "#f5f5f5", padding: "20px", height: "100%" }}>
          {personalization ? (
            <div>
              <div style={{ paddingBottom: "20px" }}>Change theme</div>
              <TextField
                label="Type..."
                value={storyTheme}
                onChange={handleThemeChange}
                variant="outlined"
                sx={{ marginBottom: 10 }}
                style={{ display: "flex" }}
                InputLabelProps={{ shrink: true }}
              />
              {storyTheme !== "" && ( // Don't show MuiAlert when textbox is empty string
                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={1000}
                  onClose={handleCloseSnackbar}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <MuiAlert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{ width: "100%" }}
                  >
                    {`Theme changed successfully to: ${storyTheme}!`}
                  </MuiAlert>
                </Snackbar>
              )}
            </div>
          ) : null}
          <div style={{ paddingBottom: "20px" }}>Level chart</div>
          <LevelChart levels={levels} sx={{ width: "100%", height: "70%" }} />
        </Box>
      </Grid>
      <Grid item xs={12} sm={8} md={8} lg={8} xl={8}>
        <Box sx={{ background: "white", padding: "20px", height: "100%" }}>
          <ChatHeader />
          <ChatMessages
            msgs={messages}
            bottomRef={bottomRef}
            status={lessonStatus}
            setUserProfile={setUserProfile}
          />
          {lessonStatus === "intro" ? (
            ""
          ) : (
            <div>
              <AudioControls
                filterMessageObjects={filterMessageObjects}
                messages={messages}
                setMessages={setMessages}
                handleBackendResponse={handleBackendAudioResponse}
                stopRecording={stopRecording}
                isRecording={isRecording}
                delaySecond={recorderDelaySecond}
              />
              <MessageInput
                message={message}
                setMessage={setMessage}
                handleSendMessage={handleSendMessage}
                handleBackendResponse={handleBackendAudioResponse}
              />
            </div>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default Bot;
