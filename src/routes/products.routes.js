import {Router} from "express"
import path from "path";
import fs from "node:fs";
import { _dirname, uploader } from "../utils.js";

const router = Router();
const filePath = path.join(_dirname,'fileManager', 'products.json');

async function listaProductos() 
  {
    try{
      const data = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(data)
  }catch(error){
    console.log(error)
  }
}


router.get("/", async (req, res) => {
    try {
     
  
      const jsonData = await listaProductos()
      let limit = parseInt(req.query.limit);
      if (isNaN(limit) || limit <= 0) {
        limit = jsonData.length; 
      }
      res.status(200).json(jsonData.slice(0, limit));
    } catch (error) {
      console.error("Error reading file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/:pId", async (req, res) => {
    try {
      
      
      const products = await listaProductos();
  
      const product = products.find((p) => p.id === req.params.pId);
  
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
  
      res.json(product);
    } catch (err) {

        console.error("Error reading or parsing file:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/",uploader.single('thumbnail'), async (req, res) => {
    try {
      const { title, description, price, thumbnail, stock, code } = req.body;
      if (!title|| !description || !price || !stock || !code) {
        return res.status(400).json({
          message: "Los campos 'titulo', 'descripcion', 'precio', 'stock' y 'codigo' son obligatorios.",
        });
      }
      const parsedPrecio = parseFloat(price);
    const parsedStock = parseInt(stock);
    if (isNaN(parsedPrecio) || parsedPrecio <= 0 || isNaN(parsedStock) || parsedStock <= 0) {
      return res.status(400).json({
        message: "Los campos 'precio' y 'stock' deben ser números mayores que cero.",
      });
    }

        const allProducts = await listaProductos();
  
        const lastId =
          allProducts.length === 0
            ? 1
            : Number(
                allProducts[allProducts.length - 1].id
              ) + 1;
        const newProduct = { id: lastId.toString(),status:true, ...req.body };
        const copia = allProducts;
        copia.push(newProduct);
        console.log(copia);
        await fs.promises.writeFile(
          filePath,
          JSON.stringify(copia),
          "utf-8"
        );
        res.status(200).json({
          ...newProduct,
          mensaje: "Producto agregado",
        });
      
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  });
  
  router.put("/:pId", async (req, res) => {
    try {
      const { title, description, price, thumbnail, stock, code, category } =
        req.body;
      const id = req.params.pId;
      const productos = await listaProductos();
  
      const productosArray = productos;
  
      const productoBuscado = productosArray.find((p) => p.id === id);
  
      if (!productoBuscado) {
        throw new Error("El producto no se puede actualizar porque no existe.");
      } else {


        if (title !== undefined) productoBuscado.title = title;
        if (description !== undefined) productoBuscado.description = description;
        if (code !== undefined) productoBuscado.code = code;
        if (price !== undefined) productoBuscado.price = price;
        if (category !== undefined) productoBuscado.category = category;
        if (stock !== undefined) productoBuscado.stock = stock;
  
        const copia = productosArray.map((p) => {
          if (p.id === id) {
            return productoBuscado;
          } else {
            return p;
          }
        });
  
        await fs.promises.writeFile(
          filePath,
          JSON.stringify(copia),
          "utf-8"
        );
  
        res.status(200).json({
          message: "Producto actualizado correctamente.",
          producto: productoBuscado,
        });
      }
    } catch (error) {
      res.status(400).json({
        mensaje: error.message, 
      });
    }
  });

  router.delete("/:pId", async (req, res) => {
    try {
      const id = req.params.pId;
      let productos = await listaProductos();
  
      const productosArray = productos;
  
      const index = productosArray.findIndex((p) => p.id === id);
  
      if (index === -1) {
        throw new Error("Producto no encontrado.");
      }
  
      const productoBorrado = productosArray.splice(index, 1)[0];
  
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(productosArray),
        "utf-8"
      );
  
      res.status(200).json({
        message: "Producto borrado.",
        deletedProduct: productoBorrado,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  });
  

export default router;

