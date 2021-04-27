import TicketForm from "../../../components/TicketForm";

const EditTicket = ({ ticket }) => {
  return (
    <TicketForm
      postTo={`/api/tickets/${ticket.id}`}
      title={"Edit Ticket"}
      initTitle={ticket.title}
      initPrice={ticket.price}
      method="put"
    ></TicketForm>
  );
};

EditTicket.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return {
    ticket: data,
  };
};

export default EditTicket;
