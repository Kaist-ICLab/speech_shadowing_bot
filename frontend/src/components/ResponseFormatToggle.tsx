import React, { FC, ChangeEvent } from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";

interface ResponseFormatToggleProps {
  isAudioResponse: boolean;
  setIsAudioResponse: (isAudioResponse: boolean) => void;
}

const ResponseFormatToggle: FC<ResponseFormatToggleProps> = ({
  isAudioResponse,
  setIsAudioResponse,
}) => {
  const handleToggleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsAudioResponse(event.target.checked);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={isAudioResponse}
            onChange={handleToggleChange}
            color="primary"
          />
        }
        label="Audio response"
      />
    </Box>
  );
};

export default ResponseFormatToggle;
