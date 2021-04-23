import { Ticket } from "../Ticket";

it("Error on edit with improper version number", async (done) => {
  const ticket = Ticket.build({
    title: "concert",
    price: 100,
    userId: "test",
  });

  await ticket.save();

  const instanceOne = await Ticket.findById(ticket.id);
  const instanceTwo = await Ticket.findById(ticket.id);

  instanceOne!.set({ title: "baseball", price: 200 });
  await instanceOne!.save();

  instanceTwo!.set({ title: "basketball", price: 150 });
  try {
    await instanceTwo!.save();
  } catch (err) {
    return done();
  }

  throw new Error("Should not reach this code");
});

it("Proper version incrementation on save", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 100,
    userId: "test",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
