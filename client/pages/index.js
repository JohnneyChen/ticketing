import axios from "axios";

const LandingPage = () => {
  return <h1>Landing page</h1>;
};

LandingPage.getInitialProps = async () => {
  const response = await axios.get("ticketing.dev/api/users/currentuser");

  return response.data;
};

export default LandingPage;
