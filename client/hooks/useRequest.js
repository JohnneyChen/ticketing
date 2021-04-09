import React, { useState } from "react";
import axios from "axios";

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState([]);
  const [generalError, setGeneralError] = useState(null);

  const doRequest = async () => {
    setErrors([]);
    setGeneralError(null);
    try {
      const response = await axios[method](url, body);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const requestErrors = err.response.data.errors;

      setErrors(requestErrors);
      if (requestErrors.length === 1 && !requestErrors[0].field) {
        setGeneralError(
          <div className="alert alert-danger">{requestErrors[0].message}</div>
        );
      }
    }
  };

  return { doRequest, errors, generalError };
};

export { useRequest };
