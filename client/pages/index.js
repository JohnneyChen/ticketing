import buildClient from "../api/buildClient";

const LandingPage = ({ currentUser }) => {
  const isAuthenticated = currentUser
    ? `You are logged in with email ${currentUser.email}`
    : "You are not logged in";
  return <h1>{isAuthenticated}</h1>;
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  return {};
};

export default LandingPage;
