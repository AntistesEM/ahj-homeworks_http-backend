// - koa: основной фреймворк для создания сервера
// - @koa/cors: middleware для обработки CORS-запросов
// - koa-bodyparser: middleware для обработки данных из тела запроса
const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const app = new Koa();  // Создаем экземпляр koa-приложения.

// Применяем middleware для обработки CORS и тела запроса
app.use(cors());
app.use(bodyParser());

// Данные для хранения тикетов (временное хранилище в памяти)
let tickets = [];

// Функция для генерации уникального ID
function generateId() {
    return Date.now().toString(36) + Math.floor(Math.random() * 1e9).toString(36);
}

// Обработчик маршрутов
app.use(async (ctx) => {
    const { method } = ctx.request.query;

    switch (method) {
        case 'allTickets':
            // Отдаем список всех тикетов
            ctx.body = tickets.map(({ id, name, status, created }) => ({ id, name, status, created }));
            break;
        
        case 'ticketById':      
            // Получаем ID тикета из параметров запроса
            const { id: ticketId } = ctx.request.query;      
            // Ищем тикет по ID      
            const foundTicket = tickets.find((t) => t.id === ticketId);      
            if (foundTicket) {        
                // Отдаем полное описание тикета        
                ctx.body = foundTicket;      
            } else {        
                ctx.status = 404;        
                ctx.body = { error: 'Ticket not found' };      
            }      
            break;
    
        case 'createTicket':      
            // Получаем данные из тела запроса      
            const { name, description, status } = ctx.request.body;      
            // Создаем новый тикет      
            const newTicket = {        
                id: generateId(),
                name,
                description,
                status,
                created: Date.now(),      
            };
            // Добавляем новый тикет в список
            tickets.push(newTicket);
            ctx.body = newTicket;
            break;
        
        case 'allTicketsDel':
            // Очищаем список всех тикетов
            tickets = [];
            ctx.body = { message: 'All tickets have been removed'};
            break;
        
        case 'ticketDelById':      
            // Получаем ID тикета из параметров запроса
            const { id: ticketIdToDel } = ctx.request.query;      
            // Ищем индекс тикета по ID      
            const ticketToDelete = tickets.findIndex((t) => t.id === ticketIdToDel);      
            if (ticketToDelete !== -1) {        
                // Удаляем тикет по индексу  
                const deletedTicketId = tickets.find((t) => t.id === ticketIdToDel).id;
                tickets.splice(ticketToDelete, 1);
                ctx.body =  { message: `Ticket with id=${deletedTicketId} deleted` };      
            } else {        
                ctx.status = 404;        
                ctx.body = { error: 'Ticket not found' };      
            }      
            break;
            
        case 'updateTicket':
            // Получаем ID тикета из параметров запроса
            const { id: ticketIdToUpdate } = ctx.request.query;
            // Получаем новые значения для полей из тела запроса
            const { name: nameUpdaate, description: descUpdate } = ctx.request.body;

            // Ищем индекс тикета по ID
            const ticketToUpdateIndex = tickets.findIndex(t => t.id === ticketIdToUpdate);

            if (ticketToUpdateIndex !== -1) {
            // Обновляем поля тикета
            tickets[ticketToUpdateIndex].name = nameUpdaate;
            tickets[ticketToUpdateIndex].description = descUpdate;

              // Отправляем обновленный тикет
                ctx.body = tickets[ticketToUpdateIndex];
            }
            break;
            
        case 'updateTicketStatus':
            // Получаем ID тикета из параметров запроса
            const { id: ticketIdToUpdateStatus } = ctx.request.query;
            // Получаем новые значения для полей из тела запроса
            const { status: statusUpdate } = ctx.request.body;
        
            // Ищем индекс тикета по ID
            const ticketToUpdateStatusIndex = tickets.findIndex(t => t.id === ticketIdToUpdateStatus);
        
            if (ticketToUpdateStatusIndex !== -1) {
                // Обновляем поля тикета
                tickets[ticketToUpdateStatusIndex].status = statusUpdate;
        
                // Отправляем обновленный тикет
                ctx.body = tickets[ticketToUpdateStatusIndex];
            } 
            break;
        
        default:
            ctx.status = 404;
            ctx.body = { error: 'Invalid method' };
    }
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
