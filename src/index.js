const express = require("express");
const fs = require("fs");
const gm = require("gm");
const md5 = require("md5");
const morgan = require("morgan");
const path = require("path");

const app = express();

const colors = ["#ffc300", "#ff5733", "#c70039", "#900c3f", "#581845"];

const random = (collection) => {
  return collection[Math.floor(Math.random() * collection.length)];
};

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
      const filepath = path.resolve("data", file);

      checkPresence(filepath)
        .then((present) => {
          if (present) {
            console.log("Already generated. Returning.");
            return resolve(filepath);
          }

          gm(512, 512, random(colors))
            .font(path.resolve("fonts", "Proxima-Nova.ttf"), 256)
            .fill("#ffffff")
            .stroke("transparent")
            .drawText(0, 0, initials, "Center")
            .quality(100)
            .write(filepath, (error) => {
              if (error) {
                console.error(error);
                return reject(error);
              }

              resolve(filepath);
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
    .then((filepath) => {
      res.status(200).sendFile(filepath);
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
