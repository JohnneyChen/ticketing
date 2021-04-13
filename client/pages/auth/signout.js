import { useEffect } from "react";
import Router from "next/router";

import { useRequest } from "../../hooks/useRequest";

const Signout = () => {
  const { doRequest, errors, generalError } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => Router.push("/"),
  });
  useEffect(() => {
    const signout = async () => {
      await doRequest();
    };
    signout();
  }, []);

  return <div>Signing you out...</div>;
};

export default Signout;
