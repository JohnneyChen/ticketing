import buildClient from "../api/buildClient";

const LandingPage = ({ currentUser }) => {
  const isAuthenticated = currentUser
    ? `You are logged in with email ${currentUser.email}`
    : "You are not logged in";
  return <h1>{isAuthenticated}</h1>;
};

LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);

  const { data } = await client.get("/api/users/currentuser");

  return data;
};

export default LandingPage;
