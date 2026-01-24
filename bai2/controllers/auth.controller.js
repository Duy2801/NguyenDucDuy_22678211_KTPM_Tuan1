const jwt = require("jsonwebtoken");
const users = require("../data/users");
const config = require("../config/jwt.config");

let refreshTokens = [];

exports.login = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  const accessToken = jwt.sign(
    payload,
    config.accessTokenSecret,
    { expiresIn: config.accessTokenExpire }
  );

  const refreshToken = jwt.sign(
    payload,
    config.refreshTokenSecret
  );

  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken
  });
};

exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, config.refreshTokenSecret, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      config.accessTokenSecret,
      { expiresIn: config.accessTokenExpire }
    );

    res.json({ accessToken: newAccessToken });
  });
};
