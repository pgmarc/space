import { AuthProvider } from "./contexts/AuthContext";
import { SpaceRouter } from "./router/router";

export default function App(){
  return (
    <AuthProvider>
      <SpaceRouter />
    </AuthProvider>
  )
}