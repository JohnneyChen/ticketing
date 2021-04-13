import AuthForm from "../../components/AuthForm";

const Signin = () => {
  return <AuthForm title="Sign in" postTo="/api/users/signin"></AuthForm>;
};

export default Signin;
