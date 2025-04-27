import { Router, Request, Response } from 'express';
import { literal, CreationAttributes, Op } from 'sequelize';
import { Event } from '@models/Event';
import dotenv from 'dotenv';
import { User } from '@models/User';
import { authenticate } from '@middleware/auth';

dotenv.config();

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     description: Возвращает список всех мероприятий, с возможностью включить удалённые.
 *     parameters:
 *       - name: showDeleted
 *         in: query
 *         required: false
 *         description: Показывать ли удалённые мероприятия
 *         schema:
 *           type: boolean
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const showDeleted = req.query.showDeleted === 'true';
    const options: any = {
      order: [['createdAt', 'DESC']],
      attributes: {
        include: [
          [
            literal(`COALESCE(participants, ARRAY[]::uuid[])::uuid[]`),
            'participants'
          ]
        ]
      }
    };

    if (showDeleted) {
      options.paranoid = false;
    }

    const events = await Event.findAll(options);
    res.status(200).json(events);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Неизвестная ошибка');
    console.error('Error in GET /events:', err);
    res.status(500).json({
      error: 'Ошибка при получении списка мероприятий',
      details: err.message,
    });
  }
});

// Защищаем все остальные маршруты
router.use(authenticate);

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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.status(200).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при поиске мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создание нового мероприятия
 *     description: >
 *       Создаёт новое мероприятие с проверкой на лимит по количеству событий, которые могут быть созданы за 24 часа.
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
 *       201:
 *         description: Мероприятие успешно создано
 *       400:
 *         description: Ошибка валидации
 *       429:
 *         description: Превышен лимит на создание мероприятий
 *       500:
 *         description: Ошибка при создании мероприятия
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, date } = req.body;
    const userId = req.auth?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    if (!title || !date) {
      return res
        .status(400)
        .json({ error: 'Название, дата обязательны' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      createdBy: userId,
      participants: []
    } as CreationAttributes<Event>);

    res.status(201).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    console.log(err);
    res.status(500).json({
      error: 'Ошибка при создании мероприятия',
      details: err.message,
    });
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    await event.update(req.body);
    res.status(200).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при обновлении мероприятия',
      details: err.message,
    });
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    await event.destroy();
    
    res.status(200).json({ message: 'Мероприятие помечено как удалённое' });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при удалении мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}/participate:
 *   post:
 *     summary: Участие в мероприятии
 *     description: Добавляет текущего пользователя в список участников мероприятия.
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
 *         description: Успешно добавлен в участники
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при добавлении в участники
 */
router.post('/:id/participate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const event = await Event.findOne({
      where: { id },
      attributes: {
        include: [
          [
            literal(`COALESCE(participants, ARRAY[]::uuid[])::uuid[]`),
            'participants'
          ]
        ]
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    let participants = Array.isArray(event.participants) ? event.participants : [];
    
    if (!participants.includes(userId)) {
      participants = [...participants, userId];
      await event.update({ 
        participants: literal(`ARRAY[${participants.map(p => `'${p}'`).join(',')}]::uuid[]`)
      });
      
      // Получаем обновленное мероприятие
      const updatedEvent = await Event.findOne({
        where: { id },
        attributes: {
          include: [
            [
              literal(`COALESCE(participants, ARRAY[]::uuid[])::uuid[]`),
              'participants'
            ]
          ]
        }
      });
      
      res.status(200).json(updatedEvent);
    } else {
      res.status(200).json(event);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Неизвестная ошибка');
    console.error('Error in POST /events/:id/participate:', err);
    res.status(500).json({
      error: 'Ошибка при добавлении в участники',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/user/{userId}:
 *   get:
 *     summary: Получить мероприятия пользователя
 *     description: Возвращает список мероприятий, в которых участвует пользователь.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID пользователя
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Список мероприятий пользователя
 *       500:
 *         description: Ошибка при получении списка мероприятий
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const events = await Event.findAll({
      where: {
        [Op.or]: [
          { createdBy: userId },
          literal(`participants @> ARRAY['${userId}']::uuid[]`)
        ],
        deletedAt: null
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(events);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при получении списка мероприятий',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}/participants:
 *   get:
 *     summary: Получить список участников мероприятия
 *     description: Возвращает список пользователей, участвующих в мероприятии
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
 *         description: Список участников
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при получении списка участников
 */
router.get('/:id/participants', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findOne({
      where: { id },
      attributes: ['participants']
    });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    const participants = event.participants || [];
    
    if (participants.length === 0) {
      return res.status(200).json([]);
    }

    const users = await User.findAll({
      where: {
        id: participants
      },
      attributes: ['id', 'name', 'email']
    });

    res.status(200).json(users);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Неизвестная ошибка');
    console.error('Error in GET /events/:id/participants:', err);
    res.status(500).json({
      error: 'Ошибка при получении списка участников',
      details: err.message,
    });
  }
});

export default router;
