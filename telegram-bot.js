мы можем добавить для супер админа кнопку провыерку количества доступных проксни на сайте российские shared
больше ничего не меняя !!!

PROXY6.net

    Купить прокси
    Цены
    FAQ
    Партнерская программа

    Аккаунт

    Прокси чекер Мой IP Whois Моя анонимность Черный список Сканер портов Поддержка IPv6 API

Разработчикам (API)
Api позволит вам интегрировать покупку и продление прокси в ваш сервис, либо приложение.

Взаимодействие партнера с системой, равно как и системы с партнером происходит посредством GET запросов и JSON ответов. Все общение происходит в кодировке UTF-8, ответ полученный в другой кодировке может привести к ошибкам в работе.

Обращение к API производится по адресу:

https://px6.link/api/{api_key}/{method}/?{params}

    api_key - Секретный ключ, вы можете получить его в личном кабинете;
    method - Название одного из методов;
    params - Дополнительные параметры запроса в зависимости от метода.

Внимание. К API разрешено делать не более 3-х запросов в 1 секунду. При превышении лимита будет возвращаться ошибка 429 (Too Many Requests) на лишние запросы.

Доступные методы:

    getprice - Получение информации о сумме заказа;
    getcount - Получение информации о доступном кол-ве прокси для конкретной страны;
    getcountry - Получение списка доступных стран;
    getproxy - Получение списка ваших прокси;
    settype - Изменение типа (протокола) прокси;
    setdescr - Обновление технического комментария;
    buy - Покупка прокси;
    prolong - Продление списка прокси;
    delete - Удаление прокси;
    check - Проверка валидности прокси.
    ipauth - Привязка/удаление авторизации прокси по ip.

При обращении к любому методу api, либо к api без метода (только с ключом: https://px6.link/api/{api_key}), в ответе всегда будут присутствовать следующие значения:

Успешный ответ:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB"
}

    status - Всегда "yes", если успешный ответ и не возникло ошибок;
    user_id - Номер вашего аккаунта;
    balance - Текущее состояние вашего баланса;
    currency - Валюта вашего аккаунта (RUB, либо USD).

Ошибочный ответ:

{
 "status": "no",
 "error_id": 100,
 "error": "Error key"
}

    status - Всегда "no", если ошибочный ответ;
    error_id - Номер ошибки;
    error - Описание ошибки.


Метод "getprice"
Используется для получения информации о сумме заказа в зависимости от версии, периода и кол-ва прокси.

Параметры метода:

    count - (Обязательный) - Кол-во прокси;
    period - (Обязательный) - Период - кол-во дней;
    version - Версия прокси: 4 - IPv4, 3 - IPv4 Shared, 6 - IPv6 (по-умолчанию).

https://px6.link/api/{api_key}/getprice?count=100&period=30


В примере выше мы получаем информацию о стоимости 100 IPv6 прокси на 30 дней.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB",
 "price": 1800,
 "price_single": 0.6,
 "period": 30,
 "count": 100
}

    price - Итоговая стоимость;
    price_single - Стоимость одного прокси;
    period - Запрошенный период (кол-во дней);
    count - Запрошенное кол-во прокси.


Метод "getcount"
Используется для получения информации о доступном для приобретения кол-ве прокси определенной страны.

Параметры метода:

    country - (Обязательный) - Код страны в формате iso2;
    version - Версия прокси: 4 - IPv4, 3 - IPv4 Shared, 6 - IPv6 (по-умолчанию).

https://px6.link/api/{api_key}/getcount?country=ru


В примере выше мы получаем информацию о доступном для приобретения кол-ве российских IPv6 прокси.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB",
 "count": 971
}

    count - Доступное кол-во.


Метод "getcountry"
Используется для получения информации о доступных для приобретения странах.

Параметры метода:

    version - Версия прокси: 4 - IPv4, 3 - IPv4 Shared, 6 - IPv6 (по-умолчанию).

https://px6.link/api/{api_key}/getcountry?version=4


В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB",
 "list": ["ru","ua","us"]
}

    list - Массив доступных стран в формате iso2.


Метод "getproxy"
Используется для получения списка ваших прокси.

Параметры метода:

    state - Состояние возвращаемых прокси. Доступные значения: active - Активные, expired - Неактивные, expiring - Заканчивающиеся, all - Все (по-умолчанию);
    descr - Технический комментарий, который вы указывали при покупке прокси. Если данный параметр присутствует, то будут выбраны только те прокси, у которых присутствует данный комментарий, если же данный параметр не задан, то будут выбраны все прокси;
    nokey - При добавлении данного параметра (значение не требуется), список list будет возвращаться без ключей;
    page - Номер страницы для вывода. 1 - по-умолчанию;
    limit - Кол-во прокси для вывода в списке. 1000 - по-умолчанию (максимальное значение).

https://px6.link/api/{api_key}/getproxy


В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB",
 "list_count": 4,
 "list": {
   "11": {
      "id": "11",
      "ip": "2a00:1838:32:19f:45fb:2640::330",
      "host": "185.22.134.250",
      "port": "7330",
      "user": "5svBNZ",
      "pass": "iagn2d",
      "type": "http",
      "country": "ru",
      "date": "2016-06-19 16:32:39",
      "date_end": "2016-07-12 11:50:41",
      "unixtime": 1466379159,
      "unixtime_end": 1468349441,
      "descr": "",
      "active": "1"
   },
   "14": {
      "id": "14",
      "ip": "2a00:1838:32:198:56ec:2696::386",
      "host": "185.22.134.242",
      "port": "7386",
      "user": "nV5TFK",
      "pass": "3Itr1t",
      "type": "http",
      "country": "ru",
      "date": "2016-06-27 16:06:22",
      "date_end": "2016-07-11 16:06:22",
      "unixtime": 1466379159,
      "unixtime_end": 1468349441,
      "descr": "",
      "active": "1"
   }
 }
}

    list_count - Кол-во прокси (на странице);
    list - Массив прокси;
        id - Внутренний номер прокси, необходим для продления срока действия - метод prolong
        ip - IPv4, либо IPv6 скрытый за host:port - зависит от версии прокси;
        host - IPv4;
        port - Порт;
        user - Логин;
        pass - Пароль;
        type - Тип прокси: http - HTTPS, socks - SOCKS5;
        country - Страна (iso2);
        date - Дата покупки прокси;
        date_end - Дата окончания срока действия прокси;
        descr - Технический комментарий;
        active - Активный (1) или нет (0).


Метод "settype"
Используется для изменения типа (протокола) у списка прокси.

Параметры метода:

    ids - (Обязательный) - Перечень внутренних номеров прокси в нашей системе, через запятую;
    type - (Обязательный) - Устанавливаемый тип (протокол): http - HTTPS, либо socks - SOCKS5.

https://px6.link/api/{api_key}/settype?ids=10,11,12,15&type=socks


В примере выше мы изменяем тип прокси с номерами 10,11,12,15 на SOCKS5.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB"
}


В случае успешного изменения типа, метод не возвращает в ответе никаких новых данных.
В случае, если ВСЕ прокси, у которых вы хотите изменить тип (переданные через параметр ids), уже имеют соответствующий тип (протокол), то вернется ошибочный ответ с номером 30 (Error unknown).


Метод "setdescr"
Используется для обновления технического комментария у списка прокси, который был установлен при покупке (метод buy).

Параметры метода:

    new - (Обязательный) - Технический комментарий, на который нужно изменить. Максимальная длина 50 символов;
    old - Технический комментарий, который нужно изменить;
    ids - Перечень внутренних номеров прокси в нашей системе, через запятую.

Обязательно должен присутствовать один из параметров, либо ids, либо old.

https://px6.link/api/{api_key}/setdescr?old=test&new=newtest


В примере выше мы изменяем комментарий с test на newtest.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB",
 "count": 4
}

    count - Кол-во прокси у которых был изменен комментарий.


Метод "buy"
Используется для покупки прокси.

Параметры метода:

    count - (Обязательный) - Кол-во прокси для покупки;
    period - (Обязательный) - Период на который покупаются прокси - кол-во дней;
    country - (Обязательный) - Страна в формате iso2;
    version - Версия прокси: 4 - IPv4, 3 - IPv4 Shared, 6 - IPv6 (по-умолчанию);
    type - Тип прокси (протокол): socks, либо http (по-умолчанию);
    descr - Технический комментарий для списка прокси, максимальная длина 50 символов. Указание данного параметра позволит вам делать выборку списка прокси про этому параметру через метод getproxy
    auto_prolong - При добавлении данного параметра (значение не требуется), у купленных прокси будет включено автопродление;
    nokey - При добавлении данного параметра (значение не требуется), список list будет возвращаться без ключей.

https://px6.link/api/{api_key}/buy?count=1&period=7&country=ru


В примере выше мы покупаем 1 российский IPv6 прокси на 7 дней.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": 42.5,
 "currency": "RUB",
 "order_id": 12345,
 "count": 1,
 "price": 6.3,
 "period": 7,
 "country": "ru",
 "list": {
   "15": {
      "id": "15",
      "ip": "2a00:1838:32:19f:45fb:2640::330",
      "host": "185.22.134.250",
      "port": "7330",
      "user": "5svBNZ",
      "pass": "iagn2d",
      "type": "http",
      "date": "2016-06-19 16:32:39",
      "date_end": "2016-07-12 11:50:41",
      "unixtime": 1466379159,
      "unixtime_end": 1468349441,
      "active": "1"
   }
 }
}

    order_id - Номер заказа в нашей системе;
    count - Запрошенное кол-во прокси для покупки;
    price - Итоговая стоимость;
    price_single - Стоимость одного прокси для указанного кол-ва и периода;
    period - Запрошенный период для покупки (кол-во дней);
    country - Локация (страна) прокси для покупки в формате iso2;
    list - Массив купленных прокси;
        id - Внутренний номер прокси, необходим для продления срока действия - метод prolong
        ip - IPv6 скрытый за host:port;
        host - IPv4;
        port - Порт;
        user - Логин;
        pass - Пароль;
        type - Тип прокси: http - HTTPS, socks - SOCKS5;
        date - Дата покупки прокси;
        date_end - Дата окончания срока действия прокси;
        active - Активный (1) или нет (0).


Метод "prolong"
Используется для продления текущих прокси.

Параметры метода:

    period - (Обязательный) - Период продления - кол-во дней;
    ids - (Обязательный) - Перечень внутренних номеров прокси в нашей системе, через запятую;
    nokey - При добавлении данного параметра (значение не требуется), список list будет возвращаться без ключей.

https://px6.link/api/{api_key}/prolong?period=7&ids=15,16


В примере выше мы продляем прокси с номерами 15 и 16 на 7 дней.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": 29,
 "currency": "RUB",
 "order_id": 12345,
 "price": 12.6,
 "period": 7,
 "count": 2,
 "list": {
   "15": {
      "id": 15,
      "date_end": "2016-07-15 06:30:27",
      "unixtime_end": 1466379159
   },
   "16": {
      "id": 16,
      "date_end": "2016-07-16 09:31:21",
      "unixtime_end": 1466379261
   }
 }
}

    order_id - Номер заказа в нашей системе;
    price - Итоговая стоимость продления;
    price_single - Стоимость одного прокси для указанного кол-ва и периода (отсутствует при продлении смешанного типа прокси);
    period - Запрошенный период для продления (кол-во дней);
    count - Кол-во успешных продлений;
    list - Массив продленных прокси;
        id - Внутренний номер прокси;
        date_end - Новая дата окончания срока действия прокси.


Метод "delete"
Используется для удаления прокси.

Параметры метода:

    ids - (Обязательный) - Перечень внутренних номеров прокси в нашей системе, через запятую;
    descr - (Обязательный) - Технический комментарий, который вы указывали при покупке прокси, либо через метод setdescr.

Обязательно должен присутствовать один из параметров, либо ids, либо descr.

https://px6.link/api/{api_key}/delete?ids=15,16


В примере выше мы удаляем прокси с номерами 15 и 16.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB",
 "count": 4
}

    count - Кол-во удаленных прокси.


Метод "check"
Используется для проверки валидности (работоспособности) прокси.

Параметры метода:

    ids - (Обязательный: если не указан proxy) - Внутренний номер прокси в нашей системе.
    proxy - (Обязательный: если не указан ids) - Строка прокси в формате: ip:port:user:pass.

https://px6.link/api/{api_key}/check?ids=15


В примере выше мы проверяем прокси с номером 15.

https://px6.link/api/{api_key}/check?proxy=192.168.1.1:8000:user:pass


В примере выше мы проверяем прокси с ip 192.168.1.1, порт 8000, логином user и паролем pass.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB",
 "proxy_id": 15,
 "proxy_status": true
}

    proxy_id - Внутренник номер прокси;
    proxy_status - Результат проверки: true или false.


Метод "ipauth"
Используется для привязки, либо удаления авторизации прокси по ip.

Параметры метода:

    ip - (Обязательный) - Список привязываемых ip-адресов через запятую, либо "delete" -  для удаления привязки.

https://px6.link/api/{api_key}/ipauth?ip=45.155.202.18,31.121.11.123


В примере выше мы привязываем ip: 45.155.202.18, 31.121.11.123 ко всем своим прокси.
В случае успешного ответа:

{
 "status": "yes",
 "user_id": "1",
 "balance": "48.80",
 "currency": "RUB"
}


В случае успешной привязки/удаления, метод не возвращает в ответе никаких новых данных.

Коды ошибок

30 - Error unknown - Неизвестная ошибка
100 - Error key - Ошибка авторизации, неверный ключ
105 - Error ip - Доступ к API произошел с неверного IP (если включено ограничение), либо некорректный формат IP адреса
110 - Error method - Ошибочный метод
200 - Error count - Ошибка кол-ва прокси, неверно указано кол-во, либо отсутствует
210 - Error period - Ошибка периода, неверно указано кол-во (дней), либо отсутствует
220 - Error country - Ошибка страны, неверно указана страна (страны указываются в формате iso2), либо отсутствует
230 - Error ids - Ошибка списка номеров прокси. Номера прокси должны быть указаны через запятую
240 - Error version - Некорректно указана версия прокси
250 - Error descr - Ошибка технического комментария, неверно указан, либо отсутствует
260 - Error type - Ошибка типа (протокола) прокси, неверно указан, либо отсутствует
270 - Error port - Ошибка порта прокси, неверно указан, либо отсутствует
280 - Error proxy str - Ошибка строки прокси для метода check, неверно указан
300 - Error active proxy allow - Ошибка кол-ва прокси. Возникает при попытке покупки большего кол-ва прокси, чем доступно на сервисе
400 - Error no money - Ошибка баланса. На вашем балансе отсутствуют средства, либо их не хватает для покупки запрашиваемого кол-ва прокси
404 - Error not found - Ошибка поиска. Возникает когда запрашиваемый элемент не найден
410 - Error price - Ошибка расчета стоимости. Итоговая стоимость меньше, либо равна нулю
PROXY6.net
Персональные прокси сервера
© 2016 – 2025 «PROXY6»

    support@proxy6.net

    Купить прокси
    Цены
    FAQ
    Блог
    API
    Условия использования
    Контакты


const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ---------- ЛОГГЕР ----------
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase(); // error|warn|info|debug
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const canLog = (lvl) => (levels[lvl] ?? 2) <= (levels[LOG_LEVEL] ?? 2);
const log = {
  error: (...a) => canLog('error') && console.error(...a),
  warn:  (...a) => canLog('warn')  && console.warn(...a),
  info:  (...a) => canLog('info')  && console.log(...a),
  debug: (...a) => canLog('debug') && console.log(...a),
};
const MAX_BODY_LOG = parseInt(process.env.MAX_BODY_LOG || '500', 10); // 0 — не логировать тела
const safeJson = (obj) => {
  try {
    const s = JSON.stringify(obj);
    if (MAX_BODY_LOG <= 0) return '[hidden]';
    if (s.length > MAX_BODY_LOG) return s.slice(0, MAX_BODY_LOG) + '…(truncated)';
    return s;
  } catch { return '[unserializable]'; }
};

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPER_ADMIN_ID = parseInt(process.env.SUPER_ADMIN_ID);
const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL || 'https://railway-proxy-server-production-58a1.up.railway.app';

// Конфигурация PROXY6
const PROXY6_CONFIG = {
    API_KEY: process.env.PROXY6_API_KEY,
    BASE_URL: 'https://proxy6.net/api'
};

// Единые настройки покупки прокси (по умолчанию: 20 штук на 7 дней, RU, IPv4 shared)
const PURCHASE_DEFAULTS = {
    count: parseInt(process.env.PROXY_BUY_COUNT || '20', 10),
    period: parseInt(process.env.PROXY_BUY_PERIOD || '7', 10),
    country: process.env.PROXY_BUY_COUNTRY || 'ru',
    version: parseInt(process.env.PROXY_BUY_VERSION || '3', 10)
};

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Файлы конфигурации
const CLIENTS_FILE = path.join(__dirname, 'clients.json');
const ADMINS_FILE = path.join(__dirname, 'admins.json');

// Загрузка конфигураций
let clients = {}; // { adminId: { clientName: { password, proxies, proxy6_order_id, proxy_expires_at } } }
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

// Клавиатура для супер-админа
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
                { text: '💰 Проверка баланса' },
                { text: '📦 Наличие RU shared' }
            ]
        ],
        resize_keyboard: true,
        persistent: true
    }
};

// ===== PROXY6 API =====
async function checkProxy6Balance() {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return { success: false, error: 'API ключ PROXY6 не настроен' };
        }
        const response = await axios.get(`${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}`, { timeout: 10000 });
        if (response.data.status === 'yes') {
            return {
                success: true,
                balance: response.data.balance,
                currency: response.data.currency,
                user_id: response.data.user_id
            };
        } else {
            return { success: false, error: response.data.error || 'Неизвестная ошибка' };
        }
    } catch (error) {
        log.error('Ошибка при проверке баланса PROXY6:', error.message);
        return { success: false, error: 'Ошибка соединения с PROXY6' };
    }
}

// Получение цены (используем те же параметры, что и при покупке)
async function getProxy6Price(count = PURCHASE_DEFAULTS.count, period = PURCHASE_DEFAULTS.period, version = PURCHASE_DEFAULTS.version) {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return { success: false, error: 'API ключ PROXY6 не настроен' };
        }
        const url = `${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}/getprice?count=${count}&period=${period}&version=${version}`;
        const response = await axios.get(url, { timeout: 10000 });
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
            return { success: false, error: response.data.error || 'Ошибка получения цены' };
        }
    } catch (error) {
        log.error('Ошибка при получении цены PROXY6:', error.message);
        return { success: false, error: 'Ошибка соединения с PROXY6' };
    }
}

// Получение доступного количества прокси (по стране и версии)
// По задаче: RU + IPv4 Shared (version=3)
async function getProxy6Count(country = 'ru', version = 3) {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return { success: false, error: 'API ключ PROXY6 не настроен' };
        }
        const url = `${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}/getcount?country=${country}&version=${version}`;
        const response = await axios.get(url, { timeout: 10000 });
        if (response.data.status === 'yes') {
            return {
                success: true,
                count: response.data.count,
                balance: response.data.balance,
                currency: response.data.currency
            };
        } else {
            return { success: false, error: response.data.error || 'Ошибка получения количества' };
        }
    } catch (error) {
        log.error('Ошибка при получении доступности PROXY6:', error.message);
        return { success: false, error: 'Ошибка соединения с PROXY6' };
    }
}


// Покупка
async function buyProxy6(count = PURCHASE_DEFAULTS.count, period = PURCHASE_DEFAULTS.period, country = PURCHASE_DEFAULTS.country, version = PURCHASE_DEFAULTS.version, descr = '') {
    try {
        if (!PROXY6_CONFIG.API_KEY) {
            return { success: false, error: 'API ключ PROXY6 не настроен' };
        }
        const url = `${PROXY6_CONFIG.BASE_URL}/${PROXY6_CONFIG.API_KEY}/buy?count=${count}&period=${period}&country=${country}&version=${version}&descr=${encodeURIComponent(descr)}`;
        const response = await axios.get(url, { timeout: 15000 });
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
        log.error('Ошибка при покупке прокси PROXY6:', error.message);
        return { success: false, error: 'Ошибка соединения с PROXY6' };
    }
}

// Форматирование списка прокси
function formatProxiesFromProxy6(proxies) {
    const formatted = [];
    for (const proxyId in proxies) {
        const p = proxies[proxyId];
        formatted.push(`${p.host}:${p.port}:${p.user}:${p.pass}`); // host:port:user:pass
    }
    return formatted;
}

// ===== CORE =====
function loadClients() {
    try {
        if (fs.existsSync(CLIENTS_FILE)) {
            const data = fs.readFileSync(CLIENTS_FILE, 'utf8');
            clients = JSON.parse(data);
        }
    } catch (error) {
        log.error('❌ Ошибка загрузки клиентов:', error.message);
        clients = {};
    }
}
function saveClients() {
    try {
        fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
        log.debug('💾 Конфигурация клиентов сохранена');
    } catch (error) {
        log.error('❌ Ошибка сохранения клиентов:', error.message);
    }
}
function loadAdmins() {
    try {
        if (fs.existsSync(ADMINS_FILE)) {
            const data = fs.readFileSync(ADMINS_FILE, 'utf8');
            admins = JSON.parse(data);
        }
    } catch (error) {
        log.error('❌ Ошибка загрузки админов:', error.message);
        admins = [];
    }
}
function saveAdmins() {
    try {
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2));
        log.debug('💾 Конфигурация админов сохранена');
    } catch (error) {
        log.error('❌ Ошибка сохранения админов:', error.message);
    }
}
function getAdminClients(adminId) {
    if (!clients[adminId]) clients[adminId] = {};
    return clients[adminId];
}
function getAllClients() {
    const all = {};
    for (const [adminId, adminClients] of Object.entries(clients)) {
        for (const [clientName, clientData] of Object.entries(adminClients)) {
            all[`${clientName}_${adminId}`] = {
                ...clientData,
                adminId,
                originalName: clientName
            };
        }
    }
    return all;
}
function findClientByName(clientName, adminId = null) {
    if (adminId) {
        const adminClients = getAdminClients(adminId);
        if (adminClients[clientName]) {
            return { client: adminClients[clientName], adminId, clientName };
        }
    } else {
        for (const [aId, adminClients] of Object.entries(clients)) {
            if (adminClients[clientName]) {
                return { client: adminClients[clientName], adminId: aId, clientName };
            }
        }
    }
    return null;
}

// Прокси-сервер
async function makeProxyServerRequest(endpoint, method = 'GET', data = null, auth = null) {
    try {
        const config = {
            method,
            url: `${PROXY_SERVER_URL}${endpoint}`,
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        };
        if (auth) config.auth = auth;
        if (data && method !== 'GET') config.data = data;

        log.debug(`HTTP ${method} ${config.url}`);
        if (data) log.debug('HTTP body:', safeJson(data));

        const response = await axios(config);
        return response.data;
    } catch (error) {
        const status = error?.response?.status;
        const body = error?.response?.data;
        log.warn(`HTTP ${method} ${PROXY_SERVER_URL}${endpoint} failed: ${status || error.message}`);
        if (status) log.debug('HTTP error body:', safeJson(body));
        throw error;
    }
}

// Добавление массива прокси по одному: { clientName, proxy }
async function addProxiesToServer(clientName, proxies) {
    let ok = 0, fail = 0, errors = [];
    for (const proxy of proxies) {
        try {
            await makeProxyServerRequest('/api/add-proxy', 'POST', { clientName, proxy });
            ok++;
        } catch (e) {
            // Fallback на старый формат, если вдруг доступен
            try {
                await makeProxyServerRequest('/api/add-proxy', 'POST', { name: clientName, proxies: [proxy] });
                ok++;
            } catch (e2) {
                fail++;
                const msg = e2?.response?.data ? safeJson(e2.response.data) : e2.message;
                log.warn(`add-proxy failed for ${clientName}: ${msg}`);
                errors.push(msg);
            }
        }
    }
    log.info(`addProxiesToServer(${clientName}): added=${ok}, failed=${fail}`);
    return { ok, fail, errors };
}

async function deleteClientFromServer(clientName) {
    try {
        log.debug(`HTTP DELETE ${PROXY_SERVER_URL}/api/delete-client/${clientName}`);
        const response = await axios.delete(`${PROXY_SERVER_URL}/api/delete-client/${clientName}`, {
            timeout: 10000,
            headers: { 'Accept': 'application/json' }
        });
        log.info(`Клиент ${clientName} удален с сервера`);
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            log.info(`Клиент ${clientName} уже отсутствует на сервере`);
            return { success: true, data: { message: 'Client not found on server' } };
        }
        log.error('❌ Ошибка удаления клиента с сервера:', error.message);
        return { success: false, error: error.message };
    }
}
async function getCurrentProxy(clientName, password) {
    try {
        return await makeProxyServerRequest(`/current`, 'GET', null, { username: clientName, password });
    } catch (error) {
        throw new Error(`Ошибка получения текущего прокси: ${error.message}`);
    }
}
async function getMyIP(clientName, password) {
    try {
        return await makeProxyServerRequest(`/myip`, 'GET', null, { username: clientName, password });
    } catch (error) {
        throw new Error(`Ошибка получения IP: ${error.message}`);
    }
}

// Обновлено: устойчивость к 409 и досылка прокси
async function syncAllClientsToServer(adminId = null) {
    const results = { success: 0, failed: 0, errors: [] };
    const toSync = adminId ? { [adminId]: getAdminClients(adminId) } : clients;

    for (const [aId, adminClients] of Object.entries(toSync)) {
        for (const [clientName, clientData] of Object.entries(adminClients)) {
            try {
                log.debug(`🔄 Синхронизация клиента ${clientName} (Admin: ${aId})`);
                try {
                    await makeProxyServerRequest('/api/add-client', 'POST', {
                        clientName,
                        password: clientData.password,
                        proxies: (clientData.proxies || []).map(formatProxyForRailway).filter(Boolean)
                    });
                    log.debug(`✅ Клиент ${clientName} создан/обновлен через add-client`);
                    results.success++;
                } catch (err) {
                    const status = err?.response?.status;
                    if (status === 409) {
                        log.debug(`ℹ️ Клиент ${clientName} уже существует (409). Досылаю прокси через add-proxy...`);
                        try {
                            const proxies = (clientData.proxies || []).map(formatProxyForRailway).filter(Boolean);
                            if (proxies.length > 0) {
                                const res = await addProxiesToServer(clientName, proxies);
                                log.info(`Синхронизирован ${clientName} через add-proxy: added=${res.ok}, failed=${res.fail}`);
                            }
                            results.success++;
                        } catch (addProxyErr) {
                            log.error(`❌ Ошибка add-proxy для ${clientName}:`, addProxyErr.message);
                            results.failed++;
                            results.errors.push(`${clientName}: add-proxy failed: ${addProxyErr.message}`);
                        }
                    } else {
                        throw err;
                    }
                }
            } catch (error) {
                log.error(`❌ Ошибка синхронизации клиента ${clientName}:`, error.message);
                results.failed++;
                results.errors.push(`${clientName}: ${error.message}`);
            }
        }
    }
    return results;
}

// Авторизация
function isAuthorized(userId) {
    return userId === SUPER_ADMIN_ID || admins.includes(userId);
}
function isSuperAdmin(userId) {
    return userId === SUPER_ADMIN_ID;
}
function getKeyboardForUser(userId) {
    return isSuperAdmin(userId) ? superAdminKeyboard : adminKeyboard;
}

// Состояния
const userStates = {};

// ===== ЛОГИКА ПОКУПКИ ПРОКСИ =====
async function handleAddUserWithPurchase(chatId, userId) {
    try {
        if (!isAuthorized(userId)) {
            await bot.sendMessage(chatId, '❌ У вас нет прав для выполнения этой операции.');
            return;
        }
        const balanceCheck = await checkProxy6Balance();
        if (!balanceCheck.success) {
            await bot.sendMessage(chatId, `❌ Ошибка подключения к PROXY6: ${balanceCheck.error}`);
            return;
        }

        const priceCheck = await getProxy6Price(PURCHASE_DEFAULTS.count, PURCHASE_DEFAULTS.period, PURCHASE_DEFAULTS.version);
        if (!priceCheck.success) {
            await bot.sendMessage(chatId, `❌ Ошибка получения цены: ${priceCheck.error}`);
            return;
        }

        if (parseFloat(balanceCheck.balance) < priceCheck.price) {
            await bot.sendMessage(
                chatId,
                `❌ Недостаточно средств на балансе PROXY6!\n\n` +
                `💰 Текущий баланс: ${balanceCheck.balance} ${balanceCheck.currency}\n` +
                `💸 Необходимо: ${priceCheck.price} ${priceCheck.currency}\n` +
                `📊 Цена за ${PURCHASE_DEFAULTS.count} shared прокси на ${PURCHASE_DEFAULTS.period} дней`
            );
            return;
        }

        userStates[userId] = {
            action: 'add_user_with_purchase',
            adminId: userId,
            step: 'waiting_username',
            count: PURCHASE_DEFAULTS.count,
            period: PURCHASE_DEFAULTS.period,
            country: PURCHASE_DEFAULTS.country,
            version: PURCHASE_DEFAULTS.version
        };

        await bot.sendMessage(
            chatId,
            `✅ Готов к покупке прокси!\n\n` +
            `💰 Баланс PROXY6: ${balanceCheck.balance} ${balanceCheck.currency}\n` +
            `💸 Стоимость: ${priceCheck.price} ${priceCheck.currency}\n` +
            `📦 Количество: ${PURCHASE_DEFAULTS.count} shared прокси на ${PURCHASE_DEFAULTS.period} дней\n\n` +
            `👤 Введите логин для нового клиента:`
        );

    } catch (error) {
        log.error('Ошибка в handleAddUserWithPurchase:', error.message);
        await bot.sendMessage(chatId, '❌ Произошла ошибка при подготовке к покупке прокси.');
    }
}

// Создание пользователя + покупка
async function createUserWithProxyPurchase(userData) {
    try {
        const count = userData.count ?? PURCHASE_DEFAULTS.count;
        const period = userData.period ?? PURCHASE_DEFAULTS.period;
        const country = userData.country ?? PURCHASE_DEFAULTS.country;
        const version = userData.version ?? PURCHASE_DEFAULTS.version;

        const purchaseResult = await buyProxy6(count, period, country, version, `user_${userData.username}`);
        if (!purchaseResult.success) {
            return { success: false, error: `Ошибка покупки прокси: ${purchaseResult.error}` };
        }

        const formattedProxies = formatProxiesFromProxy6(purchaseResult.proxies);
        const adminClients = getAdminClients(userData.adminId);
        adminClients[userData.username] = {
            password: userData.password,
            proxies: formattedProxies,
            proxy6_order_id: purchaseResult.order_id,
            proxy6_descr: `user_${userData.username}`,
            created_at: new Date().toISOString(),
            proxy_expires_at: new Date(Date.now() + (period * 24 * 60 * 60 * 1000)).toISOString()
        };
        saveClients();

        const partialNote = formattedProxies.length < count
            ? `\n⚠️ Внимание: заказано ${count}, но получено ${formattedProxies.length}. Возможно, ограничение наличия на PROXY6.`
            : '';

        return {
            success: true,
            user: adminClients[userData.username],
            username: userData.username,
            purchase_info: {
                order_id: purchaseResult.order_id,
                price: purchaseResult.price,
                count: purchaseResult.count,
                period: purchaseResult.period,
                balance_remaining: purchaseResult.balance,
                currency: purchaseResult.currency
            },
            partialNote
        };
    } catch (error) {
        log.error('Ошибка при создании пользователя с покупкой прокси:', error.message);
        return { success: false, error: 'Ошибка создания пользователя' };
    }
}

// Покупка прокси для существующего клиента
async function buyProxiesForExistingClient({ adminId, clientName, count = PURCHASE_DEFAULTS.count, period = PURCHASE_DEFAULTS.period, country = PURCHASE_DEFAULTS.country, version = PURCHASE_DEFAULTS.version }) {
    try {
        if (!PROXY6_CONFIG.API_KEY) return { success: false, error: 'API ключ PROXY6 не настроен' };

        const purchaseResult = await buyProxy6(count, period, country, version, `user_${clientName}`);
        if (!purchaseResult.success) {
            return { success: false, error: `Ошибка покупки прокси: ${purchaseResult.error}` };
        }

        const formattedProxies = formatProxiesFromProxy6(purchaseResult.proxies);
        const adminClients = getAdminClients(adminId);
        if (!adminClients[clientName]) {
            return { success: false, error: `Клиент ${clientName} не найден` };
        }

        if (!Array.isArray(adminClients[clientName].proxies)) adminClients[clientName].proxies = [];
        adminClients[clientName].proxies.push(...formattedProxies);
        adminClients[clientName].proxy6_order_id = purchaseResult.order_id;
        adminClients[clientName].proxy6_descr = `user_${clientName}`;
        adminClients[clientName].proxy_expires_at = new Date(Date.now() + (period * 24 * 60 * 60 * 1000)).toISOString();
        saveClients();

        try {
            const mapped = formattedProxies.map(formatProxyForRailway).filter(Boolean);
            const res = await addProxiesToServer(clientName, mapped);
            log.info(`add-proxy summary for ${clientName}: added=${res.ok}, failed=${res.fail}`);
        } catch (err) {
            log.error('❌ Ошибка добавления купленных прокси на сервер:', err.message);
        }

        const partialNote = formattedProxies.length < count
            ? `\n⚠️ Внимание: заказано ${count}, но получено ${formattedProxies.length}. Возможно, ограничение наличия на PROXY6.`
            : '';

        return {
            success: true,
            clientName,
            adminId,
            addedCount: formattedProxies.length,
            partialNote,
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
        log.error('Ошибка в buyProxiesForExistingClient:', error.message);
        return { success: false, error: 'Внутренняя ошибка при покупке прокси' };
    }
}

async function handleConfirmPurchase(chatId, userId) {
    const userState = userStates[userId];
    if (!userState || userState.action !== 'add_user_with_purchase') {
        await bot.sendMessage(chatId, '❌ Сессия истекла. Начните заново.');
        return;
    }
    try {
        await bot.sendMessage(chatId, '⏳ Покупаю прокси и создаю клиента...');

        const result = await createUserWithProxyPurchase({
            username: userState.username,
            password: userState.password,
            adminId: userState.adminId,
            count: userState.count,
            period: userState.period,
            country: userState.country,
            version: userState.version
        });

        if (result.success) {
            const purchaseInfo = result.purchase_info;
            const proxiesText = result.user.proxies.map((proxy, i) => `${i + 1}. ${proxy}`).join('\n');

            try {
                await makeProxyServerRequest('/api/add-client', 'POST', {
                    clientName: result.username,
                    password: result.user.password,
                    proxies: result.user.proxies.map(formatProxyForRailway).filter(Boolean)
                });
                log.info(`Клиент ${result.username} добавлен на прокси сервер`);
            } catch (error) {
                log.error('❌ Ошибка добавления клиента на прокси сервер:', error.message);
            }

            await bot.sendMessage(
                chatId,
                `✅ Клиент успешно создан и прокси куплены!\n\n` +
                `👤 Логин: ${result.username}\n` +
                `🔐 Пароль: ${result.user.password}\n\n` +
                (proxiesText ? `📦 Купленные прокси:\n${proxiesText}\n\n` : '') +
                (result.partialNote || '') + '\n' +
                `💰 Информация о покупке:\n` +
                `🆔 Заказ: ${purchaseInfo.order_id}\n` +
                `💸 Стоимость: ${purchaseInfo.price} ${purchaseInfo.currency || 'RUB'}\n` +
                `📊 Количество: ${purchaseInfo.count} прокси\n` +
                `⏰ Период: ${purchaseInfo.period} дней\n` +
                `💳 Остаток баланса: ${purchaseInfo.balance_remaining} ${purchaseInfo.currency || 'RUB'}`,
                getKeyboardForUser(userId)
            );
        } else {
            await bot.sendMessage(chatId, `❌ Ошибка создания клиента: ${result.error}`, getKeyboardForUser(userId));
        }
    } catch (error) {
        log.error('Ошибка в handleConfirmPurchase:', error.message);
        await bot.sendMessage(chatId, '❌ Произошла ошибка при создании клиента.', getKeyboardForUser(userId));
    } finally {
        delete userStates[userId];
    }
}

// ===== ОБРАБОТЧИКИ СООБЩЕНИЙ =====
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!isAuthorized(userId)) {
        await bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту');
        return;
    }

    const superAdmin = isSuperAdmin(userId);

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

    // Добавить клиента с покупкой
    if (text === '🛒 Добавить с покупкой' || text === '/addclientwithpurchase') {
        log.debug(`🛒 Команда добавления клиента с покупкой от userId=${userId}`);
        await handleAddUserWithPurchase(chatId, userId);
        return;
    }

    // Купить прокси существующему клиенту
    if (text === '🛍 Купить прокси клиенту' || text === '/buy-proxy') {
        log.debug(`🛍 Команда покупки прокси для клиента от userId=${userId}`);

        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);
        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '❌ Нет клиентов для покупки прокси');
            return;
        }

        userStates[userId] = {
            action: 'buying_proxy',
            step: 'waiting_client_name',
            count: PURCHASE_DEFAULTS.count,
            period: PURCHASE_DEFAULTS.period,
            country: PURCHASE_DEFAULTS.country,
            version: PURCHASE_DEFAULTS.version
        };

        let message = `🛍 Покупка прокси для клиента

Отправьте имя клиента, которому нужно купить ${PURCHASE_DEFAULTS.count} shared прокси на ${PURCHASE_DEFAULTS.period} дней.

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

    // Проверка баланса (суперадмин)
    if (text === '💰 Проверка баланса' || text === '/proxy6-balance') {
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
            const priceResult = await getProxy6Price(PURCHASE_DEFAULTS.count, PURCHASE_DEFAULTS.period, PURCHASE_DEFAULTS.version);
            let message = `💰 Баланс PROXY6:\n\n` +
                         `💳 Текущий баланс: ${balanceResult.balance} ${balanceResult.currency}\n` +
                         `🆔 ID аккаунта: ${balanceResult.user_id}\n`;
            if (priceResult.success) {
                const canBuy = Math.floor(parseFloat(balanceResult.balance) / priceResult.price);
                message += `\n📊 Стоимость ${PURCHASE_DEFAULTS.count} shared прокси на ${PURCHASE_DEFAULTS.period} дней: ${priceResult.price} ${balanceResult.currency}\n` +
                           `🛒 Можно купить: ${canBuy} таких заказов`;
            }
            await bot.sendMessage(chatId, message);
        } else {
            await bot.sendMessage(chatId, `❌ Ошибка проверки баланса: ${balanceResult.error}`);
        }
        return;
    }

    // Добавить клиента с готовыми прокси
    if (text === '📥 Добавить клиента с прокси' || text === '/addclientwithproxies') {
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

    // Синхронизация
    if (text === '🔄 Синхронизация' || text === '/sync') {
        await bot.sendMessage(chatId, '🔄 Начинаю синхронизацию клиентов с сервером...');
        try {
            const results = await syncAllClientsToServer(superAdmin ? null : userId);
            log.info(`Sync finished: ok=${results.success} fail=${results.failed}`);

            let message = `✅ Синхронизация завершена!

📊 Результаты:
✅ Успешно: ${results.success}
❌ Ошибок: ${results.failed}`;
    // Проверка доступности RU IPv4 Shared (только супер-админ)
    if (text === '📦 Наличие RU shared' || text === '/proxy6-ru-shared') {
        if (!superAdmin) {
            await bot.sendMessage(chatId, '❌ Эта команда доступна только супер-админу');
            return;
        }
        if (!PROXY6_CONFIG.API_KEY) {
            await bot.sendMessage(chatId, '❌ API ключ PROXY6.net не настроен');
            return;
        }

        await bot.sendMessage(chatId, '⏳ Проверяю наличие российских IPv4 Shared прокси на PROXY6...');
        const result = await getProxy6Count('ru', 3); // RU + IPv4 Shared

        if (result.success) {
            const perOrder = PURCHASE_DEFAULTS.count || 20;
            const batches = perOrder > 0 ? Math.floor(result.count / perOrder) : 0;
            const msgText =
                `📦 Доступность на PROXY6\n\n` +
                `🇷🇺 Страна: RU\n` +
                `🔁 Тип: IPv4 Shared\n` +
                `✅ Доступно к покупке: ${result.count} шт.\n` +
                (perOrder > 0 ? `🧮 Заказов по ${perOrder} шт: ${batches}\n` : '') +
                (result.balance ? `\n💳 Баланс: ${result.balance} ${result.currency || 'RUB'}` : '');
            await bot.sendMessage(chatId, msgText, getKeyboardForUser(userId));
        } else {
            await bot.sendMessage(chatId, `❌ Ошибка: ${result.error}`, getKeyboardForUser(userId));
        }
        return;
    }

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
        userStates[userId] = { action: 'adding_client' };
        await bot.sendMessage(chatId, `➕ Добавление клиента

📝 Отправьте данные в формате:
\`логин пароль\`

Например: \`user123 pass456\`

👤 Клиент будет добавлен в вашу группу`, { parse_mode: 'Markdown' });
        return;
    }

    if (text === '🗑️ Удалить клиента' || text === '/deleteclient') {
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
                    const displayName = superAdmin && client.originalName
                        ? `${client.originalName} (Admin: ${client.adminId})` : name;
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
        const adminClients = superAdmin ? getAllClients() : getAdminClients(userId);
        const clientNames = Object.keys(adminClients);
        if (clientNames.length === 0) {
            await bot.sendMessage(chatId, '📋 Список клиентов пуст');
            return;
        }
        let message = `📋 Список ${superAdmin ? 'всех' : 'ваших'} клиентов:\n\n`;
        for (const [name, client] of Object.entries(adminClients)) {
            const displayName = superAdmin && client.originalName ? `${client.originalName} (Admin: ${client.adminId})` : name;
            const proxyCount = client.proxies ? client.proxies.length : 0;
            message += `👤 ${displayName}\n`;
            message += `   🔐 Пароль: ${client.password}\n`;
            message += `   🌐 Прокси: ${proxyCount} шт.\n`;
            if (client.proxy6_order_id) message += `   🆔 Заказ PROXY6: ${client.proxy6_order_id}\n`;
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
            const displayName = superAdmin && client.originalName ? `${client.originalName} (Admin: ${client.adminId})` : name;
            const proxyCount = client.proxies ? client.proxies.length : 0;
            message += `• ${displayName} (${proxyCount} прокси)\n`;
        }
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        return;
    }

    if (text === '🌐 Текущий прокси' || text === '/current-proxy') {
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
                    const displayName = superAdmin && client.originalName ? `${client.originalName} (Admin: ${client.adminId})` : name;
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
                    const displayName = superAdmin && client.originalName ? `${client.originalName} (Admin: ${client.adminId})` : name;
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

    // Команды только супер-админа
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

    // Сброс состояний на кнопках (защита)
    const buttonCommands = [
        '👤 Добавить клиента', '🛒 Добавить с покупкой', '🗑️ Удалить клиента', '➕ Добавить прокси',
        '📋 Мои клиенты', '📋 Все клиенты', '🌐 Текущий прокси', '🌍 Мой IP',
        '👥 Управление админами', '📥 Добавить клиента с прокси', '🔄 Синхронизация', '💰 Проверка баланса', '📦 Наличие RU shared',
        '🛍 Купить прокси клиенту'
    ];
    if (buttonCommands.includes(text)) {
        if (userStates[userId]) {
            delete userStates[userId];
            log.debug(`🔄 Состояние пользователя ${userId} сброшено из-за нажатия кнопки: ${text}`);
        }
        await bot.sendMessage(chatId, `❌ Команда "${text}" не реализована или уже обработана выше. Используйте кнопки меню.`, getKeyboardForUser(userId));
        return;
    }

    // Обработка состояний
    if (userStates[userId]) {
        const state = userStates[userId];

        // Новый клиент с покупкой
        if (state.action === 'add_user_with_purchase') {
            switch (state.step) {
                case 'waiting_username': {
                    if (!text || text.length < 3) {
                        await bot.sendMessage(chatId, '❌ Логин должен содержать минимум 3 символа. Попробуйте еще раз:');
                        return;
                    }
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
                }
                case 'waiting_password': {
                    if (!text || text.length < 4) {
                        await bot.sendMessage(chatId, '❌ Пароль должен содержать минимум 4 символа. Попробуйте еще раз:');
                        return;
                    }
                    state.password = text;
                    state.step = 'confirming_purchase';
                    userStates[userId] = state;

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
                    await bot.sendMessage(
                        chatId,
                        `📋 Подтверждение создания клиента:\n\n` +
                        `👤 Логин: ${state.username}\n` +
                        `🔐 Пароль: ${state.password}\n` +
                        `📦 Прокси: ${state.count} shared на ${state.period} дней\n` +
                        `💸 Стоимость: будет списана с баланса PROXY6\n\n` +
                        `❓ Подтвердить создание и покупку прокси?`,
                        keyboard
                    );
                    return;
                }
            }
        }

        // Покупка прокси существующему клиенту (поддерживает "name [count] [period]")
        if (state.action === 'buying_proxy') {
            if (state.step === 'waiting_client_name') {
                const raw = text.trim();
                const parts = raw.split(/\s+/);
                const nameFromInput = parts[0];

                // Опциональные [count] [period]
                if (parts.length >= 2) {
                    const requestedCount = parseInt(parts[1], 10);
                    if (!Number.isNaN(requestedCount) && requestedCount > 0) state.count = requestedCount;
                }
                if (parts.length >= 3) {
                    const requestedPeriod = parseInt(parts[2], 10);
                    if (!Number.isNaN(requestedPeriod) && requestedPeriod > 0) state.period = requestedPeriod;
                }

                const clientInfo = superAdmin
                    ? findClientByName(nameFromInput)
                    : findClientByName(nameFromInput, userId);

                if (!clientInfo) {
                    await bot.sendMessage(chatId, `❌ Клиент ${nameFromInput} не найден или у вас нет к нему доступа`);
                    delete userStates[userId];
                    return;
                }

                if (!PROXY6_CONFIG.API_KEY) {
                    await bot.sendMessage(chatId, '❌ API ключ PROXY6.net не настроен');
                    delete userStates[userId];
                    return;
                }

                await bot.sendMessage(chatId, '⏳ Проверяю баланс и цену в PROXY6...');
                const balanceCheck = await checkProxy6Balance();
                if (!balanceCheck.success) {
                    await bot.sendMessage(chatId, `❌ Ошибка подключения к PROXY6: ${balanceCheck.error}`);
                    delete userStates[userId];
                    return;
                }

                const priceCheck = await getProxy6Price(state.count, state.period, state.version);
                if (!priceCheck.success) {
                    await bot.sendMessage(chatId, `❌ Ошибка получения цены: ${priceCheck.error}`);
                    delete userStates[userId];
                    return;
                }

                if (parseFloat(balanceCheck.balance) < priceCheck.price) {
                    await bot.sendMessage(
                        chatId,
                        `❌ Недостаточно средств на балансе PROXY6!\n\n` +
                        `💰 Текущий баланс: ${balanceCheck.balance} ${balanceCheck.currency}\n` +
                        `💸 Необходимо: ${priceCheck.price} ${priceCheck.currency}\n` +
                        `📊 Цена за ${state.count} shared прокси на ${state.period} дней`
                    );
                    delete userStates[userId];
                    return;
                }

                userStates[userId] = {
                    action: 'buying_proxy',
                    step: 'confirming_buy',
                    clientName: clientInfo.clientName || nameFromInput,
                    adminId: clientInfo.adminId,
                    count: state.count,
                    period: state.period,
                    country: state.country,
                    version: state.version,
                    currency: priceCheck.currency,
                    price: priceCheck.price
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

                await bot.sendMessage(
                    chatId,
                    `📋 Подтверждение покупки:\n\n` +
                    `👤 Клиент: ${clientInfo.clientName || nameFromInput}\n` +
                    `📦 Прокси: ${state.count} shared на ${state.period} дней\n` +
                    `💸 Стоимость: будет списана с баланса PROXY6\n\n` +
                    `❓ Подтвердить покупку прокси для клиента?`,
                    keyboard
                );
                return;
            }
        }

        // Добавление клиента с готовыми прокси
        if (state.action === 'adding_client_with_proxies') {
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

            const adminClients = getAdminClients(userId);
            if (adminClients[clientName]) {
                await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует в вашей группе`);
                delete userStates[userId];
                return;
            }
            if (superAdmin) {
                const existingClient = findClientByName(clientName);
                if (existingClient) {
                    await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует у админа ${existingClient.adminId}`);
                    delete userStates[userId];
                    return;
                }
            }

            const proxies = [];
            for (const proxyLine of proxyLines) {
                const proxy = proxyLine.trim();
                if (proxy) {
                    const parts = proxy.split(':');
                    if (parts.length === 4) proxies.push(proxy);
                    else {
                        await bot.sendMessage(chatId, `❌ Неверный формат прокси: ${proxy}\nИспользуйте: host:port:user:pass`);
                        return;
                    }
                }
            }
            if (proxies.length === 0) {
                await bot.sendMessage(chatId, '❌ Не найдено валидных прокси');
                return;
            }

            adminClients[clientName] = { password, proxies };
            saveClients();

            try {
                await makeProxyServerRequest('/api/add-client', 'POST', {
                    clientName, password,
                    proxies: proxies.map(formatProxyForRailway).filter(Boolean)
                });
                await bot.sendMessage(
                    chatId,
                    `✅ Клиент ${clientName} добавлен в вашу группу!
   👤 Логин: ${clientName}
   🔐 Пароль: ${password}
   🌐 Прокси: ${proxies.length} шт.
   👨‍💼 Админ: ${userId}

📥 Прокси добавлены без покупки`,
                    getKeyboardForUser(userId)
                );
            } catch (error) {
                await bot.sendMessage(
                    chatId,
                    `✅ Клиент ${clientName} добавлен локально с ${proxies.length} прокси
⚠️ Ошибка синхронизации с прокси сервером: ${error.message}`,
                    getKeyboardForUser(userId)
                );
            }

            delete userStates[userId];
            return;
        }

        // Добавить клиента (без прокси)
        if (state.action === 'adding_client') {
            const lines = text.trim().split('\n');
            const parts = lines[0].trim().split(/\s+/);
            if (parts.length < 2) {
                await bot.sendMessage(chatId, '❌ Неверный формат. Используйте: логин пароль');
                return;
            }
            const clientName = parts[0];
            const password = parts[1];

            const adminClients = getAdminClients(userId);
            if (adminClients[clientName]) {
                await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует в вашей группе`);
                delete userStates[userId];
                return;
            }
            if (superAdmin) {
                const existingClient = findClientByName(clientName);
                if (existingClient) {
                    await bot.sendMessage(chatId, `❌ Клиент ${clientName} уже существует у админа ${existingClient.adminId}`);
                    delete userStates[userId];
                    return;
                }
            }

            adminClients[clientName] = { password, proxies: [] };
            saveClients();

            try {
                await makeProxyServerRequest('/api/add-client', 'POST', {
                    clientName, password,
                    proxies: []
                });
                await bot.sendMessage(
                    chatId,
                    `✅ Клиент ${clientName} добавлен в вашу группу!
   👤 Логин: ${clientName}
   🔐 Пароль: ${password}
   🌐 Прокси: 0 шт.
   👨‍💼 Админ: ${userId}`,
                    getKeyboardForUser(userId)
                );
            } catch (error) {
                await bot.sendMessage(
                    chatId,
                    `✅ Клиент ${clientName} добавлен локально с 0 прокси
⚠️ Ошибка синхронизации с прокси сервером: ${error.message}`,
                    getKeyboardForUser(userId)
                );
            }

            delete userStates[userId];
            return;
        }

        // Добавление прокси руками
        if (state.action === 'adding_proxy') {
            const lines = text.trim().split('\n');
            if (lines.length < 2) {
                await bot.sendMessage(chatId, '❌ Неверный формат. Используйте:\nимя_клиента\nhost:port:user:pass');
                return;
            }
            const clientName = lines[0].trim();
            const proxyLines = lines.slice(1);

            const clientInfo = superAdmin ? findClientByName(clientName) : findClientByName(clientName, userId);
            if (!clientInfo) {
                await bot.sendMessage(chatId, `❌ Клиент ${clientName} не найден или у вас нет к нему доступа`);
                delete userStates[userId];
                return;
            }
            if (!superAdmin && clientInfo.adminId != userId) {
                await bot.sendMessage(chatId, `❌ У вас нет доступа к клиенту ${clientName}`);
                delete userStates[userId];
                return;
            }

            const newProxies = [];
            for (const proxyLine of proxyLines) {
                const proxy = proxyLine.trim();
                if (proxy) {
                    const parts = proxy.split(':');
                    if (parts.length === 4) newProxies.push(proxy);
                    else {
                        await bot.sendMessage(chatId, `❌ Неверный формат прокси: ${proxy}\nИспользуйте: host:port:user:pass`);
                        return;
                    }
                }
            }
            if (newProxies.length === 0) {
                await bot.sendMessage(chatId, '❌ Не найдено валидных прокси');
                return;
            }

            const adminClients = getAdminClients(clientInfo.adminId);
            adminClients[clientInfo.clientName].proxies.push(...newProxies);
            saveClients();

            try {
                await addProxiesToServer(
                    clientInfo.clientName,
                    newProxies.map(formatProxyForRailway).filter(Boolean)
                );
            } catch (error) {
                log.error('❌ Ошибка добавления прокси на сервер:', error.message);
            }

            await bot.sendMessage(
                chatId,
                `✅ Добавлено ${newProxies.length} прокси к клиенту ${clientName}
🌐 Всего прокси у клиента: ${adminClients[clientInfo.clientName].proxies.length}
👨‍💼 Админ: ${clientInfo.adminId}`,
                getKeyboardForUser(userId)
            );

            delete userStates[userId];
            return;
        }

        // Управление админами
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

    await bot.sendMessage(chatId, '❌ Неизвестная команда. Используйте кнопки ниже для управления.', getKeyboardForUser(userId));
});

// ===== CALLBACKS =====
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (!isAuthorized(userId)) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Нет доступа' });
        return;
    }

    const superAdmin = isSuperAdmin(userId);

    // Подтверждение покупки для существующего клиента
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
                count: st.count,
                period: st.period,
                country: st.country,
                version: st.version
            });

            if (result.success) {
                const info = result.purchase_info;
                await bot.editMessageText(
                    `✅ Прокси успешно куплены и добавлены клиенту!\n\n` +
                    `👤 Клиент: ${st.clientName}\n` +
                    `📦 Добавлено: ${result.addedCount} прокси\n` +
                    (result.partialNote || '') + '\n\n' +
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

    if (data === 'cancel_buy_client') {
        delete userStates[userId];
        try {
            await bot.editMessageText('❌ Покупка прокси отменена.', {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            });
        } catch {}
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    if (data === 'confirm_purchase') {
        await handleConfirmPurchase(chatId, userId);
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    if (data === 'cancel_purchase') {
        delete userStates[userId];
        await bot.editMessageText('❌ Создание клиента отменено.', {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id
        });
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Удаление клиента
    if (data.startsWith('delete_')) {
        const parts = data.split('_');
        const clientName = parts[1];
        const adminId = parts[2];

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
            await deleteClientFromServer(clientName);
        } catch (error) {
            log.error('❌ Ошибка удаления клиента с сервера:', error.message);
        }

        delete adminClients[clientName];
        saveClients();

        await bot.editMessageText(
            `✅ Клиент ${clientName} успешно удален
👨‍💼 Админ: ${adminId}`,
            { chat_id: chatId, message_id: callbackQuery.message.message_id }
        );

        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Текущий прокси
    if (data.startsWith('current_')) {
        const parts = data.split('_');
        const clientName = parts[1];
        const adminId = parts[2];

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
                { chat_id: chatId, message_id: callbackQuery.message.message_id }
            );
        } catch (error) {
            await bot.editMessageText(
                `❌ Ошибка получения прокси для ${clientName}: ${error.message}`,
                { chat_id: chatId, message_id: callbackQuery.message.message_id }
            );
        }

        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Мой IP
    if (data.startsWith('myip_')) {
        const parts = data.split('_');
        const clientName = parts[1];
        const adminId = parts[2];

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
                { chat_id: chatId, message_id: callbackQuery.message.message_id }
            );
        } catch (error) {
            await bot.editMessageText(
                `❌ Ошибка получения IP для ${clientName}: ${error.message}`,
                { chat_id: chatId, message_id: callbackQuery.message.message_id }
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

log.info(`🚀 Bot started | ProxyServer=${PROXY_SERVER_URL} | Proxy6=${PROXY6_CONFIG.API_KEY ? 'on' : 'off'} | Defaults: count=${PURCHASE_DEFAULTS.count}, period=${PURCHASE_DEFAULTS.period}, country=${PURCHASE_DEFAULTS.country}, ver=${PURCHASE_DEFAULTS.version}`);
log.debug(`👑 Супер-админ ID: ${SUPER_ADMIN_ID} | 👥 Админов: ${admins.length}`);

// Health endpoint
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
        purchase_defaults: PURCHASE_DEFAULTS,
        clients_by_admin: Object.fromEntries(
            Object.entries(clients).map(([adminId, adminClients]) => [adminId, Object.keys(adminClients).length])
        )
    });
});

app.listen(PORT, () => {
    log.info(`🌐 Health endpoint на порту ${PORT}`);
});

// Форматирование прокси к виду http://user:pass@host:port
function formatProxyForRailway(proxy) {
    if (typeof proxy === 'string') {
        if (proxy.startsWith('http://') && proxy.includes('@')) return proxy;
        const parts = proxy.split(':');
        if (parts.length === 4) {
            const [host, port, user, pass] = parts;
            return `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
        }
        return proxy;
    }
    if (proxy && proxy.host && proxy.port && proxy.user && proxy.pass) {
        return `http://${encodeURIComponent(proxy.user)}:${encodeURIComponent(proxy.pass)}@${proxy.host}:${proxy.port}`;
    }
    log.error('❌ Неверный формат прокси:', proxy);
    return null;
}
