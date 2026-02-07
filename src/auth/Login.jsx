import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Login = () => {
  const handleLogin = async () => {
    await signInWithEmailAndPassword(
      auth,
      "test@example.com",
      "Password123!"
    );
  };

  return <button onClick={handleLogin}>Login</button>;
};

export default Login;
