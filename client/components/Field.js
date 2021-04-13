import React from "react";

const Field = ({ field, type, fieldValue, setField, errors }) => {
  const error = errors.find((error) => error.field === field);

  if (!error) {
    return (
      <input
        className="form-control"
        type={type}
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

export default Field;
