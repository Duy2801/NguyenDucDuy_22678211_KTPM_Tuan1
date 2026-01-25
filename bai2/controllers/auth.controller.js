const jwt = require("jsonwebtoken");
const users = require("../data/users");
const config = require("../config/jwt.config");

let refreshTokens = [];

exports.login = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpire,
  });

  const refreshToken = jwt.sign(payload, config.refreshTokenSecret);

  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken,
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
        role: user.role,
      },
      config.accessTokenSecret,
      { expiresIn: config.accessTokenExpire },
    );

    res.json({ accessToken: newAccessToken });
  });
};

// Lấy thông tin user theo ID (Guest chỉ xem được của mình, Admin xem tất cả)
exports.getUserInfo = (req, res) => {
  const userId = parseInt(req.params.id);
  const currentUser = req.user;

  // Nếu là guest, chỉ được xem thông tin của chính mình
  if (currentUser.role === "guest" && currentUser.id !== userId) {
    return res.status(403).json({
      message: "Bạn chỉ có quyền xem thông tin của chính mình",
    });
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy user" });
  }

  // Không trả về password
  const { password, ...userInfo } = user;
  res.json(userInfo);
};

// Lấy danh sách tất cả users (chỉ admin)
exports.getAllUsers = (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPassword);
};

// Xóa user (chỉ admin)
exports.deleteUser = (req, res) => {
  const userId = parseInt(req.params.id);

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy user" });
  }

  // Không cho phép xóa chính mình
  if (req.user.id === userId) {
    return res.status(400).json({
      message: "Không thể xóa tài khoản của chính mình",
    });
  }

  const deletedUser = users.splice(userIndex, 1);
  res.json({
    message: "Xóa user thành công",
    deletedUser: {
      id: deletedUser[0].id,
      username: deletedUser[0].username,
    },
  });
};
