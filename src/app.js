import express from "express";
import fs from "node:fs";
import ProductRoute from './routes/products.routes.js'
import { _dirname } from "./utils.js";
import CartRoute from './routes/carts.routes.js'


import * as url from "url";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(_dirname + '/public'))
app.use('/api/products',ProductRoute)
app.use('/api/carts',CartRoute)
app.use

app.get("/", (req, res) => {
  res.send(
    "<h1>Mi primera entrega. Me acuerdo del dia en el que de la entrega yo me enamore</h1>"
  );
});

app.listen(8080, () => {
  console.log("Servidor listo");
});
