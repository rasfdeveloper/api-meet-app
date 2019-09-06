import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
      const userExists = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const { id, name, email } = await User.create(req.body);

      return res.json({
        id,
        name,
        email,
      });
    } catch (e) {
      return res.status(400).json({ errors: e.errors });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
      console.log('to aq');
      const { email, oldPassword } = req.body;

      const user = await User.findByPk(req.userId);

      if (email !== user.email) {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
        }
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res
          .status(401)
          .json({ message: 'Your old password is invalid' });
      }

      const { id, name } = await user.update(req.body);

      return res.json({
        id,
        name,
        email,
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ errors: e.errors });
    }
  }
}

export default new UserController();
