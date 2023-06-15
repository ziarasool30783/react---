const path = require("path"); // it is a built-in module to set root path.

const express = require("express"); // third party package
const cors = require("cors");
const bodyParser = require("body-parser"); // this module is used to handle plain text content type in request
const mongoose = require("mongoose");
const multer = require("multer"); // this is a third party module, for handling file/images in request


const authRoutes = require("./routes/auth");
const partyRoutes = require("./routes/party");
const billRoutes = require("./routes/bill");
const prodRoutes = require("./routes/prodRoutes");
const stock = require("./routes/stockRoutes");
const expense = require("./routes/expense");
const payment = require("./routes/payment");
const cashBookRoutes = require("./routes/cashBook");
const taskRoutes = require("./routes/task");

const app = express(); // creating the server
app.use(cors());
/*
the following is a configuration object of multer module.
in this object we specify two things. the destination folder of the
storage for images to be stored. second we specify a unique name for the file
by the help of new Date().toISOString() method. but there are other modules exit
to generate unique hash for filename.
*/
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");// this is the destination folder where we store our file images.
  },
  filename: (req, file, cb) => {
    //cb(null, new Date().toISOString() + '-' + file.originalname);
    cb(null,  Date.now() + path.extname(file.originalname));
  },
});

/*
the folloiwng is another object of the multer which specifies the image formats.
*/
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // if any of these format is coming then true.
  } else {
    cb(null, false);
  }
};
const port=process.env.PORT || 5050
app.use(bodyParser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json


/*
  this middleware is handling all request content which contains files.
  in this case we are hanlind single image.
  */
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use('/images', express.static(path.join(__dirname, 'Images')));// this stores the global directory to store images in server end
app.use('/print', express.static(path.join(__dirname)));
/*
The following middleware is responsible to allow all origin to communicate to the server.
without this middlware, if our frontEnd runs on localhost:5050 and server runs on 
localhost:8080, then communication cannot establish. but hence we declare this middleware
which allow all origin(*) to access the server. we also only some request methods as well
as OPTIONS, GET, POST, PUT, PATCH, DELETE. surely we can block a method as well by not 
mentioning it in the list. we also allow some headers to be forwared to our server.
as CONTENT-TYPE, AUTHORIZATION and some other headers as well.
*/
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // * means all origin can communicate to our server.
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // these headers are allowed to be forwared in request to our server.
  next();
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})
//app.use('/feed', feedRoutes);// for feed routes. any request which starts with /feed
app.use("/auth", authRoutes); // for auth routes. any request which starts with /auth
app.use("/party", partyRoutes);
app.use("/product", prodRoutes);
app.use("/stock", stock);
app.use("/bill", billRoutes);
app.use("/expense", expense);
app.use("/payment", payment);
app.use("/cashbook", cashBookRoutes);
app.use("/task", taskRoutes);
/*
the following middleware belongs on a third party module.
the following middleware has four parameters. basically when we get an error
this middleware will handle the error. but on note should be kept in mind.
that when we get an error inside a callback, then, or catch block then 
next() method should be called other wise throwing a new error to reach this middleware.
*/
app.use((error, req, res, next) => {
  const status = error.statusCode || 500; //
  const message = error.message;
  const data = error.data; // this is total optional, but we can forward exact error message to frontEnd as well.
  res.status(status).json({ message: message, error: error });
});

mongoose
  .connect(
    "mongodb+srv://shoaibmazhar799PromptopiaNextAuth:5KVS3KWgNtYmVMDg@cluster0.ufrabkz.mongodb.net/",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    app.listen(port);
    console.log("connected",port);
  })
  .catch((err) => console.log(err));

// mongoose
// .connect(
//   'mongodb://MuhammadShoaibMazhar:shoaibMongO@nestappcluster-shard-00-00.cv6wx.mongodb.net:27017,nestappcluster-shard-00-01.cv6wx.mongodb.net:27017,nestappcluster-shard-00-02.cv6wx.mongodb.net:27017/nestappCluster?ssl=true&replicaSet=atlas-7ertcn-shard-0&authSource=admin&retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }
// )
// .then(result => {

//   app.listen(5050);
//   console.log("connected");
// })
// .catch(err => console.log(err));
