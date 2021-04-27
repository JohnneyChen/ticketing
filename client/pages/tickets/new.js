import TicketForm from "../../components/TicketForm";

const NewTicket = () => {
  return (
    <TicketForm postTo={"/api/tickets"} title={"Create Ticket"}></TicketForm>
  );
};

export default NewTicket;
