import AuthForm from "../../components/AuthForm";

const Signup = () => {
  return <AuthForm title="Sign up" postTo="/api/users/signup"></AuthForm>;
};

export default Signup;
