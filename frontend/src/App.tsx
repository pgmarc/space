import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { SpaceRouter } from "./router/router";

export default function App(){
  return (
    <AuthProvider>
      <SettingsProvider>
        <SpaceRouter />
      </SettingsProvider>
    </AuthProvider>
  )
}