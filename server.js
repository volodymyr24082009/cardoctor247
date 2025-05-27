const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const geoip = require("geoip-lite");
const fileUpload = require("express-fileupload");
const cors = require("cors");

// Додаємо підтримку fetch для Node.js версій < 18
if (!global.fetch) {
  global.fetch = require("node-fetch");
}

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Шляхи до файлів даних
const DATA_DIR = path.join(__dirname, "data");
const APPLICATION_FILE = path.join(DATA_DIR, "application.json");
const MASTERS_FILE = path.join(DATA_DIR, "masters.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");

// Кеш для курсу валют
let exchangeRateCache = {
  rate: 37, // Значення за замовчуванням
  lastUpdated: null,
  ttl: 3600000, // 1 година в мілісекундах
};

// ================================
// MIDDLEWARE CONFIGURATION
// ================================

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    createParentPath: true,
  })
);

// Статичні файли
app.use(express.static(path.join(__dirname)));
app.use("/auth", express.static(path.join(__dirname, "auth")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/profile", express.static(path.join(__dirname, "profile")));

// ================================
// UTILITY FUNCTIONS
// ================================

// Створення директорії даних
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log("📁 Директорія даних створена/перевірена");
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

// Ініціалізація JSON файлів
async function initializeFile(fileName) {
  try {
    await fs.access(fileName);
    console.log(`✅ Файл ${path.basename(fileName)} існує`);
  } catch {
    await fs.writeFile(fileName, "[]", "utf8");
    console.log(`📄 Створено файл ${path.basename(fileName)}`);
  }
}

// Читання JSON файлу
async function readJsonFile(fileName) {
  try {
    const data = await fs.readFile(fileName, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error(`Помилка читання файлу ${fileName}:`, error);
    return [];
  }
}

// Запис JSON файлу
async function writeJsonFile(fileName, data) {
  try {
    await fs.writeFile(fileName, JSON.stringify(data, null, 2), "utf8");
    console.log(`💾 Дані збережено в ${path.basename(fileName)}`);
  } catch (error) {
    console.error(`Помилка запису файлу ${fileName}:`, error);
    throw error;
  }
}

// Переклад районів
function translateDistrict(district) {
  const districts = {
    korolyovsky: "Корольовський(Житомир)",
    bogunsky: "Богунський(Житомир)",
  };
  return districts[district.toLowerCase()] || district;
}

// Збереження аналітичних даних
async function saveAnalytics(data) {
  try {
    const analytics = await readJsonFile(ANALYTICS_FILE);
    analytics.push({
      ...data,
      timestamp: new Date().toISOString(),
    });
    await writeJsonFile(ANALYTICS_FILE, analytics);
  } catch (error) {
    console.error("Помилка при збереженні аналітичних даних:", error);
  }
}

// ================================
// EMAIL FUNCTIONALITY
// ================================

async function sendEmailNotification(applicationData) {
  if (!process.env.EMAIL_PASSWORD) {
    console.warn("⚠️ EMAIL_PASSWORD не встановлено, email не буде відправлено");
    return false;
  }

  try {
    let transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: "autolikar24.7@gmail.com",
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: applicationData.email || "autolikar24.7@gmail.com",
      to: "autolikar24.7@gmail.com",
      subject: "Нова заявка отримана",
      text: `
        Отримано нову заявку:
        Ім'я: ${applicationData.name || "Не вказано"}
        Email: ${applicationData.email || "Не вказано"}
        Телефон: ${applicationData.phone || "Не вказано"}
        Проблема: ${applicationData.problem || "Не вказано"}
        Район: ${applicationData.district || "Не вказано"}
        Вулиця: ${applicationData.street || "Не вказано"}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Повідомлення про нову заявку відправлено");
    return true;
  } catch (error) {
    console.error("❌ Помилка відправки повідомлення:", error);
    return false;
  }
}

// ================================
// EXCHANGE RATE FUNCTIONALITY
// ================================

// Функція для отримання курсу з API НБУ
async function fetchExchangeRateFromNBU() {
  try {
    // Формуємо дату в форматі YYYYMMDD
    const today = new Date();
    const dateString =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");

    const apiUrl = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=${dateString}&json`;

    console.log(`🔄 Запит до НБУ API: ${apiUrl}`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0 && data[0].rate) {
      const rate = parseFloat(data[0].rate);
      console.log(`💰 Отримано курс USD: ${rate} UAH`);
      return rate;
    } else {
      throw new Error("Некоректні дані від API НБУ");
    }
  } catch (error) {
    console.error("❌ Помилка отримання курсу з НБУ:", error.message);

    // Якщо не вдалося отримати курс за сьогодні, спробуємо за вчора
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString =
        yesterday.getFullYear() +
        String(yesterday.getMonth() + 1).padStart(2, "0") +
        String(yesterday.getDate()).padStart(2, "0");

      const fallbackUrl = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=${yesterdayString}&json`;
      console.log(`🔄 Спроба отримати курс за вчора: ${fallbackUrl}`);

      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();

      if (fallbackData && fallbackData.length > 0 && fallbackData[0].rate) {
        const rate = parseFloat(fallbackData[0].rate);
        console.log(`💰 Отримано курс USD за вчора: ${rate} UAH`);
        return rate;
      }
    } catch (fallbackError) {
      console.error(
        "❌ Помилка отримання курсу за вчора:",
        fallbackError.message
      );
    }

    throw error;
  }
}

// Функція для отримання курсу з кешем
async function getExchangeRate() {
  const now = Date.now();

  // Перевіряємо, чи потрібно оновити кеш
  if (
    !exchangeRateCache.lastUpdated ||
    now - exchangeRateCache.lastUpdated > exchangeRateCache.ttl
  ) {
    try {
      const newRate = await fetchExchangeRateFromNBU();
      exchangeRateCache = {
        rate: newRate,
        lastUpdated: now,
        ttl: 3600000, // 1 година
      };
      console.log("🔄 Кеш курсу валют оновлено");
    } catch (error) {
      console.log("⚠️ Використовується збережений курс з кешу");
    }
  }

  return exchangeRateCache.rate;
}

// ================================
// ROUTES - STATIC PAGES
// ================================

// Головна сторінка калькулятора
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "CalculatingClearance.html"));
});

app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "auth", "index.html"));
});

app.get("/public", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/profile/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "profile", "profile.html"));
});

app.get("/profile/*", (req, res) => {
  res.sendFile(path.join(__dirname, "profile", "profile.html"));
});

app.get("/masters.json", (req, res) => {
  res.sendFile(path.join(DATA_DIR, "masters.json"));
});

// ================================
// API ROUTES - EXCHANGE RATE
// ================================

// API ендпоінт для отримання курсу валют
app.get("/api/exchange-rate", async (req, res) => {
  try {
    const rate = await getExchangeRate();

    res.json({
      success: true,
      rate: rate,
      lastUpdated: new Date(exchangeRateCache.lastUpdated).toISOString(),
      source: "НБУ",
    });
  } catch (error) {
    console.error("❌ Помилка API курсу валют:", error);

    res.status(500).json({
      success: false,
      message: "Помилка отримання курсу валют",
      rate: exchangeRateCache.rate, // Повертаємо кешований курс
      error: error.message,
    });
  }
});

// API ендпоінт для отримання інформації про сервер
app.get("/api/status", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    exchangeRate: {
      current: exchangeRateCache.rate,
      lastUpdated: exchangeRateCache.lastUpdated
        ? new Date(exchangeRateCache.lastUpdated).toISOString()
        : null,
    },
  });
});

// ================================
// API ROUTES - USER MANAGEMENT
// ================================

// Реєстрація користувачів
app.post("/register", async (req, res) => {
  const userData = req.body;
  console.log("📝 Отримано дані користувача:", userData);

  if (!userData.email || !userData.password) {
    return res.status(400).json({
      message: "Email та пароль обов'язкові для заповнення.",
    });
  }

  if (userData.district) {
    userData.district = translateDistrict(userData.district);
  }

  const fileName = userData.type === "master" ? MASTERS_FILE : USERS_FILE;

  try {
    const users = await readJsonFile(fileName);

    const existingUser = users.find((user) => user.email === userData.email);
    if (existingUser) {
      return res.status(400).json({
        message: "Користувач з такою електронною поштою вже існує.",
      });
    }

    // Створюємо нового користувача
    const newUser = {
      id: Date.now().toString(),
      fullname: userData.fullname || "",
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "",
      district: userData.district || "",
      nickname: userData.nickname || "",
      type: userData.type,
      services:
        userData.type === "master" && Array.isArray(userData.services)
          ? userData.services
          : [],
      createdAt: new Date().toISOString(),
    };

    console.log("💾 Збереження користувача з послугами:", newUser.services);

    users.push(newUser);
    await writeJsonFile(fileName, users);

    // Збереження аналітичних даних
    const analytics = {
      method: "POST",
      url: "/register",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      realIp: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    };

    const geo = geoip.lookup(analytics.realIp);
    if (geo) {
      analytics.location = `${geo.city}, ${geo.country}`;
    }

    await saveAnalytics(analytics);

    // Повертаємо користувача без пароля
    const { password, ...userWithoutPassword } = newUser;
    res.status(200).json({
      message: "Реєстрація успішна!",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Помилка реєстрації:", error);
    res.status(500).json({
      message: "Помилка сервера при реєстрації",
      error: error.message,
    });
  }
});

// Оновлення профілю користувача
app.put("/api/user/:id", async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  try {
    const users = await readJsonFile(USERS_FILE);
    const masters = await readJsonFile(MASTERS_FILE);

    const userIndex = users.findIndex((u) => u.id === id);
    const masterIndex = masters.findIndex((m) => m.id === id);

    let fileToUpdate;
    let indexToUpdate;

    if (userData.type === "master") {
      fileToUpdate = MASTERS_FILE;
      indexToUpdate = masterIndex;
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        await writeJsonFile(USERS_FILE, users);
      }
    } else {
      fileToUpdate = USERS_FILE;
      indexToUpdate = userIndex;
      if (masterIndex !== -1) {
        masters.splice(masterIndex, 1);
        await writeJsonFile(MASTERS_FILE, masters);
      }
    }

    const dataToUpdate = userData.type === "master" ? masters : users;
    if (indexToUpdate === -1) {
      userData.id = id;
      userData.updatedAt = new Date().toISOString();
      dataToUpdate.push(userData);
    } else {
      dataToUpdate[indexToUpdate] = {
        ...dataToUpdate[indexToUpdate],
        ...userData,
        updatedAt: new Date().toISOString(),
      };
    }

    await writeJsonFile(fileToUpdate, dataToUpdate);

    res.status(200).json({
      message: "Профіль оновлено успішно",
      user: userData,
    });
  } catch (error) {
    console.error("❌ Помилка при оновленні профілю:", error);
    res.status(500).json({ error: "Помилка сервера при оновленні профілю" });
  }
});

// Завантаження аватара
app.post("/api/user/:id/avatar", async (req, res) => {
  const { id } = req.params;

  if (!req.files || !req.files.avatar) {
    return res.status(400).json({ error: "Файл не завантажено" });
  }

  try {
    const avatar = req.files.avatar;

    // Валідація типу файлу
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(avatar.mimetype)) {
      return res.status(400).json({
        error: "Недопустимий тип файлу. Дозволені типи: JPEG, PNG, GIF",
      });
    }

    // Валідація розміру файлу (5MB)
    if (avatar.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: "Розмір файлу не повинен перевищувати 5MB",
      });
    }

    // Створюємо унікальне ім'я файлу
    const fileName = `${id}-${Date.now()}${path.extname(avatar.name)}`;
    const avatarsDir = path.join(__dirname, "public", "avatars");
    const uploadPath = path.join(avatarsDir, fileName);

    // Створюємо директорію для аватарів
    await fs.mkdir(avatarsDir, { recursive: true });

    // Переміщуємо файл
    await avatar.mv(uploadPath);

    // Оновлюємо URL аватара в базі даних
    const avatarUrl = `/public/avatars/${fileName}`;

    const users = await readJsonFile(USERS_FILE);
    const masters = await readJsonFile(MASTERS_FILE);

    let updated = false;

    // Оновлюємо в файлі користувачів
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      users[userIndex].avatarUrl = avatarUrl;
      users[userIndex].updatedAt = new Date().toISOString();
      await writeJsonFile(USERS_FILE, users);
      updated = true;
    }

    // Оновлюємо в файлі майстрів
    const masterIndex = masters.findIndex((m) => m.id === id);
    if (masterIndex !== -1) {
      masters[masterIndex].avatarUrl = avatarUrl;
      masters[masterIndex].updatedAt = new Date().toISOString();
      await writeJsonFile(MASTERS_FILE, masters);
      updated = true;
    }

    if (!updated) {
      await fs.unlink(uploadPath);
      return res.status(404).json({ error: "Користувача не знайдено" });
    }

    res.status(200).json({ avatarUrl });
  } catch (error) {
    console.error("❌ Помилка при завантаженні аватара:", error);
    res.status(500).json({ error: "Помилка сервера при завантаженні аватара" });
  }
});

// ================================
// API ROUTES - APPLICATIONS
// ================================

// Подача заявки
app.post("/api/submit-request", async (req, res) => {
  const applicationData = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    completed: undefined,
  };

  try {
    const applications = await readJsonFile(APPLICATION_FILE);
    applications.push(applicationData);
    await writeJsonFile(APPLICATION_FILE, applications);

    // Відправка email повідомлення
    const emailSent = await sendEmailNotification(applicationData);

    if (emailSent) {
      res.status(200).json({ message: "Заявка успішно відправлена" });
    } else {
      res.status(200).json({
        message:
          "Заявка збережена, але виникла помилка при відправці повідомлення",
      });
    }
  } catch (error) {
    console.error("❌ Помилка при відправці заявки:", error);
    res.status(500).json({ error: "Помилка сервера при відправці заявки" });
  }
});

// Отримання всіх заявок
app.get("/api/applications", async (req, res) => {
  try {
    const applications = await readJsonFile(APPLICATION_FILE);
    res.status(200).json(applications);
  } catch (error) {
    console.error("❌ Помилка при отриманні заявок:", error);
    res.status(500).json({ error: "Помилка сервера при отриманні заявок" });
  }
});

// Оновлення статусу заявки
app.put("/api/update-application/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const applications = await readJsonFile(APPLICATION_FILE);
    const applicationIndex = applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return res.status(404).json({ error: "Заявку не знайдено" });
    }

    applications[applicationIndex].completed = completed;
    applications[applicationIndex].updatedAt = new Date().toISOString();
    await writeJsonFile(APPLICATION_FILE, applications);

    res.status(200).json({ message: "Статус заявки оновлено" });
  } catch (error) {
    console.error("❌ Помилка при оновленні статусу заявки:", error);
    res
      .status(500)
      .json({ error: "Помилка сервера при оновленні статусу заявки" });
  }
});

// ================================
// API ROUTES - DATA RETRIEVAL
// ================================

// Отримання всіх майстрів
app.get("/api/masters", async (req, res) => {
  try {
    const [masters, applications] = await Promise.all([
      readJsonFile(MASTERS_FILE),
      readJsonFile(APPLICATION_FILE),
    ]);

    const mastersWithStats = masters.map((master) => {
      const masterApplications = applications.filter(
        (app) => app.masterId === master.id
      );
      return {
        ...master,
        successfulServices: masterApplications.filter(
          (app) => app.completed === true
        ).length,
        unsuccessfulServices: masterApplications.filter(
          (app) => app.completed === false
        ).length,
        pendingServices: masterApplications.filter(
          (app) => app.completed === undefined
        ).length,
        totalServices: masterApplications.length,
      };
    });

    res.status(200).json(mastersWithStats);
  } catch (error) {
    console.error("❌ Помилка при отриманні списку майстрів:", error);
    res
      .status(500)
      .json({ error: "Помилка сервера при отриманні списку майстрів" });
  }
});

// Отримання всіх користувачів
app.get("/api/users", async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Помилка при отриманні списку користувачів:", error);
    res
      .status(500)
      .json({ error: "Помилка сервера при отриманні списку користувачів" });
  }
});

// ================================
// API ROUTES - ANALYTICS
// ================================

// Збереження аналітичних даних
app.post("/api/save-analytics", async (req, res) => {
  const analyticsData = req.body;

  try {
    await saveAnalytics(analyticsData);
    res.status(200).json({ message: "Аналітичні дані збережено" });
  } catch (error) {
    console.error("❌ Помилка при збереженні аналітичних даних:", error);
    res
      .status(500)
      .json({ error: "Помилка сервера при збереженні аналітичних даних" });
  }
});

// Отримання аналітики
app.get("/api/analytics", async (req, res) => {
  try {
    const [users, masters, applications] = await Promise.all([
      readJsonFile(USERS_FILE),
      readJsonFile(MASTERS_FILE),
      readJsonFile(APPLICATION_FILE),
    ]);

    const analytics = {
      totalUsers: users.length,
      totalMasters: masters.length,
      successfulServices: applications.filter((app) => app.completed === true)
        .length,
      unsuccessfulServices: applications.filter(
        (app) => app.completed === false
      ).length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(
        (app) => app.completed === undefined
      ).length,
      districtStats: masters.reduce((acc, master) => {
        if (master.district) {
          acc[master.district] = (acc[master.district] || 0) + 1;
        }
        return acc;
      }, {}),
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error("❌ Помилка при отриманні аналітики:", error);
    res.status(500).json({ error: "Помилка сервера при отриманні аналітики" });
  }
});

// Статистика послуг
app.get("/api/services-stats", async (req, res) => {
  try {
    const applications = await readJsonFile(APPLICATION_FILE);

    const stats = {
      byMonth: {},
      byService: {},
      byDistrict: {},
    };

    applications.forEach((app) => {
      // Статистика по місяцях
      const month = new Date(app.createdAt).toLocaleString("uk-UA", {
        month: "long",
        year: "numeric",
      });
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;

      // Статистика по типах послуг
      if (app.serviceType) {
        stats.byService[app.serviceType] =
          (stats.byService[app.serviceType] || 0) + 1;
      }

      // Статистика по районах
      if (app.district) {
        stats.byDistrict[app.district] =
          (stats.byDistrict[app.district] || 0) + 1;
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Помилка при отриманні статистики послуг:", error);
    res
      .status(500)
      .json({ error: "Помилка сервера при отриманні статистики послуг" });
  }
});

// ================================
// ERROR HANDLING
// ================================

// Обробка 404
app.use((req, res) => {
  res.status(404).json({
    error: "Сторінку не знайдено",
    path: req.path,
  });
});

// Обробка помилок
app.use((error, req, res, next) => {
  console.error("❌ Помилка сервера:", error);
  res.status(500).json({
    error: "Внутрішня помилка сервера",
    message: error.message,
  });
});

// ================================
// SERVER INITIALIZATION
// ================================

async function startServer() {
  try {
    console.log("🚀 Ініціалізація сервера...");

    // Створюємо необхідні директорії та файли
    await ensureDataDir();
    await Promise.all(
      [APPLICATION_FILE, MASTERS_FILE, USERS_FILE, ANALYTICS_FILE].map(
        initializeFile
      )
    );

    // Ініціалізуємо курс валют
    try {
      const rate = await getExchangeRate();
      console.log(`💰 Поточний курс USD: ${rate} UAH`);
    } catch (error) {
      console.log(`⚠️ Помилка ініціалізації курсу: ${error.message}`);
    }

    // Запускаємо сервер
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущено на порту ${PORT}`);
      console.log(`📱 Відкрийте http://localhost:${PORT} у браузері`);
      console.log(`📊 API доступне за адресою http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error("❌ Не вдалося запустити сервер:", error);
    process.exit(1);
  }
}

// ================================
// GRACEFUL SHUTDOWN
// ================================

process.on("SIGTERM", () => {
  console.log("🛑 Отримано сигнал SIGTERM, завершення роботи...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Отримано сигнал SIGINT, завершення роботи...");
  process.exit(0);
});

// Запуск сервера
startServer();

module.exports = app;
