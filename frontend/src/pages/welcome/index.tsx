import useAuth from "../../hooks/useAuth";

export default function WelcomePage() {
  
  const {user, logout} = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Space</h1>
      <p className="text-lg mb-8">{user.username}</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={logout}>
        Logout
      </button>
    </div>
  )
}