const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

app.use(cors()); // Use cors middleware to allow all origins (for development)
app.use(bodyParser.json());

// Array to store tables (initially available)
let tables = [
    { id: 1, seats: 10, isReserved: false },
    { id: 2, seats: 10, isReserved: false },
    { id: 3, seats: 10, isReserved: false },
    { id: 4, seats: 10, isReserved: false },
    { id: 5, seats: 10, isReserved: false },
];

// Array to store reservations
let reservations = [];

// Function to find available tables
function findAvailableTable(guestCount) {
    return tables.find(table => !table.isReserved && table.seats >= guestCount);
}

// GET /tables: Display available tables
app.get('/tables', (req, res) => {
    res.json(tables.filter(table => !table.isReserved));
});

// POST /reserve: Reserve a table
app.post('/reserve', (req, res) => {
    const { firstName, lastName, guestCount, reservationTime } = req.body;

    if (!firstName || !lastName || !guestCount || !reservationTime) {
        return res.status(400).json({ error: 'Name and guest count required' });
    }

    const table = findAvailableTable(guestCount);
    if (!table) {
        return res.status(400).json({ error: `No available tables for ${guestCount} guests` });
    }

    table.isReserved = true;
    const newReservation = {
        id: reservations.length + 1,
        firstName,
        lastName,
        guestCount,
        tableId: table.id,
        reservationTime,
    };
    reservations.push(newReservation);

    res.status(200).json({ message: `Table ${table.id} reserved for ${firstName} ${lastName} (${guestCount} guests)`, reservation: newReservation });
});

// GET /reservations: View all reservations
app.get('/reservations', (req, res) => {
    res.status(200).json(reservations);
});

// PUT /update/:id: Modify a reservation
app.put('/update/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { guestCount } = req.body;

    const reservation = reservations.find(r => r.id === id);
    if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if the new guest count can be accommodated
    if (guestCount) {
        const table = tables.find(t => t.id === reservation.tableId); //find table
        if (table.seats < guestCount) {
            return res.status(400).json({ error: `Table ${table.id} cannot accommodate ${guestCount} guests` });
        }
        reservation.guestCount = guestCount;
    }

    res.status(200).json({ message: 'Reservation updated successfully', reservation });
});

// DELETE /cancel/:id: Cancel a reservation
app.delete('/cancel/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const reservationIndex = reservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
        return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservations[reservationIndex];
    const table = tables.find(t => t.id === reservation.tableId);
    if (table) {
        table.isReserved = false;
    }
    reservations.splice(reservationIndex, 1);
    res.status(200).json({ message: 'Reservation cancelled successfully' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});