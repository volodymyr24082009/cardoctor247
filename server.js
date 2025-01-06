const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const geoip = require('geoip-lite');
const app = express();
const port = 3001;

require('dotenv').config();

// Update file paths to use data directory
const DATA_DIR = path.join(__dirname, 'data');
const APPLICATION_FILE = path.join(DATA_DIR, 'application.json');
const MASTERS_FILE = path.join(DATA_DIR, 'masters.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const CURSOR_MOVEMENT_FILE = path.join(DATA_DIR, 'CursorMovement.json');

// Create data directory if it doesn't exist
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// Initialize JSON files
async function initializeFile(fileName) {
  try {
    await fs.access(fileName);
  } catch {
    await fs.writeFile(fileName, '[]', 'utf8');
  }
}

// Update the static file serving middleware
app.use(express.static(path.join(__dirname)));
app.use('/auth', express.static(path.join(__dirname, 'auth')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/profile', express.static(path.join(__dirname, 'profile')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/profile/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile', 'profile.html'));
});

// Add a catch-all route for profile subpaths
app.get('/profile/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile', 'profile.html'));
});

const fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  createParentPath: true
}));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth', 'index.html'));
});

app.get('/public', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper functions
function translateDistrict(district) {
  const districts = {
    "korolyovsky": "Корольовський(Житомир)",
    "bogunsky": "Богунський(Житомир)",
  };
  return districts[district.toLowerCase()] || district;
}

async function readJsonFile(fileName) {
  const data = await fs.readFile(fileName, 'utf8');
  return JSON.parse(data || '[]');
}

async function writeJsonFile(fileName, data) {
  await fs.writeFile(fileName, JSON.stringify(data, null, 2), 'utf8');
}

async function sendEmailNotification(applicationData) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'autolikar24.7@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    }
  });
  let mailOptions = {
    from: applicationData.email || 'autolikar24.7@gmail.com',
    to: 'autolikar24.7@gmail.com',
    subject: 'Нова заявка отримана',
    text: `
      Отримано нову заявку:
      Ім'я: ${applicationData.name || 'Не вказано'}
      Email: ${applicationData.email || 'Не вказано'}
      Телефон: ${applicationData.phone || 'Не вказано'}
      Проблема: ${applicationData.problem || 'Не вказано'}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Повідомлення про нову заявку відправлено');
    return true;
  } catch (error) {
    console.error('Помилка відправки повідомлення:', error);
    return false;
  }
}

async function logAndWriteJsonFile(fileName, data) {
  console.log(`Writing to ${fileName}:`, JSON.stringify(data, null, 2));
  try {
    await fs.writeFile(fileName, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully wrote to ${fileName}`);
  } catch (error) {
    console.error(`Error writing to ${fileName}:`, error);
    throw error;
  }
}

// Registration route
app.post('/register', async (req, res) => {
  const userData = req.body;
  console.log('Received user data:', userData);

  if (!userData.email || !userData.password) {
    return res.status(400).json({ message: 'Email та пароль обов\'язкові для заповнення.' });
  }

  if (userData.district) {
    userData.district = translateDistrict(userData.district);
  }

  const fileName = userData.type === 'master' ? MASTERS_FILE : USERS_FILE;

  try {
    const users = await readJsonFile(fileName);

    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач з такою електронною поштою вже існує.' });
    }

    // Create a new user object with the correct structure
    const newUser = {
      id: Date.now().toString(),
      fullname: userData.fullname || '',
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      district: userData.district || '',
      nickname: userData.nickname || '',
      type: userData.type,
      services: userData.type === 'master' && Array.isArray(userData.services) ? userData.services : []
    };
    console.log('Saving master with services:', newUser.services);

    users.push(newUser);
    await writeJsonFile(fileName, users);

    // Save analytics data
    const analytics = {
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: '/register',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      realIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    const geo = geoip.lookup(analytics.realIp);
    if (geo) {
      analytics.location = `${geo.city}, ${geo.country}`;
    }

    await saveAnalytics(analytics);

    // Return the created user object (without password)
    const { password, ...userWithoutPassword } = newUser;
    res.status(200).json({
      message: 'Реєстрація успішна!',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('User data:', userData);
    res.status(500).json({ 
      message: 'Помилка сервера при реєстрації',
      error: error.message 
    });
  }
});

// Submit application route
app.post('/api/submit-request', async (req, res) => {
  const applicationData = req.body;

  try {
    const applications = await readJsonFile(APPLICATION_FILE);
    applications.push(applicationData);
    await writeJsonFile(APPLICATION_FILE, applications);

    // Send email notification
    const emailSent = await sendEmailNotification(applicationData);

    if (emailSent) {
      res.status(200).json({ message: 'Заявка успішно відправлена' });
    } else {
      res.status(500).json({ error: 'Заявка збережена, але виникла помилка при відправці повідомлення' });
    }
  } catch (error) {
    console.error('Помилка при відправці заявки:', error);
    res.status(500).json({ error: 'Помилка сервера при відправці заявки' });
  }
});

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await readJsonFile(APPLICATION_FILE);
    res.status(200).json(applications);
  } catch (error) {
    console.error('Помилка при отриманні заявок:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні заявок' });
  }
});

// Update application status
app.put('/api/update-application/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const applications = await readJsonFile(APPLICATION_FILE);
    const applicationIndex = applications.findIndex(app => app.id === id);

    if (applicationIndex === -1) {
      return res.status(404).json({ error: 'Заявку не знайдено' });
    }

    applications[applicationIndex].completed = completed;
    await writeJsonFile(APPLICATION_FILE, applications);

    res.status(200).json({ message: 'Статус заявки оновлено' });
  } catch (error) {
    console.error('Помилка при оновленні статусу заявки:', error);
    res.status(500).json({ error: 'Помилка сервера при оновленні статусу заявки' });
  }
});

// Get all masters
app.get('/api/masters', async (req, res) => {
  try {
    const [masters, applications] = await Promise.all([
      readJsonFile(MASTERS_FILE),
      readJsonFile(APPLICATION_FILE)
    ]);

    // Додаємо статистику для кожного майстра
    const mastersWithStats = masters.map(master => {
      const masterApplications = applications.filter(app => app.masterId === master.id);
      return {
        ...master,
        successfulServices: masterApplications.filter(app => app.completed === true).length,
        unsuccessfulServices: masterApplications.filter(app => app.completed === false).length,
        pendingServices: masterApplications.filter(app => app.completed === undefined).length,
        totalServices: masterApplications.length
      };
    });

    res.status(200).json(mastersWithStats);
  } catch (error) {
    console.error('Помилка при отриманні списку майстрів:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні списку майстрів' });
  }
});

// Save analytics data
app.post('/api/save-analytics', async (req, res) => {
  const analyticsData = req.body;

  try {
    const analytics = await readJsonFile(ANALYTICS_FILE);
    analytics.push(analyticsData);
    await writeJsonFile(ANALYTICS_FILE, analytics);

    res.status(200).json({ message: 'Аналітичні дані збережено' });
  } catch (error) {
    console.error('Помилка при збереженні аналітичних даних:', error);
    res.status(500).json({ error: 'Помилка сервера при збереженні аналітичних даних' });
  }
});

// Save cursor movement data
app.post('/api/save-cursor-movement', async (req, res) => {
  const cursorData = req.body;

  try {
    let cursorMovements = await readJsonFile(CURSOR_MOVEMENT_FILE);
    cursorMovements = cursorMovements.concat(cursorData);
    await writeJsonFile(CURSOR_MOVEMENT_FILE, cursorMovements);

    res.status(200).json({ message: 'Дані про рух курсора збережено' });
  } catch (error) {
    console.error('Помилка при збереженні даних про рух курсора:', error);
    res.status(500).json({ error: 'Помилка сервера при збереженні даних про рух курсора' });
  }
});

// Handle avatar upload
app.post('/api/user/:id/avatar', async (req, res) => {
  const { id } = req.params;

  if (!req.files || !req.files.avatar) {
    return res.status(400).json({ error: 'Файл не завантажено' });
  }

  try {
    const avatar = req.files.avatar;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(avatar.mimetype)) {
      return res.status(400).json({ error: 'Недопустимий тип файлу. Дозволені типи: JPEG, PNG, GIF' });
    }

    // Validate file size (5MB)
    if (avatar.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Розмір файлу не повинен перевищувати 5MB' });
    }

    // Create unique filename
    const fileName = `${id}-${Date.now()}${path.extname(avatar.name)}`;
    const avatarsDir = path.join(__dirname, 'public', 'avatars');
    const uploadPath = path.join(avatarsDir, fileName);

    // Ensure avatars directory exists
    await fs.mkdir(avatarsDir, { recursive: true });

    // Move the file to uploads directory
    await avatar.mv(uploadPath);

    // Update user's avatar URL in database
    const avatarUrl = `/public/avatars/${fileName}`;

    // Read both user files
    const users = await readJsonFile(USERS_FILE);
    const masters = await readJsonFile(MASTERS_FILE);

    let updated = false;

    // Update in users file
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      users[userIndex].avatarUrl = avatarUrl;
      await writeJsonFile(USERS_FILE, users);
      updated = true;
    }

    // Update in masters file
    const masterIndex = masters.findIndex(m => m.id === id);
    if (masterIndex !== -1) {
      masters[masterIndex].avatarUrl = avatarUrl;
      await writeJsonFile(MASTERS_FILE, masters);
      updated = true;
    }

    if (!updated) {
      // Clean up uploaded file if user not found
      await fs.unlink(uploadPath);
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.status(200).json({ avatarUrl });

  } catch (error) {
    console.error('Помилка при завантаженні аватара:', error);
    res.status(500).json({ error: 'Помилка сервера при завантаженні аватара' });
  }
});

// Update user profile route
app.put('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  try {
    // Read both user files
    const users = await readJsonFile(USERS_FILE);
    const masters = await readJsonFile(MASTERS_FILE);

    // Find user in both files
    const userIndex = users.findIndex(u => u.id === id);
    const masterIndex = masters.findIndex(m => m.id === id);

    // Determine which file to update
    let fileToUpdate;
    let indexToUpdate;

    if (userData.type === 'master') {
      fileToUpdate = MASTERS_FILE;
      indexToUpdate = masterIndex;
      // If user is in users file, remove them
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        await writeJsonFile(USERS_FILE, users);
      }
    } else {
      fileToUpdate = USERS_FILE;
      indexToUpdate = userIndex;
      // If user is in masters file, remove them
      if (masterIndex !== -1) {
        masters.splice(masterIndex, 1);
        await writeJsonFile(MASTERS_FILE, masters);
      }
    }

    // Update user data
    const dataToUpdate = userData.type === 'master' ? masters : users;
    if (indexToUpdate === -1) {
      // Add new user
      userData.id = id;
      dataToUpdate.push(userData);
    } else {
      // Update existing user
      dataToUpdate[indexToUpdate] = { ...dataToUpdate[indexToUpdate], ...userData };
    }

    // Save updated data
    await writeJsonFile(fileToUpdate, dataToUpdate);

    res.status(200).json({
      message: 'Профіль оновлено успішно',
      user: userData
    });

  } catch (error) {
    console.error('Помилка при оновленні профілю:', error);
    res.status(500).json({ error: 'Помилка сервера при оновленні профілю' });
  }
});

// New function to save analytics data
async function saveAnalytics(data) {
  try {
    const analytics = await readJsonFile(ANALYTICS_FILE);
    analytics.push(data);
    await writeJsonFile(ANALYTICS_FILE, analytics);
  } catch (error) {
    console.error('Помилка при збереженні аналітичних даних:', error);
  }
}

// Add a new route to serve the masters.json file directly
app.get('/masters.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'masters.json'));
});

// Отримання всіх користувачів
app.get('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    res.status(200).json(users);
  } catch (error) {
    console.error('Помилка при отриманні списку користувачів:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні списку користувачів' });
  }
});

// Отримання аналітики
app.get('/api/analytics', async (req, res) => {
  try {
    const [users, masters, applications] = await Promise.all([
      readJsonFile(USERS_FILE),
      readJsonFile(MASTERS_FILE),
      readJsonFile(APPLICATION_FILE)
    ]);

    const analytics = {
      totalUsers: users.length,
      totalMasters: masters.length,
      successfulServices: applications.filter(app => app.completed === true).length,
      unsuccessfulServices: applications.filter(app => app.completed === false).length,
      // Додаткова аналітика
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.completed === undefined).length,
      // Аналітика по районах
      districtStats: masters.reduce((acc, master) => {
        if (master.district) {
          acc[master.district] = (acc[master.district] || 0) + 1;
        }
        return acc;
      }, {})
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Помилка при отриманні аналітики:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні аналітики' });
  }
});

// Додатковий маршрут для отримання детальної статистики по послугах
app.get('/api/services-stats', async (req, res) => {
  try {
    const applications = await readJsonFile(APPLICATION_FILE);

    const stats = {
      byMonth: {},
      byService: {},
      byDistrict: {}
    };

    applications.forEach(app => {
      // Статистика по місяцях
      const month = new Date(app.createdAt).toLocaleString('uk-UA', { month: 'long', year: 'numeric' });
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;

      // Статистика по типах послуг
      if (app.serviceType) {
        stats.byService[app.serviceType] = (stats.byService[app.serviceType] || 0) + 1;
      }

      // Статистика по районах
      if (app.district) {
        stats.byDistrict[app.district] = (stats.byDistrict[app.district] || 0) + 1;
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Помилка при отриманні статистики послуг:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні статистики послуг' });
  }
});

// Server initialization
async function startServer() {
  try {
    await ensureDataDir();
    await Promise.all([
      APPLICATION_FILE,
      MASTERS_FILE,
      USERS_FILE,
      ANALYTICS_FILE,
      CURSOR_MOVEMENT_FILE
    ].map(initializeFile));

    app.listen(port, () => {
      console.log(`Сервер запущено на http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Не вдалося запустити сервер:', error);
    process.exit(1);
  }
}

startServer();

