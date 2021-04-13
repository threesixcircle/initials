const express = require("express");
const fs = require("fs");
const gm = require("gm");
const md5 = require("md5");
const morgan = require("morgan");
const path = require("path");

const app = express();

const checkPresence = (path) => {
  return new Promise((resolve, reject) => {
    try {
      fs.access(path, fs.F_OK, (error) => {
        resolve(!error);
      });
    } catch (e) {
      reject(e);
    }
  });
};

const generate = ({ initials }) => {
  return new Promise((resolve, reject) => {
    try {
      const hash = md5(initials);
      const file = `avatar-${hash}.png`;

      checkPresence(path.resolve("data", file))
        .then((present) => {
          if (present) {
            console.log("Already generated. Returning.");
            return resolve(file);
          }

          gm(512, 512, "#f62f62")
            .font(path.resolve("fonts", "Effra.ttf"), 256)
            .fill("#ffffff")
            .stroke("transparent")
            .drawText(0, 0, initials, "Center")
            .quality(100)
            .write(path.resolve("data", file), (error) => {
              if (error) {
                console.error(error);
                return reject(error);
              }

              resolve(file);
            });
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};

app.use(morgan("tiny"));

app.get("/", (req, res) => {
  const { query } = req;
  const { initials } = query;

  generate({ initials })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
