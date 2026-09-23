require("dotenv").config();

const express =
  require("express");

const cors =
  require("cors");

const cookieParser =
  require("cookie-parser");

const connectDB =
  require("./config/db");


const app =
  express();


connectDB();


// MIDDLEWARE

app.use(
  express.json()
);


app.use(
  express.urlencoded({
    extended: true,
  })
);


app.use(
  cookieParser()
);


app.use(
  cors({

    origin:
      process.env.FRONTEND_URL,

    credentials:
      true,

  })
);


// TEST ROUTE


app.get(
  "/",
  (req, res) => {

    res.json({
      message:
        "Authentication API is running",
    });

  }
);


// AUTH ROUTES


app.use(
  "/api/auth",
  require("./routes/authRoutes")
);


// ERROR HANDLER

app.use(
  (err, req, res, next) => {

    console.error(err);

    res.status(500).json({
      message:
        "Internal server error",
    });

  }
);


// SERVER

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);