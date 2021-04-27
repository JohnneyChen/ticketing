import Router from "next/router";

import { useRequest } from "../../hooks/useRequest";

const TicketShow = ({ ticket }) => {
  const { doRequest, generalError } = useRequest({
    url: "/api/orders",
    method: "post",
    body: { ticketId: ticket.id },
    onSuccess: (order) => {
      Router.push("/orders/[orderId]", `/orders/${order.id}`);
    },
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      <button
        className="btn btn-primary mb-2"
        onClick={() => {
          doRequest();
        }}
      >
        Purchase
      </button>
      {generalError}
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return {
    ticket: data,
  };
};

export default TicketShow;
