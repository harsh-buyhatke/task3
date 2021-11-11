const express = require("express");
const multer = require("multer");
const app = express();
const fs = require("fs");
const validExtensions = ["png", "jpg", "jpeg"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split("/")[1]; // extension  mimetype is a label to indentify type of label
    if (validExtensions.includes(ext))
      cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

// diskStorage
const storageVedio = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./vedios");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split("/")[1]; // extension  mimetype is a label to indentify type of label
    //   if(validExtensions.includes(ext))
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({ storage: storage }); // middleware
const uploadvedio = multer({ storage: storageVedio });

app.get("/", (req, res) => {
  return res.sendFile(__dirname + "/stream.html");
});

app.get("/uploadimage", (req, res) => {
  return res.sendFile(__dirname + "/index.html");
});

app.get("/uploadvedio", (req, res) => {
  return res.sendFile(__dirname + "/uploadvedio.html");
})

app.get("/vedio", (req, res) => {
  const range = req.headers.range;
  if (!range) return res.status(400).send("Send required headers");
  const vediopath = "vedios/test.mp4";
  const vediosize = fs.statSync(vediopath).size;
  const chunksize = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunksize, vediosize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${vediosize}`,
    "Accept-Range": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "vedio/mp4",
  };
  res.writeHead(206, headers);
  const vediostream = fs.createReadStream(vediopath, { start, end });
  vediostream.pipe(res);
});

app.post("/image", upload.single("image"), (req, res) => {
  console.log(req);
  res.send("single file uploaded");
});

app.post("/multiple", upload.array("image", 4), (req, res) => {
  console.log(req.files);
  res.send("multiple file uploaded");
});
//  fieldname , maxCount

app.post("/vedio", uploadvedio.single("vedio"), (req, res) => {
  console.log(req.file);
  res.send("vedio file uploaded");
});

app.listen(5000, (err) => {
  if (err) console.log(err);
  console.log("connected");
});
