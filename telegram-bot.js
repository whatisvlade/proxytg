const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPER_ADMIN_ID = parseInt(process.env.SUPER_ADMIN_ID);
const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL || 'https://railway-proxy-server-production-58a1.up.railway.app';

// PROXY6.net конфигурация
const PROXY6_CONFIG = {
    API_KEY: process.env.PROXY6_API_KEY,
    BASE_URL: 'https://px6.link/api',
    DEFAULT_COUNT: 2,
    DEFAULT_PERIOD: 7,
    DEFAULT_COUNTRY: 'ru',
    DEFAULT_VERSION: 3 // IPv4 Shared
};

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Файлы конфигурации
const CLIENTS_FILE = path.join(__dirname, 'clients.json');
const ADMINS_FILE = path.join(__dirname, 'admins.json');

// Загрузка конфигураций
let clients = {}; // Структура: { adminId: { clientName: { password, proxies } } }
let admins = [];

// Клавиатура для всех админов
const adminKeyboard = {
    reply_markup: {
        keyboard: [
            [
                { text: '👤 Добавить клиента' },
                { text: '🗑️ Удалить клиента' }
            ],
            [
                { text: '➕ Добавить прокси' },
                { text: '➖ Удалить прокси' }
            ],
            [
                { text: '📋 Мои клиенты' },
                { text: '🔄 Ротация прокси' }
            ],
            [
                { text: '💰 Баланс PROXY6' },
                { text: '🛒 Купить прокси' }
            ],
            [
                { text: '🌐 Текущий прокси' },
                { text: '🌍 Мой IP' }
            ],
            [
                { text: '📥 Добавить клиента с прокси' },
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
                { text: '🗑️ Удалить клиента' }
            ],
            [
                { text: '➕ Добавить прокси' },
                { text: '➖ Удалить прокси' }
            ],
            [
                { text: '📋 Все клиенты' },
                { text: '🔄 Ротация прокси' }
            ],
            [
                { text: '💰 Баланс PROXY6' },
                { text: '🛒 Купить прокси' }
            ],
            [
                { text: '🌐 Текущий прокси' },
                { text: '🌍 Мой IP' }
            ],
            [
                { text: '📥 Добавить клиента с прокси' },
                { text: '🔄 Синхронизация' }
            ],
            [
                { text: '👥 Управление админами' },
                { text: '🔄 Перезапуск' }
            ]
        ],
        resize_keyboard: true,
        persistent: true
    }
};

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

// PROXY6.net API функции
async function proxy6Request(method, params = {}) {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            throw new Error('API ключ PROXY6.net не настроен');
        }

        const queryParams = new URLSearchParams(params).toString();
        const url = `${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}/${method}${queryParams ? '?' + queryParams : ''}`;

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'TelegramBot/1.0'
            }
        });

        return response.data;
    } catch (error) {
        console.error('❌ Ошибка PROXY6 запроса:', error.message);
        throw error;
    }
}

async function checkProxy6Balance() {
    try {
        const response = await proxy6Request('');
        if (response.status === 'yes') {
            return {
                success: true,
                balance: response.balance,
                currency: response.currency,
                user_id: response.user_id
            };
        } else {
            return {
                success: false,
                error: response.error || 'Неизвестная ошибка'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function buyProxy6Proxies(count, period, country = 'ru', version = 3, descr = '') {
    try {
        const response = await proxy6Request('buy', {
            count: count,
            period: period,
            country: country,
            version: version,
            descr: descr
        });

        if (response.status === 'yes') {
            return {
                success: true,
                order_id: response.order_id,
                count: response.count,
                price: response.price,
                proxies: response.list
            };
        } else {
            return {
                success: false,
                error: response.error || 'Ошибка покупки прокси'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
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

async function rotateClientProxy(clientName) {
    try {
        const response = await makeProxyServerRequest('/api/rotate-client', 'POST', {
            name: clientName
        });
        return response;
    } catch (error) {
        throw new Error(`Ошибка ротации прокси: ${error.message}`);
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

ℹ️ Автоматическая покупка прокси: При добавлении нового клиента автоматически покупается ${PROXY6_CONFIG.DEFAULT_COUNT} российских прокси на ${PROXY6_CONFIG.DEFAULT_PERIOD} дней через PROXY6.net

🆕 Новые функции:
• 📥 Добавить клиента с прокси - добавление без покупки
• 🔄 Синхронизация - восстановление клиентов на сервере`;

        await bot.sendMessage(chatId, welcomeMessage, getKeyboardForUser(userId));
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

ℹ️ Автоматически будет куплено ${PROXY6_CONFIG.DEFAULT_COUNT} российских прокси на ${PROXY6_CONFIG.DEFAULT_PERIOD} дней
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
            message += `   🌐 Прокси: ${proxyCount} шт.\n\n`;
        }

        await bot.sendMessage(chatId, message);
        return;
    }

    if (text === '💰 Баланс PROXY6' || text === '/proxy6-balance') {
        console.log(`💰 Команда /proxy6-balance от userId=${userId}`);

        if (!PROXY6_CONFIG.API_KEY) {
            await bot.sendMessage(chatId, '❌ API ключ PROXY6.net не настроен');
            return;
        }

        const balanceResult = await checkProxy6Balance();

        if (balanceResult.success) {
            const message = `💰 Баланс PROXY6.net:
💵 ${balanceResult.balance} ${balanceResult.currency}
👤 ID аккаунта: ${balanceResult.user_id}`;
            await bot.sendMessage(chatId, message);
        } else {
            await bot.sendMessage(chatId, `❌ Ошибка получения баланса: ${balanceResult.error}`);
        }
        return;
    }

    if (text === '🛒 Купить прокси' || text === '/buy-proxies') {
        console.log(`🛒 Команда /buy-proxies от userId=${userId}`);

        if (!PROXY6_CONFIG.API_KEY) {
            await bot.sendMessage(chatId, '❌ API ключ PROXY6.net не настроен');
            return;
        }

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
                    const proxyCount = client.proxies ? client.proxies.length : 0;

                    return [{
                        text: `${displayName} (${proxyCount} прокси)`,
                        callback_data: `buy_proxy_${name}_${superAdmin ? client.adminId || userId : userId}`
                    }];
                })
            }
        };

        await bot.sendMessage(chatId, '🛒 Выберите клиента для покупки прокси:', keyboard);
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

    if (text === '➖ Удалить прокси' || text === '/remove-proxy') {
        console.log(`➖ Команда удаления прокси от userId=${userId}`);

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
                    const proxyCount = client.proxies ? client.proxies.length : 0;

                    return [{
                        text: `➖ ${displayName} (${proxyCount} прокси)`,
                        callback_data: `remove_proxy_${name}_${superAdmin ? client.adminId || userId : userId}`
                    }];
                })
            }
        };

        await bot.sendMessage(chatId, '➖ Выберите клиента для удаления прокси:', keyboard);
        return;
    }

    if (text === '🔄 Ротация прокси' || text === '/rotate') {
        console.log(`🔄 Команда /rotate от userId=${userId}`);

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
                        text: `🔄 ${displayName}`,
                        callback_data: `rotate_${name}_${superAdmin ? client.adminId || userId : userId}`
                    }];
                })
            }
        };

        await bot.sendMessage(chatId, '🔄 Выберите клиента для ротации прокси:', keyboard);
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

    if (text === '🔄 Перезапуск' || text === '/restart') {
        if (!superAdmin) {
            await bot.sendMessage(chatId, '❌ Эта команда доступна только супер-админу');
            return;
        }

        await bot.sendMessage(chatId, '🔄 Перезапуск бота...');
        process.exit(0);
    }

    // ВАЖНО: Проверяем команды кнопок ПЕРЕД обработкой состояний
    // Это предотвращает случайную обработку текста кнопок как данных для добавления клиента
    const buttonCommands = [
        '👤 Добавить клиента', '🗑️ Удалить клиента', '➕ Добавить прокси', '➖ Удалить прокси',
        '📋 Мои клиенты', '📋 Все клиенты', '🔄 Ротация прокси', '💰 Баланс PROXY6',
        '🛒 Купить прокси', '🌐 Текущий прокси', '🌍 Мой IP', '👥 Управление админами', 
        '🔄 Перезапуск', '📥 Добавить клиента с прокси', '🔄 Синхронизация'
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

            // Автоматическая покупка прокси через PROXY6.net
            let proxyPurchaseMessage = '';
            if (PROXY6_CONFIG.API_KEY) {
                console.log(`🛒 Автоматическая покупка прокси включена для клиента ${clientName}`);

                try {
                    const purchaseResult = await buyProxy6Proxies(
                        PROXY6_CONFIG.DEFAULT_COUNT,
                        PROXY6_CONFIG.DEFAULT_PERIOD,
                        PROXY6_CONFIG.DEFAULT_COUNTRY,
                        PROXY6_CONFIG.DEFAULT_VERSION,
                        `client_${clientName}_admin_${userId}`
                    );

                    if (purchaseResult.success) {
                        console.log(`✅ Прокси успешно куплены:`, purchaseResult);

                        // Конвертируем прокси в нужный формат
                        const proxies = [];
                        for (const [id, proxy] of Object.entries(purchaseResult.proxies)) {
                            proxies.push(`${proxy.host}:${proxy.port}:${proxy.user}:${proxy.pass}`);
                        }

                        adminClients[clientName].proxies = proxies;
                        proxyPurchaseMessage = `\n🛒 Автоматически куплено ${purchaseResult.count} прокси за ${purchaseResult.price} RUB`;

                        console.log(`✅ Добавлено ${proxies.length} прокси к клиенту ${clientName}`);
                    } else {
                        console.log(`❌ Не удалось купить прокси автоматически: ${purchaseResult.error}`);
                        proxyPurchaseMessage = `\n❌ Ошибка покупки прокси через PROXY6.net: ${purchaseResult.error}`;
                    }
                } catch (error) {
                    console.error('❌ Ошибка автоматической покупки прокси:', error);
                    proxyPurchaseMessage = `\n❌ Ошибка покупки прокси: ${error.message}`;
                }
            } else {
                console.log(`❌ API ключ PROXY6.net не настроен, пропускаем автоматическую покупку`);
                proxyPurchaseMessage = '\n⚠️ API ключ PROXY6.net не настроен';
            }

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
   👨‍💼 Админ: ${userId}${proxyPurchaseMessage}`, getKeyboardForUser(userId));

            } catch (error) {
                console.error('❌ Ошибка добавления клиента на прокси сервер:', error);
                await bot.sendMessage(chatId, `✅ Клиент ${clientName} добавлен локально с ${adminClients[clientName].proxies.length} прокси${proxyPurchaseMessage}
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

    // Обработка покупки прокси
    if (data.startsWith('buy_proxy_')) {
        const parts = data.split('_');
        const clientName = parts[2];
        const adminId = parts[3];

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
            const purchaseResult = await buyProxy6Proxies(
                PROXY6_CONFIG.DEFAULT_COUNT,
                PROXY6_CONFIG.DEFAULT_PERIOD,
                PROXY6_CONFIG.DEFAULT_COUNTRY,
                PROXY6_CONFIG.DEFAULT_VERSION,
                `client_${clientName}_admin_${adminId}_manual`
            );

            if (purchaseResult.success) {
                // Добавляем новые прокси к существующим
                const newProxies = [];
                for (const [id, proxy] of Object.entries(purchaseResult.proxies)) {
                    newProxies.push(`${proxy.host}:${proxy.port}:${proxy.user}:${proxy.pass}`);
                }

                adminClients[clientName].proxies.push(...newProxies);
                saveClients();

                // Обновляем прокси на сервере
                try {
                    await makeProxyServerRequest('/api/add-proxy', 'POST', {
                        name: clientName,
                        proxies: newProxies.map(formatProxyForRailway)
                    });
                } catch (error) {
                    console.error('❌ Ошибка обновления прокси на сервере:', error);
                }

                await bot.editMessageText(
                    `✅ Успешно куплено ${purchaseResult.count} прокси для клиента ${clientName}
💰 Стоимость: ${purchaseResult.price} RUB
📦 Заказ: #${purchaseResult.order_id}
🌐 Всего прокси у клиента: ${adminClients[clientName].proxies.length}
👨‍💼 Админ: ${adminId}`,
                    {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id
                    }
                );
            } else {
                await bot.editMessageText(
                    `❌ Ошибка покупки прокси: ${purchaseResult.error}`,
                    {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id
                    }
                );
            }
        } catch (error) {
            await bot.editMessageText(
                `❌ Ошибка: ${error.message}`,
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message.message_id
                }
            );
        }

        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Обработка удаления прокси
    if (data.startsWith('remove_proxy_')) {
        const parts = data.split('_');
        const clientName = parts[2];
        const adminId = parts[3];

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
console.log(`🛒 PROXY6.net API: ${PROXY6_CONFIG.API_KEY ? '✅ Настроен' : '❌ Не настроен'}`);
console.log(`🌐 Прокси сервер: ${PROXY_SERVER_URL}`);

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
        proxy6_configured: !!PROXY6_CONFIG.API_KEY,
        proxy_server: PROXY_SERVER_URL,
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
