const express = require('express');
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const nodeMailer = require("nodemailer");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://e-commetrics.com", "http://localhost:3000", "https://foodhub-software.vercel.app"
      ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos:", error);
    process.exit(1); // Termina la aplicación si no se puede conectar a la base de datos
  }
  console.log("Conexión a la base de datos exitosa");
});

const JWT_SECRET = "mi-clave-super-secreta";
const saltRounds = 10;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "public", "images");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Evitar colisiones con timestamp + originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

let transporter = nodeMailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

let invoiceTransporter = nodeMailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  auth: {
    user: "facturacion@e-commetrics.com", 
    pass: "facturacion#2025", 
  },
});

const SYSTEM_PROMPT_ES = `Eres el asistente virtual de Ecommetrica, agencia de e-commerce y marketing digital con presencia en Tijuana y San Diego.

Información de contacto:
- Teléfono/WhatsApp: +52 664 642 9633
- Email: juanmanuel@ecommetrica.com
- Instagram: @ecommetrica
- Horario: Lunes a Viernes 9AM - 6PM
- Ubicaciones: Tijuana, B.C.

Servicios:
- Desarrollo web (React, Astro, Shopify)
- Soluciones e-commerce (B2C y B2B)
- SEO (Google y Meta)
- Producción de video
- Identidad de marca y diseño
- Copywriting creativo
- Gestión de redes sociales
- Publicidad digital (Google Ads, Facebook Ads, Instagram Ads)
- Automatización de marketing
- Desarrollo de web apps
- Consultoría estratégica

Paquetes y precios:
- Plan Inicial: $675 USD / 3 meses (landing page, SEO básico, configuración redes sociales)
- Plan Pro: $995 USD / 4 meses (Shopify, SEO avanzado, diseño de contenido)
- Plan Empresa: $1,185 USD / 6 meses (desarrollo web personalizado, estrategia social, anuncios)
- Plan Personalizado: $1,555 USD / 8 meses (consultoría estratégica, video, desarrollo de app)

Equipo:
- Kevin O. Okhuysen - Full-Stack Developer
- Karen Valdez - Video Editor & Copywriter
- María J. Zuili - Editora

Instrucciones:
- Responde siempre en español, de forma amigable, profesional y concisa.
- Si preguntan por precios, menciona los paquetes disponibles e invítalos a contactar para más detalles.
- No inventes información que no se te ha proporcionado.
- Mantén respuestas breves y directas.`;

const SYSTEM_PROMPT_EN = `You are the virtual assistant of Ecommetrica, an e-commerce and digital marketing agency with presence in Tijuana and San Diego.

Contact information:
- Phone/WhatsApp: +52 664 642 9633
- Email: juanmanuel@ecommetrica.com
- Instagram: @ecommetrica
- Hours: Monday to Friday 9AM - 6PM
- Locations: Tijuana, B.C.

Services:
- Web development (React, Astro, Shopify)
- E-commerce solutions (B2C and B2B)
- SEO (Google and Meta)
- Video production
- Brand identity and design
- Creative copywriting
- Social media management
- Digital advertising (Google Ads, Facebook Ads, Instagram Ads)
- Marketing automation
- Web app development
- Strategic consulting

Packages and pricing:
- Starter Plan: $675 USD / 3 months (landing page, basic SEO, social media setup)
- Pro Plan: $995 USD / 4 months (Shopify, advanced SEO, content design)
- Business Plan: $1,185 USD / 6 months (custom web development, social strategy, ads)
- Custom Plan: $1,555 USD / 8 months (strategic consulting, video production, app development)

Team:
- Kevin O. Okhuysen - Full-Stack Developer
- Karen Valdez - Video Editor & Copywriter
- María J. Zuili - Editor

Instructions:
- Always respond in English, in a friendly, professional, and concise manner.
- If asked about pricing, mention the available packages and invite them to contact for more details.
- Do not invent information that has not been provided.
- Keep responses brief and to the point.`;

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // Comparamos el password usando bcrypt con callback
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Bcrypt error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          userName: user.userName,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          userName: user.userName,
          role: user.role,
        },
      });
    });
  });
});

app.get("/api/profile", (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    db.query(
      "SELECT id, email, userName, role, profileImage FROM users WHERE id = ?",
      [decoded.id],
      (err, results) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (results.length === 0)
          return res.status(404).json({ message: "User not found" });

        res.json({ user: results[0] });
      }
    );
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/api/users/:id/apps", (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT component, can_view FROM users_apps WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error al obtener permisos:", err);
        return res.status(500).json({ error: "Error al obtener permisos" });
      }

      const allComponents = ["QR", "Vcard", "blogs", "calendar", "Reforma", "Monge", "PromoPalmas"];
      const fullList = allComponents.map((component) => {
        const found = results.find((r) => r.component === component);
        return {
          component,
          can_view: found ? !!found.can_view : false,
        };
      });

      res.json(fullList);
    }
  );
});


app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener usuarios" });
    res.json(results);
  });
});

app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener proyectos" });
    res.json(results);
  });
});

app.get("/api/project_content", (req, res) => {
  db.query("SELECT * FROM projects_content", (err, results) => {
    if (err) {
      console.error("Error al obtener contenidos de proyectos:", err);
      return res.status(500).json({ message: "Error del servidor" });
    }
    res.json(results);
  });
});

app.get("/api/projects/:id_user", (req, res) => {
  const { id_user } = req.params;

  const query = "SELECT * FROM projects WHERE id_user = ?";
  db.query(query, [id_user], (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching projects" });
    res.json(results);
  });
});

app.get("/api/project/:project_name", (req, res) => {
  const { project_name } = req.params;

  const query = "SELECT * FROM projects WHERE project_name = ?";
  db.query(query, [project_name], (err, results) => {
    if (err) {
      console.error("Error al obtener proyecto:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json(results);
  });
});

app.get("/api/project_content/:project_id", (req, res) => {
  const { project_id } = req.params;

  const query = "SELECT * FROM projects_content WHERE project_id = ?";
  db.query(query, [project_id], (err, results) => {
    if (err) {
      console.error("Error al obtener proyecto:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json(results);
  });
});

app.post('/api/upload-profile-image', upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
  }

  const imageUrl = `/images/${req.file.filename}`;
  res.json({ imageUrl });
});

app.post("/api/register", async (req, res) => {
  const { email, userName, password, role } = req.body;

  if (!email || !userName || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Verificar si ya existe usuario con ese email
    const [existingUsers] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar usuario con contraseña hasheada
    const [insertResult] = await db.promise().query(
      "INSERT INTO users (email, userName, password, role) VALUES (?, ?, ?, ?)",
      [email, userName, hashedPassword, role]
    );
    
    const emailHtml = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding: 30px; text-align: center; background-color: #2c1f56;">
            <h1 style="color: #ffffff; font-weight: 700; margin: 0; font-size: 28px;">Welcome to <span style="color: #ff6f61;">E-Commetrics</span></h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.5;">
            <p>Hello! Welcome to <strong>E-Commetrics</strong>. We are excited to work on your business and transform your vision. It will be a pleasure to collaborate with you.</p>

            <p>We are sending you your User details to access our platform. In the <strong>E-COMMETRICS <span style="text-decoration: underline;">Dashboard</span></strong>, log in with this email we created for you: <a href="mailto:${email}" style="color: #1a73e8;">${email}</a> and your password: <strong>${password}</strong></p>

            <p>Once authenticated, access the <a href="https://e-commetrics.com/" style="color: #1a73e8; font-weight: bold;">E-COMMETRICS Dashboard</a>, you will be able to review your entire project and visualize the status of the work, as well as any upcoming tasks and/or changes that may be needed.</p>

            <p>Thank you for joining us!</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding: 0 30px 30px 30px;">
            <img
              src="cid:unique@image.cid"
              alt="Elevate Your Business with Strategic Consultation"
              width="540"
              style="border-radius: 6px; max-width: 100%; height: auto; display: block; margin: 0 auto;"
            />
          </td>
        </tr>
        <tr>
          <td style="background-color: #2c1f56; color: #ffffff; text-align: center; padding: 20px; font-size: 14px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} E-Commetrics. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

    // Enviar correo con datos originales (sin hashear la password)
    try {
      await transporter.sendMail({
        from: `"E-Commetrics" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Welcome to E-Commetrics",
        html: emailHtml,
        attachments: [
          {
            filename: "email_image.png",
            path: "https://e-commetrics.com/email_image.png",
            cid: "unique@image.cid"
          }
        ]
      });
      return res.status(201).json({ message: "User created successfully and email sent" });
    } catch (emailError) {
      console.error("Error al enviar correo de bienvenida:", emailError);
      return res.status(201).json({ message: "User created successfully (email could not be sent)" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/users/:id/apps", (req, res) => {
  const userId = req.params.id;
  const permissions = req.body; // Ej: [{ component: 'QR', can_view: true }, ...]

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "Formato inválido" });
  }

  db.query("DELETE FROM users_apps WHERE user_id = ?", [userId], (err) => {
    if (err) {
      console.error("Error al eliminar permisos antiguos:", err);
      return res.status(500).json({ error: "Error al limpiar permisos" });
    }

    const values = permissions.map((p) => [userId, p.component, p.can_view]);

    if (values.length === 0) {
      return res.json({ message: "Permisos eliminados (sin componentes marcados)" });
    }

    db.query(
      "INSERT INTO users_apps (user_id, component, can_view) VALUES ?",
      [values],
      (err) => {
        if (err) {
          console.error("Error al insertar permisos:", err);
          return res.status(500).json({ error: "Error al insertar permisos" });
        }

        res.json({ message: "Permisos actualizados correctamente" });
      }
    );
  });
});


app.post("/api/projects", (req, res) => {
  const { id, id_user, title, percentage, content, project_name } = req.body;

  if (!id_user || !title || !project_name) {
    return res.status(400).json({ message: "Campos obligatorios faltantes" });
  }

  const sql =
    "INSERT INTO projects (id, id_user, title, percentage, content, project_name) VALUES (?, ?, ?, ?, ?, ?)";

  const percentageValue =
    percentage === undefined || percentage === null ? null : percentage;

  db.query(
    sql,
    [
      id || null,
      id_user,
      title,
      percentageValue,
      content || null,
      project_name,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al insertar proyecto:", err);
        return res.status(500).json({ message: "Error al crear proyecto" });
      }

      res
        .status(201)
        .json({ message: "Proyecto creado", projectId: result.insertId });
    }
  );
});

app.post("/api/projects/content", upload.single("image"), (req, res) => {
  const {
    project_id,
    content_1,
    content_2,
    content_3,
    link,
    href,
    id_user,
    type,
  } = req.body;

  // Validar campos mínimos (puedes ajustar según necesidades)
  if (!project_id || !id_user || !type) {
    return res.status(400).json({ message: "Campos requeridos faltantes" });
  }

  // La imagen subida está en req.file
  let imageUrl = null;
  if (req.file) {
    // Guardamos la ruta relativa para frontend
    imageUrl = `/images/${req.file.filename}`;
  }

  // Insertar en BD
  const sql =
    "INSERT INTO projects_content (project_id, content_1, content_2, content_3, link, href, id_user, source, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [
      project_id,
      content_1,
      content_2,
      content_3,
      link,
      href,
      id_user,
      imageUrl,
      type,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Error al guardar el proyecto" });
      }

      res.status(201).json({
        message: "Proyecto creado",
        projectId: result.insertId,
        imageUrl,
      });
    }
  );
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/", 
  });

  res.json({ message: "Logged out" });
});

app.put("/api/update-profile", (req, res) => {
  const { id, email, userName, profileImage } = req.body;

  if (!id || !email || !userName) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const sql = "UPDATE users SET email = ?, userName = ?, profileImage = ? WHERE id = ?";
  db.query(sql, [email, userName, profileImage || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al actualizar" });

    return res.json({ message: "Perfil actualizado correctamente" });
  });
});

app.post("/send-package-email", async (req, res) => {
  const { locale, package: pkg, extras, total, email } = req.body;

  const serviceListHTML = Array.isArray(pkg.services)
    ? pkg.services.map((s) => `<li>${s.title || s.name || JSON.stringify(s)}</li>`).join("")
    : "<li>No hay servicios</li>";

  const extrasListHTML = Array.isArray(extras) && extras.length
    ? extras.map((e) => `<li>${e.name || e.title || JSON.stringify(e)} - ${e.price}</li>`).join("")
    : `<p style="margin: 0;">${locale === "es" ? "Ninguno" : "None"}</p>`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>${locale === "es" ? "Detalles del Paquete" : "Package Details"}</h2>
      <p><strong>${locale === "es" ? "Título" : "Title"}:</strong> ${pkg.title}</p>
      <p><strong>${locale === "es" ? "Precio" : "Price"}:</strong> ${pkg.price}</p>

      <h3>${locale === "es" ? "Servicios Incluidos" : "Included Services"}:</h3>
      <ul>${serviceListHTML}</ul>

      <h3>${locale === "es" ? "Extras Seleccionados" : "Selected Extras"}:</h3>
      <ul>${extrasListHTML}</ul>

      <p><strong>Total:</strong> ${total}</p>

      <br />
      <p>${locale === "es" ? "Gracias por tu interés" : "Thanks for your interest"}</p>
    </div>
  `;

  const mailOptions = {
    from: `"E-commetrics" <${process.env.SMTP_USER}>`,
    to: email,
    cc: process.env.SMTP_USER,
    subject: locale === "es" ? "Detalles del paquete seleccionado" : "Selected package details",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Error al enviar el correo:", err);
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Campos incompletos" });
  }

  // Opcional: validar que email tenga formato válido aquí

  // Actualizar email y rol
  const sql = "UPDATE users SET email = ?, role = ? WHERE id = ?";
  db.query(sql, [email, role, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar usuario:", err);
      return res.status(500).json({ message: "Error al actualizar usuario" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado correctamente" });
  });
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { id_user, title, percentage, content, project_name } = req.body;

  if (!id_user || !title || !project_name) {
    return res.status(400).json({ message: "Campos obligatorios faltantes" });
  }

  const sql = `
    UPDATE projects
    SET id_user = ?, title = ?, percentage = ?, content = ?, project_name = ?
    WHERE id = ?
  `;

  const percentageValue =
    percentage === undefined || percentage === null ? null : percentage;

  db.query(
    sql,
    [id_user, title, percentageValue, content || null, project_name, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar proyecto:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar proyecto" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }

      res.json({ message: "Proyecto actualizado correctamente" });
    }
  );
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { title, project_name, percentage, content } = req.body;

  if (!title || !project_name) {
    return res.status(400).json({ message: "Campos obligatorios faltantes" });
  }

  const sql = `UPDATE projects SET title = ?, project_name = ?, percentage = ?, content = ? WHERE id = ?`;

  db.query(
    sql,
    [title, project_name, percentage, content, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar proyecto:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar proyecto" });
      }
      res.json({ message: "Proyecto actualizado correctamente" });
    }
  );
});

app.put("/api/project_content/:id", upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { content_1, content_2, content_3, link, href, type } = req.body;

  if (!type) {
    return res.status(400).json({ message: "El tipo es obligatorio" });
  }

  // Procesar la imagen si se subió
  let imageUrl = null;
  if (req.file) {
    imageUrl = `/images/${req.file.filename}`;
  }

  const sql = `
    UPDATE projects_content
    SET content_1 = ?, 
        content_2 = ?, 
        content_3 = ?, 
        link = ?, 
        href = ?, 
        type = ?,
        source = CASE WHEN ? IS NOT NULL THEN ? ELSE source END
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      content_1, 
      content_2, 
      content_3, 
      link, 
      href, 
      type,
      imageUrl, // Para la primera comparación
      imageUrl, // Para el segundo valor (si no es null)
      id
    ],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar contenido:", err);
        // Eliminar la imagen subida si hubo error
        if (req.file) {
          fs.unlink(path.join(__dirname, 'public', req.file.path), () => {});
        }
        return res.status(500).json({ message: "Error al actualizar contenido" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Contenido no encontrado" });
      }
      
      res.json({ 
        message: "Contenido actualizado correctamente",
        imageUrl: imageUrl || undefined
      });
    }
  );
});
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar usuario:", err);
      return res.status(500).json({ message: "Error al eliminar usuario" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  });
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM projects WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar proyecto:", err);
      return res.status(500).json({ message: "Error al eliminar proyecto" });public
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    res.json({ message: "Proyecto eliminado correctamente" });
  });
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM projects WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar proyecto:", err);
      return res.status(500).json({ message: "Error al eliminar proyecto" });
    }
    res.json({ message: "Proyecto eliminado correctamente" });
  });
});

app.delete("/api/project_content/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM projects_content WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar contenido:", err);
      return res.status(500).json({ message: "Error al eliminar contenido" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }
    res.json({ message: "Contenido eliminado correctamente" });
  });
});

app.post("/api/invoice", async (req, res) => {
  try {
    const {
      tableId,
      customerEmail,
      customerSummaries,
      paymentSummary,
      orders,
      timestamp
    } = req.body;

    console.log("📧 Recibida solicitud de facturación:", {
      tableId,
      customerEmail,
      totalCustomers: customerSummaries?.length,
      totalAmount: paymentSummary?.total
    });

    // Validaciones básicas
    if (!customerEmail || !tableId || !paymentSummary) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos para la facturación"
      });
    }

    // Verificar que el transporter esté funcionando
    try {
      await invoiceTransporter.verify();
      console.log("✅ Transporter de facturación verificado");
    } catch (transporterError) {
      console.error("❌ Error en el transporter:", transporterError);
      return res.status(500).json({
        success: false,
        message: "Error de configuración del servidor de correo"
      });
    }

    // Generar contenido HTML para el correo de facturación
    const invoiceHtml = generateInvoiceEmail({
      tableId,
      customerEmail,
      customerSummaries,
      paymentSummary,
      orders,
      timestamp
    });

    // Configurar opciones del correo
    const mailOptions = {
      from: `"Sistema de Facturación - Restaurante" <facturacion@e-commetrics.com>`,
      to: customerEmail,
      cc: "facturacion@e-commetrics.com",
      subject: "Proceso de Facturación - Restaurante",
      html: invoiceHtml,
    };

    console.log("📤 Enviando correo a:", customerEmail);

    // Enviar correo usando el nuevo transporter
    await invoiceTransporter.sendMail(mailOptions);

    console.log("✅ Correo de facturación enviado exitosamente a:", customerEmail);

    res.json({
      success: true,
      message: "Solicitud de factura recibida. Recibirá un correo con los pasos para completar el proceso."
    });

  } catch (error) {
    console.error("❌ Error en el proceso de facturación:", error);
    
    // Error más específico para el cliente
    let errorMessage = "Error al procesar la solicitud de factura. Por favor, intente nuevamente.";
    
    if (error.code === 'EAUTH') {
      errorMessage = "Error de autenticación del servidor de correo.";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Error de conexión con el servidor de correo.";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Función para generar el HTML del correo de facturación - SIMPLIFICADA
function generateInvoiceEmail(data) {
  const {
    tableId,
    customerEmail,
    customerSummaries = [],
    paymentSummary,
    orders = [],
    timestamp
  } = data;

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

const orderDate = timestamp ? 
  new Date(timestamp).toLocaleDateString('es-MX') : 
  new Date().toLocaleDateString('es-MX');

  // Función segura para generar items
  const generateItemsHTML = (customer) => {
    if (!customer.orders || !Array.isArray(customer.orders)) return '';
    
    return customer.orders.map(order => {
      if (!order.order_items || !Array.isArray(order.order_items)) return '';
      
      return order.order_items.map(item => {
        const productName = item.productName || item.product_name || 'Producto';
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        
        return `
          <div class="item-row">
            <div class="item-name">${productName} x${quantity}</div>
            <div class="item-details">${formatCurrency(price * quantity)}</div>
          </div>
        `;
      }).join('');
    }).join('');
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Proceso de Facturación</title>
  <style>
    body { 
      font-family: 'Arial', sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f8f9fa;
      margin: 0; 
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 10px; 
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      padding: 30px; 
      text-align: center;
    }
    .header h1 { 
      margin: 0; 
      font-size: 28px; 
      font-weight: bold;
    }
    .header p { 
      margin: 10px 0 0; 
      opacity: 0.9;
    }
    .content { 
      padding: 30px;
    }
    .section { 
      margin-bottom: 25px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .section-title { 
      color: #2d3748; 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 15px;
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 15px; 
      margin-bottom: 15px;
    }
    .customer-section {
      background: white;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      border: 1px solid #e2e8f0;
    }
    .customer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .customer-name {
      font-weight: bold;
      color: #2d3748;
    }
    .customer-total {
      font-weight: bold;
      color: #667eea;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 14px;
    }
    .item-name {
      flex: 2;
    }
    .item-details {
      flex: 1;
      text-align: right;
      color: #718096;
    }
    .summary {
      background: #edf2f7;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #cbd5e0;
    }
    .total-row {
      font-weight: bold;
      font-size: 18px;
      color: #2d3748;
      border-bottom: none;
      border-top: 2px solid #cbd5e0;
      padding-top: 15px;
    }
    .steps {
      background: #fffaf0;
      border-left: 4px solid #ed8936;
      padding: 20px;
      border-radius: 8px;
      margin-top: 25px;
    }
    .steps-title {
      color: #dd6b20;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
    }
.step-number {
  background: #ed8936;
  color: white;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
  line-height: 1;
  padding: 0; /* Asegura que no haya padding */
  box-sizing: border-box; /* Incluye padding y border en las dimensiones */
}
    .footer { 
      background: #2d3748; 
      color: white; 
      padding: 25px; 
      text-align: center;
    }
    .urgent {
      background: #fed7d7;
      border-left: 4px solid #e53e3e;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .contact-info {
      background: #e6fffa;
      border-left: 4px solid #38b2ac;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛎️ Proceso de Facturación</h1>
      <p>Restaurante - Mesa ${tableId}</p>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">📋 Información de la Solicitud</div>
        <div class="info-grid">
          <div>
            <strong>Correo electrónico:</strong><br>
            ${customerEmail}
          </div>
          <div>
            <strong>Mesa:</strong><br>
            ${tableId}
          </div>
          <div>
            <strong>Fecha:</strong><br>
            ${orderDate}
          </div>
          <div>
            <strong>Total de la compra:</strong><br>
            ${formatCurrency(paymentSummary?.total)}
          </div>
        </div>
      </div>

      <div class="urgent">
        <strong>⚠️ Información Importante:</strong><br>
        Para completar su factura, necesitamos que nos proporcione sus datos fiscales. 
        Este proceso debe completarse dentro de las próximas 72 horas.
      </div>

      <div class="steps">
        <div class="steps-title">📝 Pasos para Completar su Factura</div>
        
        <div class="step">
          <div class="step-number"></div>
          <div>
            <strong>Prepare sus datos fiscales:</strong><br>
            RFC, razón social, dirección fiscal, régimen fiscal y uso del CFDI.
          </div>
        </div>

        <div class="step">
          <div class="step-number"></div>
          <div>
            <strong>Envíe sus datos:</strong><br>
            Responda a este correo con la información fiscal requerida.
          </div>
        </div>

        <div class="step">
          <div class="step-number"></div>
          <div>
            <strong>Verificación:</strong><br>
            Nuestro equipo verificará la información y generará su CFDI.
          </div>
        </div>

        <div class="step">
          <div class="step-number"></div>
          <div>
            <strong>Recepción:</strong><br>
            Recibirá su factura electrónica en este mismo correo dentro de 24-48 horas.
          </div>
        </div>
      </div>

      <div class="contact-info">
        <strong>📞 ¿Necesita ayuda?</strong><br>
        • Email: facturacion@e-commetrics.com<br>
        • Horario: Lunes a Viernes 9:00 - 18:00
      </div>

      ${customerSummaries.length > 0 ? `
      <div class="summary">
        <div class="section-title">🧾 Resumen de su Consumo</div>
        
        ${customerSummaries.map(customer => `
          <div class="customer-section">
            <div class="customer-header">
              <div class="customer-name">${customer.customerName || 'Cliente'}</div>
              <div class="customer-total">${formatCurrency(customer.total)}</div>
            </div>
            ${generateItemsHTML(customer)}
          </div>
        `).join('')}

        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(paymentSummary?.subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>IVA (8%):</span>
          <span>${formatCurrency(paymentSummary?.taxAmount)}</span>
        </div>
        <div class="summary-row total-row">
          <span>TOTAL:</span>
          <span>${formatCurrency(paymentSummary?.total)}</span>
        </div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>¡Gracias por preferirnos! 🍽️</p>
      <p>Restaurante - FoodHub</p>
      <p style="font-size: 12px; opacity: 0.8; margin-top: 15px;">
        Este es un correo automático, por favor no responda a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}


app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], lang = "es" } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages requerido" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0]?.message?.content ?? "" });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Error al procesar el mensaje" });
  }
});

app.use((req, res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});
app.use((req, res) => {
  res.redirect(302, 'https://e-commetrics.com/404');
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
