/* istanbul ignore file */
const ServerTestHelper = {
  async newUser(server, {
    username = 'dicoding', fullname = 'Dicoding Indonesia', password = 'secret_password',
  }) {
    const registerUserResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username, password, fullname,
      },
    });
    const { addedUser: { id: userId } } = (JSON.parse(registerUserResponse.payload)).data;

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username, password,
      },
    });
    const { accessToken } = (JSON.parse(loginResponse.payload)).data;

    return { userId, accessToken };
  },
};

module.exports = ServerTestHelper;
