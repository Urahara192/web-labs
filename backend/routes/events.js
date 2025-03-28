const express = require("express");
const { Op } = require("sequelize");
const Event = require("../models/Event");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     description: Возвращает список всех мероприятий, фильтруя удалённые.
 *     responses:
 *       200:
 *         description: Список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Ошибка при получении списка мероприятий
 */
router.get("/", async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {
                deletedAt: null // фильтрация удалённых мероприятий
            }
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при получении списка мероприятий", details: error.message });
    }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить одно мероприятие по ID
 *     description: Возвращает информацию о мероприятии по его ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Мероприятие найдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при поиске мероприятия
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findOne({
            where: { id }
        });
        if (!event) {
            return res.status(404).json({ error: "Мероприятие не найдено" });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при поиске мероприятия", details: error.message });
    }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создание нового мероприятия
 *     description: Создаёт новое мероприятие с проверкой на лимит по количеству событий, которые могут быть созданы за 24 часа.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               createdBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Мероприятие успешно создано
 *       400:
 *         description: Ошибка валидации
 *       429:
 *         description: Превышен лимит на создание мероприятий
 *       500:
 *         description: Ошибка при создании мероприятия
 */
router.post("/", async (req, res) => {
    try {
        const { title, description, date, createdBy } = req.body;
        const eventLimit = parseInt(process.env.EVENTS_LIMIT_PER_DAY, 10) || 5;

        if (!title || !date || !createdBy) {
            return res.status(400).json({ error: "Название, дата и ID создателя обязательны" });
        }

        // Проверяем, сколько мероприятий создал пользователь за последние 24 часа
        const last24Hours = new Date();
        last24Hours.setDate(last24Hours.getDate() - 1);

        const eventCount = await Event.count({
            where: {
                createdBy,
                createdAt: { [Op.gte]: last24Hours }
            }
        });

        if (eventCount >= eventLimit) {
            return res.status(429).json({ error: `Превышен лимит. Можно создать не более ${eventLimit} мероприятий в день.` });
        }

        const event = await Event.create({ title, description, date, createdBy });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании мероприятия", details: error.message });
    }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     description: Обновляет информацию о мероприятии по его ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Мероприятие успешно обновлено
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при обновлении мероприятия
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findOne({
            where: { id }
        });
        if (!event) {
            return res.status(404).json({ error: "Мероприятие не найдено" });
        }

        await event.update(req.body);
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении мероприятия", details: error.message });
    }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Мягкое удаление мероприятия
 *     description: Помечает мероприятие как удалённое, устанавливая поле deletedAt.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Мероприятие помечено как удалённое
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при удалении мероприятия
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Находим мероприятие по UUID
        const event = await Event.findOne({
            where: { id }
        });

        if (!event) {
            return res.status(404).json({ error: "Мероприятие не найдено" });
        }

        // Мягкое удаление — просто ставим дату в поле deletedAt
        await event.update({ deletedAt: new Date() });
        res.status(200).json({ message: "Мероприятие помечено как удалённое" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении мероприятия", details: error.message });
    }
});

module.exports = router;
