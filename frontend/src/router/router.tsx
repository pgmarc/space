import { BrowserRouter, Route, Routes } from "react-router";
import MainPage from "../pages/main";

export function SpaceRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage/>} />
      </Routes>
    </BrowserRouter>
  );

}