import React, { useState, useEffect } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ChatMessages from "../components/ChatMessages";

interface Recording {
  _id: number;
  user: string;
  file: string;
  originalText: string;
  transcribedText: string;
  level: string;
  theme: string;
  timestamp: string;
}

const Recordings: React.FC = () => {
  const [data, setData] = useState<Recording[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const response = await fetch(
        "MONGO_DB_ENDPOINT"
      );
      if (!response.ok) {
        console.error(`An error has occurred: ${response.statusText}`);
        return;
      }
      const data: Recording[] = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadAll = (): void => {
    data.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.file;
      link.download = `recording_${item._id}.wav`;
      link.click();
    });
  };

  return (
    <div>
      <IconButton onClick={downloadAll}>
        Download All
      </IconButton>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Original Text</TableCell>
              <TableCell>Transcribed Text</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Theme</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.user}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {
                      <ChatMessages
                        msgs={[
                          {
                            role: "user",
                            content: "🎤 Audio Message",
                            audio: new Audio(item.file),
                            text: "🎤 Audio Message",
                            id: item._id,
                          },
                        ]}
                      />
                    }
                    <a href={item.file} download>
                      <FileDownloadIcon />
                    </a>
                  </div>
                </TableCell>
                <TableCell>{item.originalText}</TableCell>
                <TableCell>{item.transcribedText}</TableCell>
                <TableCell>{item.level}</TableCell>
                <TableCell>{item.theme}</TableCell>
                <TableCell>
                  {new Date(item.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Recordings;