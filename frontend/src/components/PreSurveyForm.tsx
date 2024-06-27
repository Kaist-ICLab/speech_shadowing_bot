import React, { useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
} from "@mui/material";

interface PreSurveyFormProps {
  setUserProfile: React.Dispatch<React.SetStateAction<string | null>>;
}

let temp = "";
const PreSurveyForm: React.FC<PreSurveyFormProps> = ({ setUserProfile }) => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [yearsStudyingEnglish, setYearsStudyingEnglish] = useState("");
  const [socioeconomicStatus, setSocioeconomicStatus] = useState("");
  const [englishProficiency, setEnglishProficiency] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [browser, setBrowser] = useState("");
  const [preferredLessonTime, setPreferredLessonTime] = useState("");

  const [showLikertScale, setShowLikertScale] = useState(false);
  const handleSubmit = (e: any) => {
    e.preventDefault();

    setShowLikertScale(true);

    temp = `I'm ${localStorage.getItem(
      "userName"
    )},${age} years old and ${gender}.Major:${major}.Native Language:${nativeLanguage}.Years Studying English:${yearsStudyingEnglish}.Socioeconomic Status:${socioeconomicStatus}.English Proficiency:${englishProficiency}.Preferred Lesson Time:${preferredLessonTime}`;
  };

  if (showLikertScale) {
    return <LikertScaleQuestions setUserProfile={setUserProfile} />;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Native Language"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Select
            value={yearsStudyingEnglish}
            onChange={(e) => setYearsStudyingEnglish(e.target.value)}
            required
            fullWidth
            displayEmpty
            renderValue={(value) => (value ? value : "Years Studying English")}
          >
            <MenuItem value="">
              <em>Years Studying English</em>
            </MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4">4</MenuItem>
            <MenuItem value="5">5</MenuItem>
            <MenuItem value="6+">6+</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Select
            value={socioeconomicStatus}
            onChange={(e) => setSocioeconomicStatus(e.target.value)}
            required
            fullWidth
            displayEmpty
            renderValue={(value) => (value ? value : "Socioeconomic Status")}
          >
            <MenuItem value="">
              <em>Socioeconomic Status</em>
            </MenuItem>
            <MenuItem value="Lower">Lower</MenuItem>
            <MenuItem value="Upper Lower">Upper Lower</MenuItem>
            <MenuItem value="Lower Middle">Lower Middle</MenuItem>
            <MenuItem value="Middle">Middle</MenuItem>
            <MenuItem value="Upper Middle">Upper Middle</MenuItem>
            <MenuItem value="Upper">Upper</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Select
            value={englishProficiency}
            onChange={(e) => setEnglishProficiency(e.target.value)}
            required
            fullWidth
            displayEmpty
            renderValue={(value) =>
              value ? value : "Level of Proficiency in English"
            }
          >
            <MenuItem value="">
              <em>Level of Proficiency in English</em>
            </MenuItem>
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Select
            value={operatingSystem}
            onChange={(e) => setOperatingSystem(e.target.value)}
            required
            fullWidth
            displayEmpty
            renderValue={(value) =>
              value ? value : "Computer Type"
            }
          >
            <MenuItem value="">
              <em>Computer Type</em>
            </MenuItem>
            <MenuItem value="Windows">Windows</MenuItem>
            <MenuItem value="Mac">Mac</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Select
            value={browser}
            onChange={(e) => setBrowser(e.target.value)}
            required
            fullWidth
            displayEmpty
            renderValue={(value) =>
              value ? value : "Browser Type"
            }
          >
            <MenuItem value="">
              <em>Browser Type</em>
            </MenuItem>
            <MenuItem value="Chrome">Chrome</MenuItem>
            <MenuItem value="Safari">Safari</MenuItem>
            <MenuItem value="Edge">Edge</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Select
            value={preferredLessonTime}
            onChange={(e) => setPreferredLessonTime(e.target.value)}
            required
            fullWidth
            displayEmpty
            renderValue={(value) => (value ? value : "Preferred Lesson Time")}
          >
            <MenuItem value="">
              <em>Preferred Lesson Time</em>
            </MenuItem>
            <MenuItem value="Morning">Morning</MenuItem>
            <MenuItem value="Early Afternoon">Early Afternoon</MenuItem>
            <MenuItem value="Later Afternoon">Later Afternoon</MenuItem>
            <MenuItem value="Evening">Evening</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Next
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const LikertScaleQuestions: React.FC<PreSurveyFormProps> = ({
  setUserProfile,
}) => {
  const questions = [
    "I enjoy learning new languages",
    "Technology helps in my language learning endeavors",
    "I am comfortable using technology to learn new skills",
    "I frequently use language learning apps",
    "I believe personalized learning is beneficial for language acquisition",
    "I prefer traditional teaching methods over technological aids for language learning",
    "I am open to using speech shadowing chatbots for language learning",
    "I am concerned about data privacy and security when using language learning technology",
    "I believe technology can enhance language learning experiences",
    "I use ChatGPT for my schoolwork",
    "I use ChatGPT for language learning",
  ];

  const [responses, setResponses] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
    q6: 0,
    q7: 0,
    q8: 0,
    q9: 0,
    q10: 0,
    q11: 0,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // You can send the Likert scale responses to your API or perform any other necessary actions here
    const answersArray = questions.map((q, index) => ({
      q,
      a: responses[`q${index + 1}` as keyof typeof responses],
    }));

    const answersString = JSON.stringify(answersArray);
    setUserProfile(temp + answersString);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Typography variant="h6" gutterBottom>
        Please rate the following statements on a scale of 1 (Strongly Disagree)
        to 5 (Strongly Agree):
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label={questions[0]}
            name="q1"
            value={responses.q1}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[1]}
            name="q2"
            value={responses.q2}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[2]}
            name="q3"
            value={responses.q3}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[3]}
            name="q4"
            value={responses.q4}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[4]}
            name="q5"
            value={responses.q5}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[5]}
            name="q6"
            value={responses.q6}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[6]}
            name="q7"
            value={responses.q7}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[7]}
            name="q8"
            value={responses.q8}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[8]}
            name="q9"
            value={responses.q9}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[9]}
            name="q10"
            value={responses.q10}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={questions[10]}
            name="q11"
            value={responses.q11}
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 1, max: 5 } }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PreSurveyForm;
