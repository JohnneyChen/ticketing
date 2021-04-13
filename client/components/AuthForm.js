import React, { useState } from "react";
import Router from "next/router";

import Field from "./Field";
import { useRequest } from "../hooks/useRequest";

const AuthForm = ({ postTo, title }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors, generalError } = useRequest({
    url: postTo,
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>{title}</h1>
      <div className="form-group">
        <label>Email address</label>
        <Field
          field="email"
          type="text"
          fieldValue={email}
          setField={setEmail}
          errors={errors}
        ></Field>
      </div>
      <div className="form-group">
        <label>Password</label>
        <Field
          field="password"
          type="password"
          fieldValue={password}
          setField={setPassword}
          errors={errors}
        ></Field>
      </div>
      {generalError}
      <button className="btn btn-primary">{title}</button>
    </form>
  );
};

export default AuthForm;
