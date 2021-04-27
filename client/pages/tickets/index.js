import Link from "next/link";

const TicketList = ({ currentUser, tickets }) => {
  const ticketList = tickets
    .filter((ticket) => ticket.userId === currentUser.id)
    .map((ticket) => {
      return (
        <tr key={ticket.id}>
          <td>{ticket.title}</td>
          <td>{ticket.price}</td>
          <td>
            <Link
              href="/tickets/edit/[ticketId]"
              as={`/tickets/edit/${ticket.id}`}
            >
              <a>Edit</a>
            </Link>
          </td>
        </tr>
      );
    });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

TicketList.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");
  return { tickets: data };
};

export default TicketList;
