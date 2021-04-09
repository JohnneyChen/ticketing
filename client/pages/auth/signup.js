import React, { useState } from "react";
import Router from "next/router";

import { useRequest } from "../../hooks/useRequest";

const signUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors, generalError } = useRequest({
    url: "/api/users/signup",
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

  const renderForm = (field, fieldValue, setField, errors) => {
    const error = errors.find((error) => error.field === field);

    if (!error) {
      return (
        <input
          className="form-control"
          value={fieldValue}
          onChange={(e) => {
            setField(e.target.value);
          }}
        ></input>
      );
    }

    return (
      <React.Fragment>
        <input
          className="form-control is-invalid"
          value={fieldValue}
          onChange={(e) => {
            setField(e.target.value);
          }}
        ></input>
        <div className="invalid-feedback">{error.message}</div>
      </React.Fragment>
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign up</h1>
      <div className="form-group">
        <label>Email address</label>
        {renderForm("email", email, setEmail, errors)}
      </div>
      <div className="form-group">
        <label>Password</label>
        {renderForm("password", password, setPassword, errors)}
      </div>
      {generalError}
      <button className="btn btn-primary">Sign up</button>
    </form>
  );
};

export default signUp;
