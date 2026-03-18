const microkernel = require("./core/Microkernel");
const database = require("./core/database");

// 1. Nhúng các Core Plugins từ bên ngoài
const postPlugin = require("./plugins/PostPlugin");
const commentPlugin = require("./plugins/CommentPlugin");
const mediaPlugin = require("./plugins/MediaPlugin");

// 2. Khởi tạo Database chung
database.connect();

// 3. Đăng ký plugin vào Kernel (Lõi)
microkernel.registerPlugin(postPlugin);
microkernel.registerPlugin(commentPlugin);
microkernel.registerPlugin(mediaPlugin);

// 4. Bật hạt nhân hệ thống CMS Web Server
microkernel.start(3005);
