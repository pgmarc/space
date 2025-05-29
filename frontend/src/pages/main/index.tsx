import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import LoginPage from "../login";
import WelcomePage from "../welcome";

export default function MainPage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {

  }, [isAuthenticated]);

  return <>{isAuthenticated ? <WelcomePage /> : <LoginPage />}</>;
}
