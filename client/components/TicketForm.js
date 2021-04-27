import React, { useState } from "react";
import Router from "next/router";

import Field from "./Field";
import { useRequest } from "../hooks/useRequest";

const TicketForm = ({ postTo, title, initTitle, initPrice, method }) => {
  const [ticketTitle, setTitle] = useState(initTitle || "");
  const [price, setPrice] = useState(initPrice || "");
  const { doRequest, errors, generalError } = useRequest({
    url: postTo,
    method: method || "post",
    body: {
      title: ticketTitle,
      price,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);
    console.log(value);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>{title}</h1>
      <div className="form-group">
        <label>Title</label>
        <Field
          field="title"
          type="text"
          fieldValue={ticketTitle}
          setField={setTitle}
          errors={errors}
        ></Field>
      </div>
      <div className="form-group">
        <label>Price</label>
        <Field
          field="price"
          type="text"
          fieldValue={price}
          setField={setPrice}
          errors={errors}
          onBlur={onBlur}
        ></Field>
      </div>
      {generalError}
      <button className="btn btn-primary">{title}</button>
    </form>
  );
};

export default TicketForm;
