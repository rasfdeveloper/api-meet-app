import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [User],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Validation fails' });
    }

    /**
     * Check for past dates
     */

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ message: 'Past dates are not permitted for create Meetups' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Validation fails' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Check if meetup belongs to user that is trying to update
     */

    if (meetup.user_id !== user_id) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    /**
     * Check if user is trying to update the date of meetup with a past date
     */

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Invalid meetup date' });
    }

    /**
     * Check if meetup date is past
     */

    if (meetup.past) {
      res.status(400).json({ message: "You can't update past meetups." });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    const user_id = req.userId;

    if (meetup == null) {
      res.status(400).json({ message: 'Meetup not found' });
    }

    if (meetup.user_id !== user_id) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    if (meetup.past) {
      res.status(400).json({ message: "You can't delete past meetups." });
    }

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
