import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    console.log('Executou');

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: 'Join MeetUp',
      template: 'subscription',
      context: {
        organizer: meetup.User.name,
        user: user.name,
        email: user.email,
        meetup: meetup.title,
      },
    });
  }
}

export default new SubscriptionMail();
