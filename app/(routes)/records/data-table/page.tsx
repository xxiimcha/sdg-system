import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
return [
    {
        id: "728ed52f",
        amount: 100,
        status: "pending",
        email: "m@example.com",
    },
    {
        id: "b1a2c3d4",
        amount: 200,
        status: "pending",
        email: "a@example.com",
    },
    {
        id: "c3d4e5f6",
        amount: 150,
        status: "pending",
        email: "b@example.com",
    },
    {
        id: "d4e5f6g7",
        amount: 250,
        status: "pending",
        email: "c@example.com",
    },
    {
        id: "e5f6g7h8",
        amount: 300,
        status: "pending",
        email: "d@example.com",
    },
    {
        id: "f6g7h8i9",
        amount: 350,
        status: "pending",
        email: "e@example.com",
    },
    {
        id: "g7h8i9j0",
        amount: 400,
        status: "pending",
        email: "f@example.com",
    },
    {
        id: "h8i9j0k1",
        amount: 450,
        status: "pending",
        email: "g@example.com",
    },
    {
        id: "i9j0k1l2",
        amount: 500,
        status: "pending",
        email: "h@example.com",
    },
    {
        id: "j0k1l2m3",
        amount: 550,
        status: "pending",
        email: "i@example.com",
    },
    {
        id: "k1l2m3n4",
        amount: 600,
        status: "pending",
        email: "j@example.com",
    },
    {
        id: "l2m3n4o5",
        amount: 650,
        status: "pending",
        email: "k@example.com",
    },
    {
        id: "m3n4o5p6",
        amount: 700,
        status: "pending",
        email: "l@example.com",
    },
    {
        id: "n4o5p6q7",
        amount: 750,
        status: "pending",
        email: "m@example.com",
    },
    {
        id: "o5p6q7r8",
        amount: 800,
        status: "pending",
        email: "n@example.com",
    },
    {
        id: "p6q7r8s9",
        amount: 850,
        status: "pending",
        email: "o@example.com",
    },
    {
        id: "q7r8s9t0",
        amount: 900,
        status: "pending",
        email: "p@example.com",
    },
    {
        id: "r8s9t0u1",
        amount: 950,
        status: "pending",
        email: "q@example.com",
    },
    {
        id: "s9t0u1v2",
        amount: 1000,
        status: "pending",
        email: "r@example.com",
    },
    {
        id: "t0u1v2w3",
        amount: 1050,
        status: "pending",
        email: "s@example.com",
    },
    {
        id: "u1v2w3x4",
        amount: 1100,
        status: "pending",
        email: "t@example.com",
    },
    {
        id: "v2w3x4y5",
        amount: 1150,
        status: "pending",
        email: "u@example.com",
    },
    {
        id: "w3x4y5z6",
        amount: 1200,
        status: "pending",
        email: "v@example.com",
    },
    {
        id: "x4y5z6a7",
        amount: 1250,
        status: "pending",
        email: "w@example.com",
    },
    {
        id: "y5z6a7b8",
        amount: 1300,
        status: "pending",
        email: "x@example.com",
    },
    {
        id: "z6a7b8c9",
        amount: 1350,
        status: "pending",
        email: "y@example.com",
    },
    {
        id: "a7b8c9d0",
        amount: 1400,
        status: "pending",
        email: "z@example.com",
    },
    {
        id: "b8c9d0e1",
        amount: 1450,
        status: "pending",
        email: "aa@example.com",
    },
    {
        id: "c9d0e1f2",
        amount: 1500,
        status: "pending",
        email: "bb@example.com",
    },
    {
        id: "d0e1f2g3",
        amount: 1550,
        status: "pending",
        email: "cc@example.com",
    },
]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
