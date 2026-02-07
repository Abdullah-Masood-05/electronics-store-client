import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Register = () => {
  const handleRegister = async () => {
    await createUserWithEmailAndPassword(
      auth,
      "test@example.com",
      "Password123!"
    );
  };

  return <button onClick={handleRegister}>Register</button>;
};

export default Register;
