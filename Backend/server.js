const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();

//inicias la app
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
//app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] }));
app.use(morgan("dev"));

app.use(express.json()); //para que entienda los json que le mandamos
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    return res.status(200).send("<h1>hola</h1> <br> <h2>como estas</h2>");
});



//ES PARA ABRIR EL DOTENV
const puerto = process.env.PUERTO || 3000; //ABRO MI PUERTO Y SI NO SE ABRE EL 3000

app.listen(puerto, () => {
    console.log(`Servidor corriendo en el puerto ${puerto}`);
});
