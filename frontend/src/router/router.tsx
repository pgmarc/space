import { BrowserRouter, Route, Routes } from "react-router";
import MainPage from "../pages/main";
import LoggedLayout from "@/layouts/logged-view";
import UsersPage from "@/pages/users";
import ServicesPage from "@/pages/services";
import ServiceDetailPage from "@/pages/services/ServiceDetailPage";
import SettingsPage from "@/pages/settings";

export function SpaceRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/users" element={<LoggedLayout><UsersPage/></LoggedLayout>}/>
        <Route path="/services" element={<LoggedLayout><ServicesPage/></LoggedLayout>}/>
        <Route path="/services/:name" element={<LoggedLayout><ServiceDetailPage/></LoggedLayout>}/>
        <Route path="/settings" element={<LoggedLayout><SettingsPage/></LoggedLayout>}/>
      </Routes>
    </BrowserRouter>
  );

}