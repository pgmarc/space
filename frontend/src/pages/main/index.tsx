import useAuth from "../../hooks/useAuth";
import LoginPage from "../login";
import WelcomePage from "../welcome";

export default function MainPage() {
  const { isAuthenticated } = useAuth();

  // Responsive and improved design: add a light, space-inspired gradient background
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
      {isAuthenticated ? <WelcomePage /> : <LoginPage />}
    </div>
  );
}
