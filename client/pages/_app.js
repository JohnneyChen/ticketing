import "bootstrap/dist/css/bootstrap.css";

import buildClient from "../api/buildClient";
import Header from "../components/Header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser}></Header>
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (AppContext) => {
  const client = buildClient(AppContext.ctx);
  const { data } = await client.get("/api/users/currentuser");

  let pageProps = {};
  if (AppContext.Component.getInitialProps) {
    pageProps = await AppContext.Component.getInitialProps(AppContext.ctx);
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
