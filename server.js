const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://e-commetrics.com',
    'https://palmasrecovery.com',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: "localhost",
  user: "palmasrecovery_admin",
  password: ".x8;#JsZ[)][",
  database: "palmasrecovery_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Error connecting to MySQL database:", err.message);
  }
})();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: "host11.registrar-servers.com",
  port: 465,
  secure: true,
  auth: {
    user: "contact@palmasrecovery.com",
    pass: "Palmas_Recovery#2024",
  },
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error with email configuration:", error.message);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// Force trailing slash ONLY for non-API routes
app.use((req, res, next) => {
  const originalUrl = req.originalUrl;

  // ❌ Ignorar API
  if (originalUrl.startsWith("/api")) {
    return next();
  }

  // ❌ Ignorar promo-codes
  if (originalUrl.startsWith("/promo-codes")) {
    return next();
  }

  // ❌ Ignorar si ya tiene slash o es raíz
  if (originalUrl.endsWith("/") || originalUrl === "/") {
    return next();
  }

  // ✅ Mantener query params
  const [path, query] = originalUrl.split("?");
  const newUrl = path + "/" + (query ? `?${query}` : "");

  return res.redirect(301, newUrl);
});

// ==================== CONTACT FORM ENDPOINTS ====================

// Endpoint to handle contact form submissions
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log("📩 Contact form received:", req.body);

    // Validación de campos requeridos
    if (!name || !email || !message) {
      return res.status(400).json({
        error:
          "Missing required fields. Name, email, and message are required.",
      });
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format.",
      });
    }

    // Guardar en la base de datos
    const insertQuery = `
      INSERT INTO contact_messages (name, email, phone, message, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    let insertId;
    try {
      const [result] = await pool.execute(insertQuery, [
        name,
        email,
        phone || null,
        message,
      ]);
      insertId = result.insertId;
      console.log("✅ Contact message saved to DB, id:", insertId);
    } catch (dbErr) {
      console.error("❌ Error inserting into MySQL:", dbErr.message);
      return res.status(500).json({
        error: "Failed to save message in database.",
      });
    }

    // Preparar opciones de email
    const mailOptions = {
      from: '"Palmas Recovery Contact" <contact@palmasrecovery.com>',
      to: email,
      cc: "palmasrecoveryspa@gmail.com",
      subject: `Thank you for contacting us, ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #50492e; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #371510; color: #f2e9dc; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f2e9dc; padding: 20px; border: 1px solid #e5c8bd; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #9f9977; }
        .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #9f9977; }
        .label { font-weight: bold; color: #371510; }
        h1, h2, h3 { color: #371510; }
        h2 { border-bottom: 2px solid #e5c8bd; padding-bottom: 10px; }
      </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
                <h1 style="color: #ffffff; margin: 0;">Palmas Recovery</h1>
            </div>
            <div class="content">
              <h2>We've received your message</h2>
              <p>Thank you for contacting us. We'll respond as soon as possible.</p>

              <h3>Message Summary:</h3>
              <div class="info-row">
                <span class="label">Name:</span> ${name}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${email}
              </div>
              <div class="info-row">
                <span class="label">Phone:</span> ${phone || "Not provided"}
              </div>
              <div class="info-row">
                <span class="label">Message:</span>
                <p>${message}</p>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Palmas Recovery. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Enviar email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Contact email sent successfully:", info.messageId);
    } catch (mailErr) {
      console.error("❌ Error sending contact email:", mailErr.message);
      return res.status(207).json({
        success: true,
        warning: "Message saved but email notification failed.",
        messageId: insertId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact form submitted successfully. Email sent.",
      messageId: insertId,
    });
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
    res.status(500).json({
      error: "An unexpected error occurred. Please try again later.",
    });
  }
});

// ==================== BOOKING ENDPOINTS ====================

// Endpoint para verificar disponibilidad de múltiples habitaciones
app.post("/api/bulk-availability", async (req, res) => {
  try {
    const { checkIn, checkOut, roomIds } = req.body;

    if (!checkIn || !checkOut || !roomIds || !Array.isArray(roomIds)) {
      return res.status(400).json({
        error: "checkIn, checkOut and roomIds are required",
      });
    }

    const availability = {};

    for (const roomId of roomIds) {
      const query = `
        SELECT * FROM bookings
        WHERE room_id = ?
        AND status != 'cancelled'
        AND (
          (check_in <= ? AND check_out > ?) OR
          (check_in < ? AND check_out >= ?) OR
          (check_in >= ? AND check_out <= ?)
        )
      `;

      const [bookings] = await pool.execute(query, [
        roomId,
        checkOut,
        checkIn,
        checkOut,
        checkIn,
        checkIn,
        checkOut,
      ]);

      availability[roomId] = bookings.length === 0;
    }

    res.json(availability);
  } catch (err) {
    console.error("Error checking bulk availability:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para verificar disponibilidad de una habitación específica
app.post("/api/check-availability", async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        available: false,
        message: "Room ID, check-in and check-out dates are required",
      });
    }

    // Validar que checkOut sea después de checkIn
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        available: false,
        message: "Check-out must be after check-in",
      });
    }

    // Buscar reservas que se overlapeen con las fechas solicitadas
    const query = `
      SELECT * FROM bookings
      WHERE room_id = ?
      AND status != 'cancelled'
      AND (
        (check_in <= ? AND check_out > ?) OR
        (check_in < ? AND check_out >= ?) OR
        (check_in >= ? AND check_out <= ?)
      )
    `;

    const [bookings] = await pool.execute(query, [
      roomId,
      checkOut,
      checkIn,
      checkOut,
      checkIn,
      checkIn,
      checkOut,
    ]);

    if (bookings.length > 0) {
      return res.json({
        available: false,
        message: "This room is not available for the selected dates",
      });
    }

    res.json({ available: true });
  } catch (err) {
    console.error("Error checking availability:", err);
    res.status(500).json({
      available: false,
      message: "Error checking availability",
    });
  }
});

// Endpoint para crear una nueva reserva
app.post("/api/bookings", async (req, res) => {
  let connection;
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      fullName,
      email,
      phone,
      certifiedDoctor,
      specialRequests,
      extras,
      total,
      nights,
      pricePerNight,
    } = req.body;

    // Validaciones
    if (!roomId || !checkIn || !checkOut || !fullName || !email || !phone || !certifiedDoctor) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Verificar disponibilidad nuevamente (por si acaso)
    const checkQuery = `
      SELECT id FROM bookings
      WHERE room_id = ? AND status != 'cancelled'
      AND (
        (check_in <= ? AND check_out > ?) OR
        (check_in < ? AND check_out >= ?) OR
        (check_in >= ? AND check_out <= ?)
      )
    `;

    const [existing] = await pool.execute(checkQuery, [
      roomId,
      checkOut,
      checkIn,
      checkOut,
      checkIn,
      checkIn,
      checkOut,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Room is no longer available for the selected dates",
      });
    }

    // Generar número de confirmación único
    const confirmationNumber = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

    // Insertar reserva - SIN foreign key a rooms
    const insertQuery = `
      INSERT INTO bookings (
        room_id, check_in, check_out, guests, full_name,
        email, phone, certified_doctor, special_requests, extras, total,
        nights, price_per_night, confirmation_number, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', NOW())
    `;

    const [result] = await pool.execute(insertQuery, [
      roomId,
      checkIn,
      checkOut,
      guests,
      fullName,
      email,
      phone,
      certifiedDoctor,
      specialRequests || null,
      JSON.stringify(extras),
      total,
      nights,
      pricePerNight,
      confirmationNumber,
    ]);

    console.log("✅ Booking created successfully, ID:", result.insertId);
    console.log("📦 Extras saved:", extras);

    // Enviar email de confirmación CON LOS EXTRAS
    try {
      await sendBookingConfirmationEmail({
        ...req.body,
        confirmationNumber,
        bookingId: result.insertId,
      });
    } catch (emailErr) {
      console.error("❌ Error sending confirmation email:", emailErr);
      // No fallamos la reserva si el email falla
    }

    res.status(201).json({
      success: true,
      bookingId: result.insertId,
      confirmationNumber,
      message: "Booking created successfully",
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Función para enviar email de confirmación de reserva con extras
const sendBookingConfirmationEmail = async (bookingData) => {
  const {
    fullName,
    email,
    checkIn,
    checkOut,
    phone,
    certifiedDoctor,
    nights,
    total,
    confirmationNumber,
    roomId,
    extras,
    pricePerNight,
  } = bookingData;

  // Mapeo de nombres de habitaciones (desde el frontend)
  const roomNames = {
    private: "Private Room",
    shared: "Shared Room",
    "large-private": "Large Private Room",
    vip: "VIP Suite",
  };

  const roomName = roomNames[roomId] || roomId;

  // Calcular subtotal de la habitación
  const roomSubtotal = pricePerNight * nights;

  // Función para obtener el título del extra según el idioma
  const getExtraTitle = (extraId) => {
    const extraTitles = {
      lymphatic: "Lymphatic Massage",
      "5massages": "5 Lymphatic Massages Package",
      b01g: "ORIGINAL RECOVERY BRA - STYLE NO. B01G",
      fvom: "OPEN BUST VEST - 3/4 LENGTH SLEEVES - STYLE NO. FVOM",
      sfbhrs:
        "REINFORCED GIRDLE WITH HIGH-BACK AND LAYERED PANELS - SHORT LENGTH - STYLES NO. SFBHRS",
      sfbhs2:
        "GIRDLE WITH HIGH-BACK - NO CLOSURES - SHORT LENGHT - STYLE NO. SFBHS2",
    };
    return extraTitles[extraId] || extraId;
  };

  // Función para obtener el precio del extra
  const getExtraPrice = (extraId) => {
    const extraPrices = {
      lymphatic: 60,
      "5massages": 270,
      b01g: 80,
      fvom: 80,
      sfbhrs: 140,
      sfbhs2: 140,
    };
    return extraPrices[extraId] || 0;
  };

  // Parsear los extras (pueden venir como array o string JSON)
  let extrasList = [];
  if (extras) {
    if (typeof extras === "string") {
      try {
        extrasList = JSON.parse(extras);
      } catch (e) {
        extrasList = [];
      }
    } else if (Array.isArray(extras)) {
      extrasList = extras;
    }
  }

  // Calcular total de extras
  const extrasTotal = extrasList.reduce((sum, extraId) => {
    return sum + getExtraPrice(extraId);
  }, 0);

  // Generar HTML para los extras
  const extrasHtml =
    extrasList.length > 0
      ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #371510; border-bottom: 2px solid #e5c8bd; padding-bottom: 10px;">Extra Services:</h3>
      <table class="details-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #e5c8bd;">
            <th style="padding: 10px; text-align: left; color: #371510;">Service</th>
            <th style="padding: 10px; text-align: right; color: #371510;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${extrasList
            .map(
              (extraId) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5c8bd; color: #50492e;">${getExtraTitle(extraId)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5c8bd; text-align: right; color: #50492e;">$${getExtraPrice(extraId)}</td>
            </tr>
          `,
            )
            .join("")}
          <tr style="background-color: #f2e9dc;">
            <td style="padding: 10px; font-weight: bold; color: #371510;">Extras Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #371510;">$${extrasTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
      : "";

  const mailOptions = {
    from: '"Palmas Recovery Reservations" <contact@palmasrecovery.com>',
    to: email,
    cc: "palmasrecoveryspa@gmail.com",
    subject: `Booking Confirmation #${confirmationNumber} - Palmas Recovery`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #50492e; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #371510; color: #f2e9dc; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background-color: #f2e9dc; padding: 30px; border: 1px solid #e5c8bd; border-top: none; }
          .confirmation-box { background: #e5c8bd; border-left: 4px solid #9f9977; padding: 15px; margin: 20px 0; text-align: center; border-radius: 8px; }
          .confirmation-number { font-size: 24px; font-weight: bold; color: #371510; letter-spacing: 2px; }
          .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .details-table td { padding: 10px; border-bottom: 1px solid #e5c8bd; }
          .details-table td:first-child { font-weight: bold; color: #371510; width: 40%; }
          .total-row { font-size: 20px; background: #e5c8bd; }
          .total-row td { padding: 15px; }
          .total-amount { font-size: 24px; color: #371510; font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #9f9977; background: #f2e9dc; border-radius: 0 0 10px 10px; border-top: 1px solid #e5c8bd; }
          .check-times { background: #e5c8bd; border: 1px solid #9f9977; color: #371510; padding: 10px; border-radius: 5px; margin: 15px 0; }
          h1, h2, h3 { color: #371510; }
          h2 { border-bottom: 2px solid #e5c8bd; padding-bottom: 10px; }
          ul { padding-left: 20px; }
          li { margin: 10px 0; color: #50492e; }
          .extra-item { background: #ffffff; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #9f9977; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #ffffff; margin: 0;">Booking Confirmation</h1>
          </div>
          <div class="content">
            <h2>Thank you for choosing Palmas Recovery, ${fullName}!</h2>
            <p>Your reservation has been confirmed. We're looking forward to providing you with the best recovery experience.</p>

            <div class="confirmation-box">
              <div style="font-size: 14px; margin-bottom: 5px;">Your confirmation number:</div>
              <div class="confirmation-number">#${confirmationNumber}</div>
            </div>

            <div class="check-times">
              <strong>Important:</strong>
              <p>✓ Check-in: 2:00 PM (14:00 hrs)</p>
              <p>✓ Check-out: 11:00 AM</p>
            </div>

            <h3>Booking Details:</h3>
            <table class="details-table">
               <tr>
                <td><strong>Name:</strong></td>
                <td>${fullName}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>${email}</td>
              </tr>
              <tr>
                <td><strong>Phone:</strong></td>
                <td>${phone || "Not provided"}</td>
              </tr>
              <tr>
                <td><strong>Certified Plastic Surgeon:</strong></td>
                <td>${certifiedDoctor}</td>
              </tr>
              <tr>
                <td>Room:</td>
                <td>${roomName}</td>
              </tr>
              <tr>
                <td>Check-in:</td>
                <td>${checkIn} (2:00 PM)</td>
              </tr>
              <tr>
                <td>Check-out:</td>
                <td>${checkOut} (11:00 AM)</td>
              </tr>
              <tr>
                <td>Nights:</td>
                <td>${nights}</td>
              </tr>
              <tr>
                <td>Room Subtotal:</td>
                <td>$${roomSubtotal}</td>
              </tr>
            </table>

            ${extrasHtml}

            <table class="details-table">
              <tr class="total-row">
                <td style="font-size: 20px; font-weight: bold;">Total Amount:</td>
                <td class="total-amount">$${total} USD</td>
              </tr>
            </table>

            <h3>What's Included:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">✓ Medical assistance available 24/7</li>
              <li style="margin: 10px 0;">✓ All meals included (breakfast, lunch, dinner)</li>
              <li style="margin: 10px 0;">✓ Daily cleaning service</li>
              <li style="margin: 10px 0;">✓ Personalized recovery support</li>
            </ul>

            <h3>Cancellation Policy:</h3>
            <p>• Free cancellation up to 48 hours before check-in</p>
            <p>• 50% charge for cancellations within 48 hours</p>
            <p>• No-show: 100% charge</p>

            ${
              extrasList.length > 0
                ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px;">
                <h3 style="color: #371510; margin-top: 0;">Important Information:</h3>
                <p style="color: #50492e;">Your selected extra services have been added to your reservation. Please note that:</p>
                <ul>
                  <li>Recovery garments will be provided upon arrival at the facility</li>
                  <li>Massage services must be scheduled with our medical team</li>
                  <li>All extra services are non-refundable if not used</li>
                </ul>
              </div>
            `
                : ""
            }
          </div>
          <div class="footer">
            <p>Palmas Recovery - Your recovery journey starts here</p>
            <p>📍 Fray Servando Teresa de Mier 15-Interior 2<br>Zona Urbana Río Tijuana, 22010 Tijuana, B.C.</p>
            <p>📞 +1 (619) 967-9558 | 📧 contact@palmasrecovery.com</p>
            <p>&copy; ${new Date().getFullYear()} Palmas Recovery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ Booking confirmation email sent to:", email);
  console.log("📦 Extras included in email:", extrasList);
};

// Endpoint para obtener todas las reservas
app.get("/api/bookings", async (req, res) => {
  try {
    const [bookings] = await pool.execute(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );
    bookings.forEach((booking) => {
      booking.extras = JSON.parse(booking.extras || "[]");
    });
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener todos los mensajes de contacto
app.get("/api/contact", async (req, res) => {
  try {
    const [messages] = await pool.execute(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    res.json(messages);
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener una reserva específica
app.get("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM bookings WHERE id = ?`;

    const [bookings] = await pool.execute(query, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookings[0];
    booking.extras = JSON.parse(booking.extras || "[]");

    res.json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener reservas por email
app.post("/api/bookings/lookup", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const query = `SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC`;

    const [bookings] = await pool.execute(query, [email]);

    bookings.forEach((booking) => {
      booking.extras = JSON.parse(booking.extras || "[]");
    });

    res.json(bookings);
  } catch (err) {
    console.error("Error looking up bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para cancelar reserva
app.post("/api/bookings/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Verificar que la reserva existe y pertenece al email
    const checkQuery = "SELECT * FROM bookings WHERE id = ? AND email = ?";
    const [bookings] = await pool.execute(checkQuery, [id, email]);

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookings[0];

    // Verificar si se puede cancelar
    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // Actualizar estado
    const updateQuery = "UPDATE bookings SET status = 'cancelled' WHERE id = ?";
    await pool.execute(updateQuery, [id]);

    // Enviar email de cancelación
    try {
      await sendCancellationEmail(booking);
    } catch (emailErr) {
      console.error("Error sending cancellation email:", emailErr);
    }

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// Función para enviar email de cancelación
const sendCancellationEmail = async (booking) => {
  const mailOptions = {
    from: '"Palmas Recovery" <contact@palmasrecovery.com>',
    to: booking.email,
    subject: `Booking Cancellation - #${booking.confirmation_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #50492e; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #371510; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background-color: #f2e9dc; border: 1px solid #e5c8bd; border-top: none; border-radius: 0 0 10px 10px; }
          .confirmation-box { background: #e5c8bd; border-left: 4px solid #9f9977; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .confirmation-number { font-size: 20px; font-weight: bold; color: #371510; }
          h1 { color: #ffffff; margin: 0; }
          p { color: #50492e; }
          .footer { text-align: center; padding: 10px; font-size: 12px; color: #9f9977; margin-top: 20px; border-top: 1px solid #e5c8bd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Your booking has been successfully cancelled.</p>
            <div class="confirmation-box">
              <div class="confirmation-number">#${booking.confirmation_number}</div>
            </div>
            <p>If you have any questions, please contact us.</p>
          </div>
          <div class="footer">
            <p>Palmas Recovery - Your recovery journey starts here</p>
            <p>&copy; ${new Date().getFullYear()} Palmas Recovery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ==================== PROMO CODES ENDPOINTS ====================

app.get('/promo-codes', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM promo_codes ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los códigos' });
  }
});

app.post('/promo-codes/validate', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ valid: false, reason: 'Código requerido' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM promo_codes WHERE code = ?',
      [code.toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ valid: false, reason: 'Código no encontrado' });
    }

    const promo = rows[0];

    if (!promo.is_active) {
      return res.status(400).json({ valid: false, reason: 'Código inactivo' });
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.status(400).json({ valid: false, reason: 'Código expirado' });
    }

    if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
      return res.status(400).json({ valid: false, reason: 'Límite de usos alcanzado' });
    }

    await pool.execute(
      'UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = ?',
      [promo.id]
    );

    res.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
    });
  } catch (err) {
    res.status(500).json({ valid: false, reason: 'Error del servidor' });
  }
});

app.post('/promo-codes', async (req, res) => {
  const { code, discount_type, discount_value, expires_at, usage_limit } = req.body;

  if (!code || !discount_type || discount_value == null) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO promo_codes (code, discount_type, discount_value, expires_at, usage_limit)
       VALUES (?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        discount_type,
        discount_value,
        expires_at || null,
        usage_limit || null,
      ]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM promo_codes WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el código' });
  }
});

app.patch('/promo-codes/:id', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active == null) {
    return res.status(400).json({ error: 'Campo is_active requerido' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE promo_codes SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Código no encontrado' });
    }
    res.json({ message: 'Código actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el código' });
  }
});

app.delete('/promo-codes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM promo_codes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Código no encontrado' });
    }
    res.json({ message: 'Código eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el código' });
  }
});

// ==================== HEALTH CHECK ====================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Palmas Recovery API",
    endpoints: [
      "/api/health",
      "/api/contact",
      "/api/bookings",
      "/api/check-availability",
      "/api/bulk-availability",
      "/promo-codes",
      "/promo-codes/validate",
    ],
  });
});

// ==================== 404 HANDLER ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - POST   http://localhost:${PORT}/api/contact`);
  console.log(`   - POST   http://localhost:${PORT}/api/bookings`);
  console.log(`   - POST   http://localhost:${PORT}/api/check-availability`);
  console.log(`   - POST   http://localhost:${PORT}/api/bulk-availability`);
  console.log(`   - GET    http://localhost:${PORT}/api/health`);
  console.log(`   - GET    http://localhost:${PORT}/promo-codes`);
  console.log(`   - POST   http://localhost:${PORT}/promo-codes`);
  console.log(`   - POST   http://localhost:${PORT}/promo-codes/validate`);
  console.log(`   - PATCH  http://localhost:${PORT}/promo-codes/:id`);
  console.log(`   - DELETE http://localhost:${PORT}/promo-codes/:id`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("⚠️  SIGTERM signal received: closing HTTP server");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("⚠️  SIGINT signal received: closing HTTP server");
  await pool.end();
  process.exit(0);
});
