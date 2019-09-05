import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });
    console.log(userExists);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const { id, name, email } = await User.create(req.body).catch(() =>
      console.log('=============To aq=============')
    );

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
