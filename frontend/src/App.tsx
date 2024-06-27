import React, { FC } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Bot from "./pages/Bot";
import Recordings from "./pages/Recordings";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bot />} />
        <Route path="/recordings" element={<Recordings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;