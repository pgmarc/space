import { BrowserRouter, Route, Routes } from "react-router";
import MainPage from "../pages/main";
import LoggedLayout from "@/layouts/logged-view";
import UsersPage from "@/pages/users";
import PricingsPage from "@/pages/pricings";
import SettingsPage from "@/pages/settings";

export function SpaceRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/users" element={<LoggedLayout><UsersPage/></LoggedLayout>}/>
        <Route path="/pricings" element={<LoggedLayout><PricingsPage/></LoggedLayout>}/>
        <Route path="/settings" element={<LoggedLayout><SettingsPage/></LoggedLayout>}/>
      </Routes>
    </BrowserRouter>
  );

}