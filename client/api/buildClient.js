import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL: "http://www.johnneychen-ticketing-prod.xyz/",
      headers: req.headers,
    });
  } else {
    return axios.create();
  }
};

export default buildClient;
