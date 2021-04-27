import { useState, useEffect } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";

import { useRequest } from "../../hooks/useRequest";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  const { doRequest, generalError } = useRequest({
    url: "/api/payments",
    method: "post",
    body: { orderId: order.id },
    onSuccess: () => {
      Router.push("/orders");
    },
  });

  if (timeLeft < 0) {
    return <div>This order has expired</div>;
  }

  return (
    <div>
      <h1>Purchasing {order.ticket.title}</h1>
      You have {timeLeft} seconds left to place your order
      <div className="mb-2">
        {" "}
        <StripeCheckout
          token={({ id }) => doRequest({ token: id })}
          stripeKey="pk_test_51ICS0mHRIHw8xwrCE8L6iiaHrYCf4sCKnxlYdIvASEpObUEQucCWjWDELp25Loi7Vxy88Rap6t1LM6o33Xqn5prg00foMOWdsC"
          amount={order.ticket.price * 100}
          email={currentUser.email}
        ></StripeCheckout>
      </div>
      {generalError}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
