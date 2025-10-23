const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPER_ADMIN_ID = parseInt(process.env.SUPER_ADMIN_ID);
const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL || 'https://railway-proxy-server-production-58a1.up.railway.app';

// Конфигурация PROXY6
const PROXY6_CONFIG = {
    API_KEY: process.env.PROXY6_API_KEY,
    BASE_URL: 'https://proxy6.net/api'
};

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Файлы конфигурации
const CLIENTS_FILE = path.join(__dirname, 'clients.json');
const ADMINS_FILE = path.join(__dirname, 'admins.json');

// Загрузка конфигураций
let clients = {}; // Структура: { adminId: { clientName: { password, proxies, proxy6_order_id, proxy_expires_at } } }
let admins = [];

// Клавиатура для всех админов
const adminKeyboard = {
    reply_markup: {
        keyboard: [
            [
                { text: '👤 Добавить клиента' },
                { text: '🛒 Добавить с покупкой' }
            ],
            [
                { text: '🗑️ Удалить клиента' },
                { text: '📋 Мои клиенты' }
            ],
            [
                { text: '➕ Добавить прокси' },
                { text: '🌐 Текущий прокси' }
            ],
            [
                { text: '🌍 Мой IP' },
                { text: '📥 Добавить клиента с прокси' }
            ],
            [
                { text: '🛍 Купить прокси клиенту' } // NEW
            ],
            [
                { text: '🔄 Синхронизация' }
            ]
        ],
        resize_keyboard: true,
        persistent: true
    }
};

// Клавиатура для супер-админа (с дополнительными кнопками)
const superAdminKeyboard = {
    reply_markup: {
        keyboard: [
            [
                { text: '👤 Добавить клиента' },
                { text: '🛒 Добавить с покупкой' }
            ],
            [
                { text: '🗑️ Удалить клиента' },
                { text: '📋 Все клиенты' }
            ],
            [
                { text: '➕ Добавить прокси' },
                { text: '🌐 Текущий прокси' }
            ],
            [
                { text: '🌍 Мой IP' },
                { text: '📥 Добавить клиента с прокси' }
            ],
            [
                { text: '🛍 Купить прокси клиенту' } // NEW
            ],
            [
                { text: '🔄 Синхронизация' },
                { text: '👥 Управление админами' }
            ],
            [
                { text: '💰 Проверка баланса' }
            ]
        ],
        resize_keyboard: true,
        persistent: true
    }
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С PROXY6 API =====

// Функция для проверки баланса PROXY6
async function checkProxy6Balance() {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return {
                success: false,
                error: 'API ключ PROXY6 не настроен'
            };
        }

        const response = await axios.get(`${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}`, {
            timeout: 10000
        });
        
        if (response.data.status === 'yes') {
            return {
                success: true,
                balance: response.data.balance,
                currency: response.data.currency,
                user_id: response.data.user_id
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Неизвестная ошибка'
            };
        }
    } catch (error) {
        console.error('Ошибка при проверке баланса PROXY6:', error);
        return {
            success: false,
            error: 'Ошибка соединения с PROXY6'
        };
    }
}

// Функция для получения цены прокси
async function getProxy6Price(count = 1, period = 7, version = 3) {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return {
                success: false,
                error: 'API ключ PROXY6 не настроен'
            };
        }

        const response = await axios.get(
            `${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}/getprice?count=${count}&period=${period}&version=${version}`,
            { timeout: 10000 }
        );
        
        if (response.data.status === 'yes') {
            return {
                success: true,
                price: response.data.price,
                price_single: response.data.price_single,
                period: response.data.period,
                count: response.data.count,
                balance: response.data.balance,
                currency: response.data.currency
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Ошибка получения цены'
            };
        }
    } catch (error) {
        console.error('Ошибка при получении цены PROXY6:', error);
        return {
            success: false,
            error: 'Ошибка соединения с PROXY6'
        };
    }
}

// Функция для покупки прокси
async function buyProxy6(count = 3, period = 7, country = 'ru', version = 3, descr = '') {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return {
                success: false,
                error: 'API ключ PROXY6 не настроен'
            };
        }

        const response = await axios.get(
            `${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}/buy?count=${count}&period=${period}&country=${country}&version=${version}&descr=${encodeURIComponent(descr)}`,
            { timeout: 15000 }
        );
        
        if (response.data.status === 'yes') {
            return {
                success: true,
                order_id: response.data.order_id,
                count: response.data.count,
                price: response.data.price,
                period: response.data.period,
                country: response.data.country,
                balance: response.data.balance,
                currency: response.data.currency,
                proxies: response.data.list
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Ошибка покупки прокси',
                error_id: response.data.error_id
            };
        }
    } catch (error) {
        console.error('Ошибка при покупке прокси PROXY6:', error);
        return {
            success: false,
            error: 'Ошибка соединения с PROXY6'
        };
    }
}

// Функция для форматирования прокси из PROXY6 в нужный формат
function formatProxiesFromProxy6(proxies) {
    const formattedProxies = [];
    
    for (const proxyId in proxies) {
        const proxy = proxies[proxyId];
        // Формат: host:port:user:pass
        formattedProxies.push(`${proxy.host}:${proxy.port}:${proxy.user}:${proxy.pass}`);
    }
    
    return formattedProxies;
}

// ===== ОСНОВНЫЕ ФУНКЦИИ БОТА =====

function loadClients() {
    try {
        if (fs.existsSync(CLIENTS_FILE)) {
            const data = fs.readFileSync(CLIENTS_FILE, 'utf8');
            clients = JSON.parse(data);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки клиентов:', error);
        clients = {};
    }
}

function saveClients() {
    try {
        fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
        console.log('💾 Конфигурация клиентов сохранена');
    } catch (error) {
        console.error('❌ Ошибка сохранения клиентов:', error);
    }
}

function loadAdmins() {
    try {
        if (fs.existsSync(ADMINS_FILE)) {
            const data = fs.readFileSync(ADMINS_FILE, 'utf8');
            admins = JSON.parse(data);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки админов:', error);
        admins = [];
    }
}

function saveAdmins() {
    try {
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2));
        console.log('💾 Конфигурация админов сохранена');
    } catch (error) {
        console.error('❌ Ошибка сохранения админов:', error);
    }
}

// Функции для работы с клиентами по админам
function getAdminClients(adminId) {
    if (!clients[adminId]) {
        clients[adminId] = {};
    }
    return clients[adminId];
}

function getAllClients() {
    const allClients = {};
    for (const [adminId, adminClients] of Object.entries(clients)) {
        for (const [clientName, clientData] of Object.entries(adminClients)) {
            allClients[`${clientName}_${adminId}`] = {
                ...clientData,
                adminId: adminId,
                originalName: clientName
            };
        }
    }
    return allClients;
}

function findClientByName(clientName, adminId = null) {
    if (adminId) {
        // Ищем у конкретного админа
        const adminClients = getAdminClients(adminId);
        if (adminClients[clientName]) {
            return {
                client: adminClients[clientName],
                adminId: adminId,
                clientName: clientName
            };
        }
    } else {
        // Ищем у всех админов (для супер-админа)
        for (const [aId, adminClients] of Object.entries(clients)) {
            if (adminClients[clientName]) {
                return {
                    client: adminClients[clientName],
                    adminId: aId,
                    clientName: clientName
                };
            }
        }
    }
    return null;
}

// Функции работы с прокси сервером
async function makeProxyServerRequest(endpoint, method = 'GET', data = null, auth = null) {
    try {
        const config = {
            method: method,
            url: `${PROXY_SERVER_URL}${endpoint}`,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (auth) {
            config.auth = auth;
        }

        if (data && method !== 'GET') {
            config.data = data;
        }

        console.log(`🌐 Запрос к прокси серверу: ${method} ${config.url}`);
        if (data) console.log('📤 Данные:', data);

        const response = await axios(config);
        console.log('✅ Успешный ответ сервера');
        return response.data;
    } catch (error) {
        console.error('❌ Ошибка запроса к прокси серверу:', error.message);
        if (error.response) {
            console.error('📥 Ответ с ошибкой:', error.response.data);
        }
        throw error;
    }
}

// Исправленная функция удаления клиента
async function deleteClientFromServer(clientName) {
    try {
        console.log(`🌐 Запрос к прокси серверу: DELETE ${PROXY_SERVER_URL}/api/delete-client/${clientName}`);

        const response = await axios.delete(`${PROXY_SERVER_URL}/api/delete-client/${clientName}`, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('✅ Клиент успешно удален с сервера');
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Ошибка удаления клиента с сервера:', error.message);
        if (error.response) {
            console.log('📥 Ответ с ошибкой:', error.response.data);
            // Если клиент не найден на сервере (404), это не критическая ошибка
            if (error.response.status === 404) {
                console.log('ℹ️ Клиент уже отсутствует на сервере');
                return { success: true, data: { message: 'Client not found on server' } };
            }
        }
        return { success: false, error: error.message };
    }
}

async function getCurrentProxy(clientName, password) {
    try {
        const auth = {
            username: clientName,
            password: password
        };

        const response = await makeProxyServerRequest(`/current`, 'GET', null, auth);
        return response;
    } catch (error) {
        throw new Error(`Ошибка получения текущего прокси: ${error.message}`);
    }
}

async function getMyIP(clientName, password) {
    try {
        const auth = {
            username: clientName,
            password: password
        };

        const response = await makeProxyServerRequest(`/myip`, 'GET', null, auth);
        return response;
    } catch (error) {
        throw new Error(`Ошибка получения IP: ${error.message}`);
    }
}

// Новая функция синхронизации всех клиентов с сервером
async function syncAllClientsToServer(adminId = null) {
    const results = {
        success: 0,
        failed: 0,
        errors: []
    };

    const clientsToSync = adminId ? { [adminId]: getAdminClients(adminId) } : clients;

    for (const [aId, adminClients] of Object.entries(clientsToSync)) {
        for (const [clientName, clientData] of Object.entries(adminClients)) {
            try {
                console.log(`🔄 Синхронизация клиента ${clientName} (Admin: ${aId})`);
                
                await makeProxyServerRequest('/api/add-client', 'POST', {
                    clientName: clientName,
                    password: clientData.password,
                    proxies: clientData.proxies.map(formatProxyForRailway)
                });

                console.log(`✅ Клиент ${clientName} успешно синхронизирован`);
                results.success++;
            } catch (error) {
                console.error(`❌ Ошибка синхронизации клиента ${clientName}:`, error.message);
                results.failed++;
                results.errors.push(`${clientName}: ${error.message}`);
            }
        }
    }

    return results;
}

// Проверка авторизации
function isAuthorized(userId) {
    return userId === SUPER_ADMIN_ID || admins.includes(userId);
}

function isSuperAdmin(userId) {
    return userId === SUPER_ADMIN_ID;
}

// Функция для отправки клавиатуры
function getKeyboardForUser(userId) {
    return isSuperAdmin(userId) ? superAdminKeyboard : adminKeyboard;
}

// Состояния пользователей
const userStates = {};

// ===== ОБРАБОТЧИКИ ДЛЯ ПОКУПКИ ПРОКСИ =====

// Обработчик для кнопки "Добавить с покупкой"
async function handleAddUserWithPurchase(chatId, userId) {
    try {
        // Проверяем права админа
        if (!isAuthorized(userId)) {
            await bot.sendMessage(chatId, '❌ У вас нет прав для выполнения этой операции.');
            return;
        }

        // Проверяем баланс PROXY6
        const balanceCheck = await checkProxy6Balance();
        if (!balanceCheck.success) {
            await bot.sendMessage(chatId, `❌ Ошибка подключения к PROXY6: ${balanceCheck.error}`);
            return;
        }

        // Получаем цену на 3 прокси на 7 дней (оставлено как в исходной логике)
        const priceCheck = await getProxy6Price(3, 7, 3);
        if (!priceCheck.success) {
            await bot.sendMessage(chatId, `❌ Ошибка получения цены: ${priceCheck.error}`);
            return;
        }

        // Проверяем достаточность средств
        if (parseFloat(balanceCheck.balance) < priceCheck.price) {
            await bot.sendMessage(chatId, 
                `❌ Недостаточно средств на балансе PROXY6!\n\n` +
                `💰 Текущий баланс: ${balanceCheck.balance} ${balanceCheck.currency}\n` +
                `💸 Необходимо: ${priceCheck.price} ${priceCheck.currency}\n` +
                `📊 Цена за 20 shared прокси на 7 дней`
            );
            return;
        }

        // Устанавливаем состояние ожидания данных пользователя
        userStates[userId] = {
            action: 'add_user_with_purchase',
            adminId: userId,
            step: 'waiting_username'
        };

        await bot.sendMessage(chatId, 
            `✅ Готов к покупке прокси!\n\n` +
            `💰 Баланс PROXY6: ${balanceCheck.balance} ${balanceCheck.currency}\n` +
            `💸 Стоимость: ${priceCheck.price} ${priceCheck.currency}\n` +
            `📦 Количество: 20 shared прокси на 7 дней\n\n` +
            `👤 Введите логин для нового клиента:`
        );

    } catch (error) {
        console.error('Ошибка в handleAddUserWithPurchase:', error);
        await bot.sendMessage(chatId, '❌ Произошла ошибка при подготовке к покупке прокси.');
    }
}

// Функция для создания пользователя с автоматической покупкой прокси
async function createUserWithProxyPurchase(userData) {
    try {
        // 1. Сначала покупаем прокси
        const purchaseResult = await buyProxy6(
            1, // количество
            7, // период в днях
            'ru', // страна
            3, // IPv4 Shared
            `user_${userData.username}` // комментарий
        );
        
        if (!purchaseResult.success) {
            return {
                success: false,
                error: `Ошибка покупки прокси: ${purchaseResult.error}`
            };
        }

        // 2. Форматируем прокси для сервера
        const formattedProxies = formatProxiesFromProxy6(purchaseResult.proxies);
        
        // 3. Создаем пользователя с прокси
        const adminClients = getAdminClients(userData.adminId);
        adminClients[userData.username] = {
            password: userData.password,
            proxies: formattedProxies,
            proxy6_order_id: purchaseResult.order_id,
            proxy6_descr: `user_${userData.username}`,
            created_at: new Date().toISOString(),
            proxy_expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 дней
        };
        
        saveClients();
        
        return {
            success: true,
            user: adminClients[userData.username],
            username: userData.username,
            purchase_info: {
                order_id: purchaseResult.order_id,
                price: purchaseResult.price,
                count: purchaseResult.count,
                period: purchaseResult.period,
                balance_remaining: purchaseResult.balance
            }
        };
        
    } catch (error) {
        console.error('Ошибка при создании пользователя с покупкой прокси:', error);
        return {
            success: false,
            error: 'Ошибка создания пользователя'
        };
    }
}

// Покупка прокси для существующего клиента (NEW)
async function buyProxiesForExistingClient({ adminId, clientName, count = 1, period = 7, country = 'ru', version = 3 }) {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return { success: false, error: 'API ключ PROXY6 не настроен' };
        }

        // 1) Покупаем прокси
        const purchaseResult = await buyProxy6(count, period, country, version, `user_${clientName}`);
        if (!purchaseResult.success) {
            return { success: false, error: `Ошибка покупки прокси: ${purchaseResult.error}` };
        }

        // 2) Форматируем прокси
        const formattedProxies = formatProxiesFromProxy6(purchaseResult.proxies);

        // 3) Обновляем клиента локально
        const adminClients = getAdminClients(adminId);
        if (!adminClients[clientName]) {
            return { success: false, error: `Клиент ${clientName} не найден` };
        }

        if (!Array.isArray(adminClients[clientName].proxies)) {
            adminClients[clientName].proxies = [];
        }

        adminClients[clientName].proxies.push(...formattedProxies);
        adminClients[clientName].proxy6_order_id = purchaseResult.order_id;
        adminClients[clientName].proxy6_descr = `user_${clientName}`;
        adminClients[clientName].proxy_expires_at = new Date(Date.now() + (period * 24 * 60 * 60 * 1000)).toISOString();

        saveClients();

        // 4) Отправляем новые прокси на прокси-сервер
        try {
            await makeProxyServerRequest('/api/add-proxy', 'POST', {
                name: clientName,
                proxies: formattedProxies.map(formatProxyForRailway)
            });
        } catch (err) {
            console.error('❌ Ошибка добавления купленных прокси на сервер:', err.message);
            // Локально уже сохранено, не падаем
        }

        return {
            success: true,
            clientName,
            adminId,
            addedCount: formattedProxies.length,
            purchase_info: {
                order_id: purchaseResult.order_id,
                price: purchaseResult.price,
                count: purchaseResult.count,
                period: purchaseResult.period,
                balance_remaining: purchaseResult.balance,
                currency: purchaseResult.currency
            }
        };
    } catch (error) {
        console.error('Ошибка в buyProxiesForExistingClient:', error);
        return { success: false, error: 'Внутренняя ошибка при покупке прокси' };
    }
}

// Обработчик подтверждения покупки нового клиента
async function handleConfirmPurchase(chatId, userId) {
    const userState = userStates[userId];
    if (!userState || userState.action !== 'add_user_with_purchase') {
        await bot.sendMessage(chatId, '❌ Сессия истекла. Начните заново.');
        return;
    }

    try {
        await bot.sendMessage(chatId, '⏳ Покупаю прокси и создаю клиента...');

        // Создаем пользователя с автоматической покупкой прокси
        const result = await createUserWithProxyPurchase({
            username: userState.username,
            password: userState.password,
            adminId: userState.adminId
        });

        if (result.success) {
            const purchaseInfo = result.purchase_info;
            const proxiesText = result.user.proxies.map((proxy, index) => 
                `${index + 1}. ${proxy}`
            ).join('\n');

            // Добавляем клиента на прокси сервер
            try {
                await makeProxyServerRequest('/api/add-client', 'POST', {
                    clientName: result.username,
                    password: result.user.password,
                    proxies: result.user.proxies.map(formatProxyForRailway)
                });
                console.log(`✅ Клиент ${result.username} успешно добавлен на прокси сервер`);
            } catch (error) {
                console.error('❌ Ошибка добавления клиента на прокси сервер:', error);
            }

            await bot.sendMessage(chatId, 
                `✅ Клиент успешно создан и прокси куплены!\n\n` +
                `👤 Логин: ${result.username}\n` +
                `🔐 Пароль: ${result.user.password}\n\n` +
                `📦 Купленные прокси:\n${proxiesText}\n\n` +
                `💰 Информация о покупке:\n` +
                `🆔 Заказ: ${purchaseInfo.order_id}\n` +
                `💸 Стоимость: ${purchaseInfo.price} RUB\n` +
                `📊 Количество: ${purchaseInfo.count} прокси\n` +
                `⏰ Период: ${purchaseInfo.period} дней\n` +
                `💳 Остаток баланса: ${purchaseInfo.balance_remaining} RUB`,
                getKeyboardForUser(userId)
            );

        } else {
            await bot.sendMessage(chatId, `❌ Ошибка создания клиента: ${result.error}`, getKeyboardForUser(userId));
        }

    } catch (error) {
        console.error('Ошибка в handleConfirmPurchase:', error);
        await bot.sendMessage(chatId, '❌ Произошла ошибка при создании клиента.', getKeyboardForUser(userId));
    } finally {
        // Очищаем состояние
        delete userStates[userId];
    }
}

// ===== ОСНОВНЫЕ ОБРАБОТЧИКИ СООБЩЕНИЙ =====

// Обработка сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    const username = msg.from.username || 'Unknown';

    // Проверка авторизации
    if (!isAuthorized(userId)) {
        await bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту');
        return;
    }

    // Проверка супер-админа
    const superAdmin = isSuperAdmin(userId);

    // Обработка команд и кнопок
    if (text === '/start') {
        const welcomeMessage = `🚀 Добро пожаловать в Proxy Manager Bot!

👤 Ваша роль: ${superAdmin ? 'Супер-админ (видите всех клиентов)' : 'Админ (видите только своих клиентов)'}

🎯 Используйте кнопки ниже для управления клиентами и прокси!

🆕 Функции:
• 🛒 Добавить с покупкой - автоматическая покупка прокси
• 📥 Добавить клиента с прокси - добавление без покупки
• 🔄 Синхронизация - восстановление клиентов на сервере
• 💰 Проверка баланса - баланс PROXY6 (только супер-админ)`;

        await bot.sendMessage(chatId, welcomeMessage, getKeyboardForUser(userId));
        return;
    }

    // Новая команда: Добавить клиента с покупкой прокси
    if (text === '🛒 Добавить с покупкой' || text === '/addclientwithpurchase') {
        console.log(`🛒 Команда добавления клиента с покупкой от userId=${userId}`);
        await handleAddUserWithPurchase(chatId, userId);
        return;
    }

    // Новая команда: Купить прокси для существующего клиента (NEW)
    if (text === '🛍 Купить прокси клиенту' || text === '/buy-proxy') {
        console.log(`🛍 Команда покупки прокси для клиента от userId=${userId}`);

        // Проверяем права
        if (!isAuthorized(userId)) {
            await bot.sendMessage(chatId, '❌ У вас нет прав для выполнения этой операции.');
            return;
        }

        // Проверяем наличие клиентов (или всех, если супер-админ)
        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);

        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '❌ Нет клиентов для покупки прокси');
            return;
        }

        userStates[userId] = { action: 'buying_proxy', step: 'waiting_client_name' };

        let message = `🛍 Покупка прокси для клиента

Отправьте имя клиента, которому нужно купить 20 shared прокси на 7 дней.

📋 Доступные клиенты:\n`;

        for (const [name, client] of Object.entries(adminClients)) {
            const displayName = superAdmin && client.originalName
                ? `${client.originalName} (Admin: ${client.adminId})`
                : name;
            const proxyCount = client.proxies ? client.proxies.length : 0;
            message += `• ${displayName} (${proxyCount} прокси)\n`;
        }

        await bot.sendMessage(chatId, message);
        return;
    }

    // Команда проверки баланса (только для супер-админа)
    if (text === '💰 Проверка баланса' || text === '/proxy6-balance') {
        console.log(`💰 Команда /proxy6-balance от userId=${userId}`);

        if (!superAdmin) {
            await bot.sendMessage(chatId, '❌ Эта команда доступна только супер-админу');
            return;
        }

        if (!PROXY6_CONFIG.API_KEY) {
            await bot.sendMessage(chatId, '❌ API ключ PROXY6.net не настроен');
            return;
        }

        await bot.sendMessage(chatId, '⏳ Проверяю баланс PROXY6...');

        const balanceResult = await checkProxy6Balance();
        
        if (balanceResult.success) {
            // Получаем также цену на стандартный заказ для справки
            const priceResult = await getProxy6Price(3, 7, 3);
            
            let message = `💰 Баланс PROXY6:\n\n` +
                         `💳 Текущий баланс: ${balanceResult.balance} ${balanceResult.currency}\n` +
                         `🆔 ID аккаунта: ${balanceResult.user_id}\n`;
            
            if (priceResult.success) {
                const canBuy = Math.floor(parseFloat(balanceResult.balance) / priceResult.price);
                message += `\n📊 Стоимость 20 shared прокси на 7 дней: ${priceResult.price} ${balanceResult.currency}\n` +
                          `🛒 Можно купить: ${canBuy} таких заказов`;
            }
            
            await bot.sendMessage(chatId, message);
        } else {
            await bot.sendMessage(chatId, `❌ Ошибка проверки баланса: ${balanceResult.error}`);
        }
        return;
    }

    // Новая команда: Добавить клиента с готовыми прокси
    if (text === '📥 Добавить клиента с прокси' || text === '/addclientwithproxies') {
        console.log(`📥 Команда добавления клиента с прокси от userId=${userId}`);
        userStates[userId] = { action: 'adding_client_with_proxies' };
        await bot.sendMessage(chatId, `📥 Добавление клиента с готовыми прокси

📝 Отправьте данные в формате:
\`client1 mypassword123\`
\`31.129.21.214:9379:gNzocE:fnKaHc\`
\`45.91.65.201:9524:gNzocE:fnKaHc\`
\`45.91.65.235:9071:gNzocE:fnKaHc\`

Первая строка: логин пароль
Остальные строки: прокси в формате host:port:user:pass

ℹ️ Прокси НЕ будут покупаться автоматически
👤 Клиент будет добавлен в вашу группу`, { parse_mode: 'Markdown' });
        return;
    }

    // Новая команда: Синхронизация
    if (text === '🔄 Синхронизация' || text === '/sync') {
        console.log(`🔄 Команда синхронизации от userId=${userId}`);
        
        await bot.sendMessage(chatId, '🔄 Начинаю синхронизацию клиентов с сервером...');

        try {
            const results = await syncAllClientsToServer(superAdmin ? null : userId);
            
            let message = `✅ Синхронизация завершена!

📊 Результаты:
✅ Успешно: ${results.success}
❌ Ошибок: ${results.failed}`;

            if (results.errors.length > 0) {
                message += `\n\n❌ Ошибки:\n${results.errors.slice(0, 5).join('\n')}`;
                if (results.errors.length > 5) {
                    message += `\n... и еще ${results.errors.length - 5} ошибок`;
                }
            }

            await bot.sendMessage(chatId, message);
        } catch (error) {
            await bot.sendMessage(chatId, `❌ Ошибка синхронизации: ${error.message}`);
        }
        return;
    }

    if (text === '👤 Добавить клиента' || text === '/addclient') {
        console.log(`➕ Команда добавления клиента от userId=${userId}`);
        userStates[userId] = { action: 'adding_client' };
        await bot.sendMessage(chatId, `➕ Добавление клиента

📝 Отправьте данные в формате:
\`логин пароль\`

Например: \`user123 pass456\`

👤 Клиент будет добавлен в вашу группу`, { parse_mode: 'Markdown' });
        return;
    }

    if (text === '🗑️ Удалить клиента' || text === '/deleteclient') {
        console.log(`🗑️ Команда удаления клиента от userId=${userId}`);

        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);

        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '❌ Нет доступных клиентов для удаления');
            return;
        }

        const keyboard = {
            reply_markup: {
                inline_keyboard: clientNames.map(name => {
                    const client = adminClients[name];
                    const displayName = superAdmin && client.originalName ?
                        `${client.originalName} (Admin: ${client.adminId})` : name;

                    return [{
                        text: `🗑️ ${displayName}`,
                        callback_data: `delete_${name}_${superAdmin ? client.adminId || userId : userId}`
                    }];
                })
            }
        };

        await bot.sendMessage(chatId, '🗑️ Выберите клиента для удаления:', keyboard);
        return;
    }

    if (text === '📋 Мои клиенты' || text === '📋 Все клиенты' || text === '/clients') {
        console.log(`📋 Команда /clients от userId=${userId}`);

        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);

        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '📋 Список клиентов пуст');
            return;
        }

        let message = `📋 Список ${superAdmin ? 'всех' : 'ваших'} клиентов:\n\n`;
        for (const [name, client] of Object.entries(adminClients)) {
            const displayName = superAdmin && client.originalName ?
                `${client.originalName} (Admin: ${client.adminId})` : name;
            const proxyCount = client.proxies ? client.proxies.length : 0;

            message += `👤 ${displayName}\n`;
            message += `   🔐 Пароль: ${client.password}\n`;
            message += `   🌐 Прокси: ${proxyCount} шт.\n`;
            
            // Показываем информацию о заказе PROXY6, если есть
            if (client.proxy6_order_id) {
                message += `   🆔 Заказ PROXY6: ${client.proxy6_order_id}\n`;
            }
            if (client.proxy_expires_at) {
                const expiresAt = new Date(client.proxy_expires_at);
                message += `   ⏰ Истекает: ${expiresAt.toLocaleDateString('ru-RU')}\n`;
            }
            message += `\n`;
        }

        await bot.sendMessage(chatId, message);
        return;
    }

    if (text === '➕ Добавить прокси' || text === '/add-proxy') {
        console.log(`➕ Команда добавления прокси от userId=${userId}`);

        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);

        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '❌ Нет доступных клиентов');
            return;
        }

        userStates[userId] = { action: 'adding_proxy' };

        let message = `➕ Добавление прокси

📝 Отправьте данные в формате:
\`имя_клиента\`
\`host:port:user:pass\`

Или несколько прокси:
\`имя_клиента\`
\`host1:port1:user1:pass1\`
\`host2:port2:user2:pass2\`

📋 Доступные клиенты:\n`;

        for (const [name, client] of Object.entries(adminClients)) {
            const displayName = superAdmin && client.originalName ?
                `${client.originalName} (Admin: ${client.adminId})` : name;
            const proxyCount = client.proxies ? client.proxies.length : 0;
            message += `• ${displayName} (${proxyCount} прокси)\n`;
        }

        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        return;
    }

    if (text === '🌐 Текущий прокси' || text === '/current-proxy') {
        console.log(`🌐 Команда /current-proxy от userId=${userId}`);

        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);

        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '❌ Нет доступных клиентов');
            return;
        }

        const keyboard = {
            reply_markup: {
                inline_keyboard: clientNames.map(name => {
                    const client = adminClients[name];
                    const displayName = superAdmin && client.originalName ?
                        `${client.originalName} (Admin: ${client.adminId})` : name;

                    return [{
                        text: `🌐 ${displayName}`,
                        callback_data: `current_${name}_${superAdmin ? client.adminId || userId : userId}`
                    }];
                })
            }
        };

        await bot.sendMessage(chatId, '🌐 Выберите клиента для проверки текущего прокси:', keyboard);
        return;
    }

    if (text === '🌍 Мой IP' || text === '/myip') {
        console.log(`🌍 Команда /myip от userId=${userId}`);

        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);

        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '❌ Нет доступных клиентов');
            return;
        }

        const keyboard = {
            reply_markup: {
                inline_keyboard: clientNames.map(name => {
                    const client = adminClients[name];
                    const displayName = superAdmin && client.originalName ?
                        `${client.originalName} (Admin: ${client.adminId})` : name;

                    return [{
                        text: `🌍 ${displayName}`,
                        callback_data: `myip_${name}_${superAdmin ? client.adminId || userId : userId}`
                    }];
                })
            }
        };

        await bot.sendMessage(chatId, '🌍 Выберите клиента для проверки IP:', keyboard);
        return;
    }

    // Команды только для супер-админа
    if (text === '👥 Управление админами' || text === '/manageadmins') {
        if (!superAdmin) {
            await bot.sendMessage(chatId, '❌ Эта команда доступна только супер-админу');
            return;
        }

        const adminsList = admins.length > 0 ? admins.join(', ') : 'Нет админов';
        const message = `👥 Управление администраторами

📋 Текущие админы: ${adminsList}

Отправьте команду:
• \`+123456789\` - добавить админа
• \`-123456789\` - удалить админа
• \`list\` - показать список админов`;

        userStates[userId] = { action: 'managing_admins' };
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        return;
    }

    // ВАЖНО: Проверяем команды кнопок ПЕРЕД обработкой состояний
    // Это предотвращает случайную обработку текста кнопок как данных для добавления клиента
    const buttonCommands = [
        '👤 Добавить клиента', '🛒 Добавить с покупкой', '🗑️ Удалить клиента', '➕ Добавить прокси',
        '📋 Мои клиенты', '📋 Все клиенты', '🌐 Текущий прокси', '🌍 Мой IP', 
        '👥 Управление админами', '📥 Добавить клиента с прокси', '🔄 Синхронизация', '💰 Проверка баланса',
        '🛍 Купить прокси клиенту' // NEW
    ];

    if (buttonCommands.includes(text)) {
        // Сбрасываем состояние пользователя если он нажал кнопку
        if (userStates[userId]) {
            delete userStates[userId];
            console.log(`🔄 Состояние пользователя ${userId} сброшено из-за нажатия кнопки: ${text}`);
        }
        await bot.sendMessage(chatId, `❌ Команда "${text}" не реализована или уже обработана выше. Используйте кнопки меню.`, getKeyboardForUser(userId));
        return;
    }

    // Обработка состояний пользователей
    if (userStates[userId]) {
        const state = userStates[userId];

        // Обработка процесса покупки прокси для нового клиента
        if (state.action === 'add_user_with_purchase') {
            switch (state.step) {
                case 'waiting_username':
                    // Проверяем логин
                    if (!text || text.length < 3) {
                        await bot.sendMessage(chatId, '❌ Логин должен содержать минимум 3 символа. Попробуйте еще раз:');
                        return;
                    }

                    // Проверяем, не существует ли уже такой пользователь
                    const existingUser = findClientByName(text, superAdmin ? null : userId);
                    if (existingUser) {
                        await bot.sendMessage(chatId, '❌ Пользователь с таким логином уже существует. Введите другой логин:');
                        return;
                    }

                    state.username = text;
                    state.step = 'waiting_password';
                    userStates[userId] = state;

                    await bot.sendMessage(chatId, `✅ Логин: ${text}\n\n🔐 Теперь введите пароль для клиента:`);
                    return;

                case 'waiting_password':
                    // Проверяем пароль
                    if (!text || text.length < 4) {
                        await bot.sendMessage(chatId, '❌ Пароль должен содержать минимум 4 символа. Попробуйте еще раз:');
                        return;
                    }

                    state.password = text;
                    state.step = 'confirming_purchase';
                    userStates[userId] = state;

                    // Показываем финальное подтверждение
                    const keyboard = {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '✅ Подтвердить покупку', callback_data: 'confirm_purchase' },
                                    { text: '❌ Отменить', callback_data: 'cancel_purchase' }
                                ]
                            ]
                        }
                    };

                    await bot.sendMessage(chatId, 
                        `📋 Подтверждение создания клиента:\n\n` +
                        `👤 Логин: ${state.username}\n` +
                        `🔐 Пароль: ${state.password}\n` +
                        `📦 Прокси: 20 shared на 7 дней\n` +
                        `💸 Стоимость: будет списана с баланса PROXY6\n\n` +
                        `❓ Подтвердить создание и покупку прокси?`,
                        keyboard
                    );
                    return;
            }
        }

        // Новое состояние: покупка прокси существующему клиенту (NEW)
        if (state.action === 'buying_proxy') {
            switch (state.step) {
                case 'waiting_client_name': {
                    const clientNameInput = text.trim();

                    // Ищем клиента с учетом ролей
                    const clientInfo = superAdmin
                        ? findClientByName(clientNameInput)
                        : findClientByName(clientNameInput, userId);

                    if (!clientInfo) {
                        await bot.sendMessage(chatId, `❌ Клиент ${clientNameInput} не найден или у вас нет к нему доступа`);
                        delete userStates[userId];
                        return;
                    }

                    // Проверка PROXY6
                    if (!PROXY6_CONFIG.API_KEY) {
                        await bot.sendMessage(chatId, '❌ API ключ PROXY6.net не настроен');
                        delete userStates[userId];
                        return;
                    }

                    // Проверяем баланс и цену (оставляем как в логике добавления с покупкой)
                    await bot.sendMessage(chatId, '⏳ Проверяю баланс и цену в PROXY6...');
                    const balanceCheck = await checkProxy6Balance();
                    if (!balanceCheck.success) {
                        await bot.sendMessage(chatId, `❌ Ошибка подключения к PROXY6: ${balanceCheck.error}`);
                        delete userStates[userId];
                        return;
                    }

                    const priceCheck = await getProxy6Price(3, 7, 3);
                    if (!priceCheck.success) {
                        await bot.sendMessage(chatId, `❌ Ошибка получения цены: ${priceCheck.error}`);
                        delete userStates[userId];
                        return;
                    }

                    if (parseFloat(balanceCheck.balance) < priceCheck.price) {
                        await bot.sendMessage(chatId,
                            `❌ Недостаточно средств на балансе PROXY6!\n\n` +
                            `💰 Текущий баланс: ${balanceCheck.balance} ${balanceCheck.currency}\n` +
                            `💸 Необходимо: ${priceCheck.price} ${priceCheck.currency}\n` +
                            `📊 Цена за 20 shared прокси на 7 дней`
                        );
                        delete userStates[userId];
                        return;
                    }

                    // Сохраняем состояние для подтверждения
                    userStates[userId] = {
                        action: 'buying_proxy',
                        step: 'confirming_buy',
                        clientName: clientInfo.clientName || clientNameInput,
                        adminId: clientInfo.adminId,
                        price: priceCheck.price,
                        currency: priceCheck.currency,
                        count: 1,
                        period: 7
                    };

                    const keyboard = {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '✅ Подтвердить покупку', callback_data: 'confirm_buy_client' },
                                    { text: '❌ Отменить', callback_data: 'cancel_buy_client' }
                                ]
                            ]
                        }
                    };

                    await bot.sendMessage(chatId,
                        `📋 Подтверждение покупки:\n\n` +
                        `👤 Клиент: ${clientInfo.clientName || clientNameInput}\n` +
                        `📦 Прокси: 20 shared на 7 дней\n` +
                        `💸 Стоимость: будет списана с баланса PROXY6\n\n` +
                        `❓ Подтвердить покупку прокси для клиента?`,
                        keyboard
                    );
                    return;
                }
            }
        }

        // Новое состояние: добавление клиента с готовыми прокси
        if (state.action === 'adding_client_with_proxies') {
            console.log('📦 Получен ответ для добавления клиента с прокси');

            const lines = text.trim().split('\n');
            if (lines.length < 2) {
                await bot.sendMessage(chatId, '❌ Неверный формат. Первая строка: логин пароль, остальные: прокси');
                return;
            }

            const firstLine = lines[0].trim().split(/\s+/);
            if (firstLine.length < 2) {
                await bot.sendMessage(chatId, '❌ Неверный формат первой строки. Используйте: логин пароль');
                return;
            }

            const clientName = firstLine[0];
            const password = firstLine[1];
            const proxyLines = lines.slice(1);

            // Проверяем, существует ли клиент у этого админа
            const adminClients = getAdminClients(userId);
            if (adminClients[clientName]) {
                await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует в вашей группе`);
                delete userStates[userId];
                return;
            }

            // Проверяем, существует ли клиент у других админов (для супер-админа)
            if (superAdmin) {
                const existingClient = findClientByName(clientName);
                if (existingClient) {
                    await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует у админа ${existingClient.adminId}`);
                    delete userStates[userId];
                    return;
                }
            }

            // Парсим прокси
            const proxies = [];
            for (const proxyLine of proxyLines) {
                const proxy = proxyLine.trim();
                if (proxy) {
                    const parts = proxy.split(':');
                    if (parts.length === 4) {
                        proxies.push(proxy);
                    } else {
                        await bot.sendMessage(chatId, `❌ Неверный формат прокси: ${proxy}\nИспользуйте: host:port:user:pass`);
                        return;
                    }
                }
            }

            if (proxies.length === 0) {
                await bot.sendMessage(chatId, '❌ Не найдено валидных прокси');
                return;
            }

            // Создаем клиента с готовыми прокси
            adminClients[clientName] = {
                password: password,
                proxies: proxies
            };

            saveClients();

            // Добавляем клиента на прокси сервер
            try {
                console.log(`➕ Добавляем клиента на прокси сервер: ${clientName}`);
                const serverResponse = await makeProxyServerRequest('/api/add-client', 'POST', {
                    clientName: clientName,
                    password: password,
                    proxies: proxies.map(formatProxyForRailway)
                });

                console.log(`✅ Клиент ${clientName} успешно добавлен на прокси сервер`);

                await bot.sendMessage(chatId, `✅ Клиент ${clientName} добавлен в вашу группу!
   👤 Логин: ${clientName}
   🔐 Пароль: ${password}
   🌐 Прокси: ${proxies.length} шт.
   👨‍💼 Админ: ${userId}
   
📥 Прокси добавлены без покупки`, getKeyboardForUser(userId));

            } catch (error) {
                console.error('❌ Ошибка добавления клиента на прокси сервер:', error);
                await bot.sendMessage(chatId, `✅ Клиент ${clientName} добавлен локально с ${proxies.length} прокси
⚠️ Ошибка синхронизации с прокси сервером: ${error.message}`, getKeyboardForUser(userId));
            }

            delete userStates[userId];
            return;
        }

        if (state.action === 'adding_client') {
            console.log('📦 Получен ответ для добавления клиента');

            const lines = text.trim().split('\n');
            const parts = lines[0].trim().split(/\s+/);

            if (parts.length < 2) {
                await bot.sendMessage(chatId, '❌ Неверный формат. Используйте: логин пароль');
                return;
            }

            const clientName = parts[0];
            const password = parts[1];

            // Проверяем, существует ли клиент у этого админа
            const adminClients = getAdminClients(userId);
            if (adminClients[clientName]) {
                await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует в вашей группе`);
                delete userStates[userId];
                return;
            }

            // Проверяем, существует ли клиент у других админов (для супер-админа)
            if (superAdmin) {
                const existingClient = findClientByName(clientName);
                if (existingClient) {
                    await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует у админа ${existingClient.adminId}`);
                    delete userStates[userId];
                    return;
                }
            }

            // Создаем клиента
            adminClients[clientName] = {
                password: password,
                proxies: []
            };

            saveClients();

            // Добавляем клиента на прокси сервер
            try {
                console.log(`➕ Добавляем клиента на прокси сервер: ${clientName}`);
                const serverResponse = await makeProxyServerRequest('/api/add-client', 'POST', {
                    clientName: clientName,
                    password: password,
                    proxies: adminClients[clientName].proxies.map(formatProxyForRailway)
                });

                console.log(`✅ Клиент ${clientName} успешно добавлен на прокси сервер`);

                await bot.sendMessage(chatId, `✅ Клиент ${clientName} добавлен в вашу группу!
   👤 Логин: ${clientName}
   🔐 Пароль: ${password}
   🌐 Прокси: ${adminClients[clientName].proxies.length} шт.
   👨‍💼 Админ: ${userId}`, getKeyboardForUser(userId));

            } catch (error) {
                console.error('❌ Ошибка добавления клиента на прокси сервер:', error);
                await bot.sendMessage(chatId, `✅ Клиент ${clientName} добавлен локально с ${adminClients[clientName].proxies.length} прокси
⚠️ Ошибка синхронизации с прокси сервером: ${error.message}`, getKeyboardForUser(userId));
            }

            delete userStates[userId];
            return;
        }

        if (state.action === 'adding_proxy') {
            console.log('📦 Получен ответ для добавления прокси');

            const lines = text.trim().split('\n');
            if (lines.length < 2) {
                await bot.sendMessage(chatId, '❌ Неверный формат. Используйте:\nимя_клиента\nhost:port:user:pass');
                return;
            }

            const clientName = lines[0].trim();
            const proxyLines = lines.slice(1);

            // Находим клиента
            const clientInfo = superAdmin ?
                findClientByName(clientName) :
                findClientByName(clientName, userId);

            if (!clientInfo) {
                await bot.sendMessage(chatId, `❌ Клиент ${clientName} не найден или у вас нет к нему доступа`);
                delete userStates[userId];
                return;
            }

            // Проверяем права доступа
            if (!superAdmin && clientInfo.adminId != userId) {
                await bot.sendMessage(chatId, `❌ У вас нет доступа к клиенту ${clientName}`);
                delete userStates[userId];
                return;
            }

            // Парсим прокси
            const newProxies = [];
            for (const proxyLine of proxyLines) {
                const proxy = proxyLine.trim();
                if (proxy) {
                    const parts = proxy.split(':');
                    if (parts.length === 4) {
                        newProxies.push(proxy);
                    } else {
                        await bot.sendMessage(chatId, `❌ Неверный формат прокси: ${proxy}\nИспользуйте: host:port:user:pass`);
                        return;
                    }
                }
            }

            if (newProxies.length === 0) {
                await bot.sendMessage(chatId, '❌ Не найдено валидных прокси');
                return;
            }

            // Добавляем прокси к клиенту
            const adminClients = getAdminClients(clientInfo.adminId);
            adminClients[clientInfo.clientName].proxies.push(...newProxies);
            saveClients();

            // Обновляем прокси на сервере
            try {
                await makeProxyServerRequest('/api/add-proxy', 'POST', {
                    name: clientInfo.clientName,
                    proxies: newProxies.map(formatProxyForRailway)
                });
            } catch (error) {
                console.error('❌ Ошибка добавления прокси на сервер:', error);
            }

            await bot.sendMessage(chatId, `✅ Добавлено ${newProxies.length} прокси к клиенту ${clientName}
🌐 Всего прокси у клиента: ${adminClients[clientInfo.clientName].proxies.length}
👨‍💼 Админ: ${clientInfo.adminId}`, getKeyboardForUser(userId));

            delete userStates[userId];
            return;
        }

        // Обработка управления админами
        if (state.action === 'managing_admins' && superAdmin) {
            if (text === 'list') {
                const adminsList = admins.length > 0 ? admins.join(', ') : 'Нет админов';
                await bot.sendMessage(chatId, `📋 Список админов: ${adminsList}`);
                return;
            }

            if (text.startsWith('+')) {
                const newAdminId = parseInt(text.substring(1));
                if (isNaN(newAdminId)) {
                    await bot.sendMessage(chatId, '❌ Неверный формат ID');
                    return;
                }

                if (admins.includes(newAdminId)) {
                    await bot.sendMessage(chatId, `❌ Пользователь ${newAdminId} уже является админом`);
                    return;
                }

                admins.push(newAdminId);
                saveAdmins();
                await bot.sendMessage(chatId, `✅ Пользователь ${newAdminId} добавлен в админы`);
                return;
            }

            if (text.startsWith('-')) {
                const removeAdminId = parseInt(text.substring(1));
                if (isNaN(removeAdminId)) {
                    await bot.sendMessage(chatId, '❌ Неверный формат ID');
                    return;
                }

                const index = admins.indexOf(removeAdminId);
                if (index === -1) {
                    await bot.sendMessage(chatId, `❌ Пользователь ${removeAdminId} не является админом`);
                    return;
                }

                admins.splice(index, 1);
                saveAdmins();
                await bot.sendMessage(chatId, `✅ Пользователь ${removeAdminId} удален из админов`);
                return;
            }

            await bot.sendMessage(chatId, '❌ Неверная команда. Используйте +ID, -ID или list');
            return;
        }
    }

    // Если команда не распознана
    await bot.sendMessage(chatId, '❌ Неизвестная команда. Используйте кнопки ниже для управления.', getKeyboardForUser(userId));
});

// Обработка callback запросов
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    console.log(`🔘 Callback: ${data} от userId=${userId}`);

    if (!isAuthorized(userId)) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Нет доступа' });
        return;
    }

    const superAdmin = isSuperAdmin(userId);

    // Подтверждение покупки прокси для существующего клиента (NEW)
    if (data === 'confirm_buy_client') {
        const st = userStates[userId];
        if (!st || st.action !== 'buying_proxy' || st.step !== 'confirming_buy') {
            await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Сессия истекла. Начните заново.' });
            return;
        }

        try {
            await bot.editMessageText('⏳ Покупаю прокси и добавляю клиенту...', {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            });

            const result = await buyProxiesForExistingClient({
                adminId: st.adminId,
                clientName: st.clientName,
                count: 1,
                period: 7,
                country: 'ru',
                version: 3
            });

            if (result.success) {
                const info = result.purchase_info;
                await bot.editMessageText(
                    `✅ Прокси успешно куплены и добавлены клиенту!\n\n` +
                    `👤 Клиент: ${st.clientName}\n` +
                    `📦 Добавлено: ${result.addedCount} прокси\n\n` +
                    `💰 Информация о покупке:\n` +
                    `🆔 Заказ: ${info.order_id}\n` +
                    `💸 Стоимость: ${info.price} ${info.currency || 'RUB'}\n` +
                    `📊 Количество: ${info.count} прокси\n` +
                    `⏰ Период: ${info.period} дней\n` +
                    `💳 Остаток баланса: ${info.balance_remaining} ${info.currency || 'RUB'}`,
                    { chat_id: chatId, message_id: callbackQuery.message.message_id }
                );
            } else {
                await bot.editMessageText(
                    `❌ Ошибка покупки прокси: ${result.error}`,
                    { chat_id: chatId, message_id: callbackQuery.message.message_id }
                );
            }
        } catch (err) {
            await bot.editMessageText(
                `❌ Сбой при покупке прокси: ${err.message}`,
                { chat_id: chatId, message_id: callbackQuery.message.message_id }
            );
        } finally {
            delete userStates[userId];
            await bot.answerCallbackQuery(callbackQuery.id);
        }
        return;
    }

    // Отмена покупки прокси для существующего клиента (NEW)
    if (data === 'cancel_buy_client') {
        delete userStates[userId];
        try {
            await bot.editMessageText('❌ Покупка прокси отменена.', {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            });
        } catch (e) {
            // игнорируем, если нельзя редактировать
        }
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Обработка подтверждения покупки нового клиента
    if (data === 'confirm_purchase') {
        await handleConfirmPurchase(chatId, userId);
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Обработка отмены покупки нового клиента
    if (data === 'cancel_purchase') {
        delete userStates[userId];
        await bot.editMessageText('❌ Создание клиента отменено.', {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id
        });
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Обработка удаления клиента
    if (data.startsWith('delete_')) {
        const parts = data.split('_');
        const clientName = parts[1];
        const adminId = parts[2];

        // Проверяем права доступа
        if (!superAdmin && adminId != userId) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Нет доступа к этому клиенту' });
            return;
        }

        const adminClients = getAdminClients(adminId);
        if (!adminClients[clientName]) {
            await bot.editMessageText('❌ Клиент не найден', {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            });
            await bot.answerCallbackQuery(callbackQuery.id);
            return;
        }

        // Сначала удаляем клиента с прокси сервера
        try {
            const deleteResult = await deleteClientFromServer(clientName);
            if (deleteResult.success) {
                console.log('✅ Клиент успешно удален с прокси сервера');
            } else {
                console.error('❌ Ошибка удаления с сервера:', deleteResult.error);
            }
        } catch (error) {
            console.error('❌ Ошибка удаления клиента с сервера:', error);
        }

        // Затем удаляем клиента локально
        delete adminClients[clientName];
        saveClients();

        await bot.editMessageText(
            `✅ Клиент ${clientName} успешно удален
👨‍💼 Админ: ${adminId}`,
            {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            }
        );

        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Обработка проверки текущего прокси
    if (data.startsWith('current_')) {
        const parts = data.split('_');
        const clientName = parts[1];
        const adminId = parts[2];

        // Проверяем права доступа
        if (!superAdmin && adminId != userId) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Нет доступа к этому клиенту' });
            return;
        }

        const adminClients = getAdminClients(adminId);
        if (!adminClients[clientName]) {
            await bot.editMessageText('❌ Клиент не найден', {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            });
            await bot.answerCallbackQuery(callbackQuery.id);
            return;
        }

        try {
            const result = await getCurrentProxy(clientName, adminClients[clientName].password);

            await bot.editMessageText(
                `🌐 Текущий прокси для клиента ${clientName}:
📍 ${result.proxy || 'Не найден'}
🌍 Страна: ${result.country || 'Неизвестно'}
👨‍💼 Админ: ${adminId}`,
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message.message_id
                }
            );
        } catch (error) {
            await bot.editMessageText(
                `❌ Ошибка получения прокси для ${clientName}: ${error.message}`,
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message.message_id
                }
            );
        }

        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Обработка проверки IP
    if (data.startsWith('myip_')) {
        const parts = data.split('_');
        const clientName = parts[1];
        const adminId = parts[2];

        // Проверяем права доступа
        if (!superAdmin && adminId != userId) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Нет доступа к этому клиенту' });
            return;
        }

        const adminClients = getAdminClients(adminId);
        if (!adminClients[clientName]) {
            await bot.editMessageText('❌ Клиент не найден', {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            });
            await bot.answerCallbackQuery(callbackQuery.id);
            return;
        }

        try {
            const result = await getMyIP(clientName, adminClients[clientName].password);

            await bot.editMessageText(
                `🌍 IP адрес клиента ${clientName}:
📍 ${result.ip || 'Не определен'}
🌍 Страна: ${result.country || 'Неизвестно'}
🏙️ Город: ${result.city || 'Неизвестно'}
👨‍💼 Админ: ${adminId}`,
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message.message_id
                }
            );
        } catch (error) {
            await bot.editMessageText(
                `❌ Ошибка получения IP для ${clientName}: ${error.message}`,
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message.message_id
                }
            );
        }

        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    await bot.answerCallbackQuery(callbackQuery.id);
});

// Инициализация
loadClients();
loadAdmins();

console.log('🚀 Telegram Bot запущен!');
console.log(`👑 Супер-админ ID: ${SUPER_ADMIN_ID}`);
console.log(`👥 Админов: ${admins.length}`);
console.log(`🌐 Прокси сервер: ${PROXY_SERVER_URL}`);
console.log(`🔑 PROXY6 API: ${PROXY6_CONFIG.API_KEY ? 'Настроен' : 'НЕ настроен'}`);

// Необязательный health endpoint (если нужен для хостинга)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    const totalClients = Object.values(clients).reduce((sum, adminClients) => sum + Object.keys(adminClients).length, 0);

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        total_clients: totalClients,
        admins_count: admins.length,
        proxy_server: PROXY_SERVER_URL,
        proxy6_configured: !!PROXY6_CONFIG.API_KEY,
        clients_by_admin: Object.fromEntries(
            Object.entries(clients).map(([adminId, adminClients]) => [
                adminId, Object.keys(adminClients).length
            ])
        )
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Health endpoint доступен на порту ${PORT}`);
});

// Функция для проверки и форматирования прокси
function formatProxyForRailway(proxy) {
    // PROXY6.net возвращает: { host, port, user, pass, type }
    // Сервер ожидает: "http://user:pass@host:port"

    if (typeof proxy === 'string') {
        // Если уже в формате http://user:pass@host:port
        if (proxy.startsWith('http://') && proxy.includes('@')) {
            return proxy;
        }

        // Если в формате host:port:user:pass - конвертируем
        const parts = proxy.split(':');
        if (parts.length === 4) {
            const [host, port, user, pass] = parts;
            return `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
        }

        return proxy; // Возвращаем как есть
    }

    // Если объект от PROXY6.net
    if (proxy && proxy.host && proxy.port && proxy.user && proxy.pass) {
        return `http://${encodeURIComponent(proxy.user)}:${encodeURIComponent(proxy.pass)}@${proxy.host}:${proxy.port}`;
    }

    console.error('❌ Неверный формат прокси:', proxy);
    return null;
}
