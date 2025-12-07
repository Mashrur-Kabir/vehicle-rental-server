import { pool } from "../../config/db";

const createBookingIntoDB = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const vehicleQueryRes = await pool.query(
    `
    SELECT daily_rent_price, availability_status, vehicle_name FROM vehicles WHERE id = $1
  `,
    [vehicle_id]
  );

  if (vehicleQueryRes.rows.length === 0) {
    return {
      success: false,
      reason: "NO_VEHICLE",
    };
  } else if (vehicleQueryRes.rows[0].availability_status === "booked") {
    return {
      success: false,
      reason: "BOOKED_VEHICLE",
    };
  }

  const targetVehicle = vehicleQueryRes.rows[0];

  const startDate = new Date(rent_start_date as string);
  const endDate = new Date(rent_end_date as string);

  const totalRentDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const total_price = totalRentDays * targetVehicle.daily_rent_price;

  const bookingResult = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      "active",
    ]
  );

  //update `vehicles` table
  await pool.query(
    `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
    ["booked", vehicle_id]
  );

  const vehicle = {
    vehicle_name: targetVehicle.vehicle_name,
    daily_rent_price: targetVehicle.daily_rent_price,
  };

  return {
    ...bookingResult.rows[0],
    rent_start_date: new Date(bookingResult.rows[0].rent_start_date)
      .toISOString()
      .split("T")[0],
    rent_end_date: new Date(bookingResult.rows[0].rent_end_date)
      .toISOString()
      .split("T")[0],
    vehicle,
  };
};

const getAllBookingsFromDB = async () => {
  const bookings = await pool.query(`SELECT * FROM bookings ORDER BY id ASC`);

  const result = [];

  for (const i of bookings.rows) {
    const customer = await pool.query(
      `SELECT name, email FROM users WHERE id = $1`,
      [i.customer_id]
    );

    const vehicle = await pool.query(
      `SELECT vehicle_name, registration_number FROM vehicles WHERE id = $1`,
      [i.vehicle_id]
    );

    result.push({
      ...i,
      customer: customer.rows[0],
      vehicle: vehicle.rows[0],
    });
  }

  return result;
};

const getBookingsForCustomerFromDB = async (customerId: string) => {
  const bookings = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 ORDER BY id ASC`,
    [customerId]
  );

  const result = [];

  for (const i of bookings.rows) {
    const vehicle = await pool.query(
      `SELECT vehicle_name, registration_number, type FROM vehicles WHERE id = $1`,
      [i.vehicle_id]
    );

    result.push({
      ...i,
      vehicle: vehicle.rows[0],
    });
  }

  return result;
};

const getSingleBookingFromDB = async (id: string) => {
  const bookings = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [
    id,
  ]);

  if (bookings.rows.length === 0) return null;

  const booking = bookings.rows[0];

  const customer = await pool.query(
    `SELECT name, email FROM users WHERE id = $1`,
    [booking.customer_id]
  );

  const vehicle = await pool.query(
    `SELECT vehicle_name, registration_number FROM vehicles WHERE id = $1`,
    [booking.vehicle_id]
  );

  return {
    ...booking,
    rent_start_date: new Date(booking.rent_start_date)
      .toISOString()
      .split("T")[0],
    rent_end_date: new Date(booking.rent_end_date).toISOString().split("T")[0],
    customer: customer.rows[0],
    vehicle: vehicle.rows[0],
  };
};

const autoReturnVehiclesAfterExpiry = async () => {
  await pool.query(`
    UPDATE bookings
    SET status = 'returned'
    WHERE status = 'active' AND rent_end_date < CURRENT_DATE;

    UPDATE vehicles
    SET availability_status = 'available'
    WHERE id IN (
      SELECT vehicle_id FROM bookings WHERE status = 'returned'
    );
  `);
};

const updateBookingStatusInDB = async (
  bookingId: string,
  status: string,
  role: string,
  userId: string
) => {
  const booking = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [
    bookingId,
  ]);
  if (booking.rows.length === 0) return "NOT_FOUND";

  const record = booking.rows[0];

  if (role === "customer" && status !== "cancelled") return "FORBIDDEN";
  if (role === "admin" && status !== "returned") return "FORBIDDEN";
  if (role === "customer" && record.customer_id != userId) return "FORBIDDEN";

  const updated = await pool.query(
    `UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *`,
    [status, bookingId]
  );

  const formattedBooking = {
    ...updated.rows[0],
    rent_start_date: updated.rows[0].rent_start_date
      .toISOString()
      .split("T")[0],
    rent_end_date: updated.rows[0].rent_end_date.toISOString().split("T")[0],
  };

  if (status === "returned") {
    await pool.query(
      `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
      [record.vehicle_id]
    );

    const vehicleDataThatsReturned = await pool.query(
      `SELECT availability_status FROM vehicles WHERE id=$1`,
      [record.vehicle_id]
    );

    formattedBooking.vehicle = {
      availability_status: vehicleDataThatsReturned.rows[0].availability_status,
    };
  }

  return formattedBooking;
};

const deleteBookingFromDB = async (id: string) => {
  const checkAvailabilityStatus = await pool.query(
    `SELECT availability_status FROM vehicles WHERE id = $1`,
    [id]
  );

  if (checkAvailabilityStatus.rows.length === 0) {
    return {
      success: false,
      reason: "NO_VEHICLE",
    };
  }

  if (checkAvailabilityStatus.rows[0].availability_status === "booked") {
    return {
      success: false,
      reason: "BOOKED_VEHICLE",
    };
  }

  const result = await pool.query(
    `DELETE FROM bookings WHERE id = $1 RETURNING *`,
    [id]
  );
  return result;
};

export const bookingServices = {
  createBookingIntoDB,
  getAllBookingsFromDB,
  getBookingsForCustomerFromDB,
  getSingleBookingFromDB,
  autoReturnVehiclesAfterExpiry,
  updateBookingStatusInDB,
  deleteBookingFromDB,
};
