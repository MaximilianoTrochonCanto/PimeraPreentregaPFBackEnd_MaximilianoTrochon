import {Router} from "express"
import path from "path";
import fs from "node:fs";
import { _dirname } from "../utils.js";

const router = Router();
const filePath = path.join(_dirname,'fileManager', 'carts.json');

async function listaCarritos() {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(data); // Parse JSON data here
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}



router.get("/", async (req, res) => {
    const resultado = await fs.promises.readFile(
      filePath,
      "utf-8"
    );
    res.send(JSON.parse(resultado));
  });
  
  router.get("/:cid", async (req, res) => {
    try {
      const carritos = await listaCarritos();
      const carritoBuscado = carritos.find((c) => c.id === req.params.cid);
  
      if (!carritoBuscado) {
        return res.status(404).json({
          message: `El carrito con ID ${req.params.cid} no fue encontrado`,
        });
      }
  
      res.status(200).json(carritoBuscado.products);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        message: "Hubo un error al procesar la solicitud",
      });
    }
  });

  router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        let carritos = await listaCarritos();

        const cartIndex = carritos.findIndex(c => c.id === cid);

        if (cartIndex === -1) {
            return res.status(404).json({
                message: `El carrito con ID ${cid} no fue encontrado`
            });
        }

        if (!Array.isArray(carritos[cartIndex].products)) {
            carritos[cartIndex].products = [];
        }

        const productIndex = carritos[cartIndex].products.findIndex(p => p.product === pid);

        if (productIndex !== -1) {
            carritos[cartIndex].products[productIndex].quantity++;
        } else {
            carritos[cartIndex].products.push({ product: pid, quantity: 1 });
        }

       fs.promises.writeFile(
            filePath,
            JSON.stringify(carritos),
            "utf-8"
        );

        res.status(200).json({
            message: `Producto con ID ${pid} agregado al carrito con ID ${cid}`
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Hubo un error al procesar la solicitud"
        });
    }
});

router.post("/", async (req, res) => {
    try {
      const { products } = req.body;
  
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          message: "Debe agregar al menos un producto",
        });
      }
  
      const carritos = await listaCarritos();
  
      let maxId = 0;
      carritos.forEach((cart) => {
        if (cart.id > maxId) {
          maxId = cart.id;
        }
      });
      const id = String(Number(maxId) + Number(1));
  
      if (carritos.some((cart) => cart.id === id)) {
        return res.status(400).json({
          message: `El carrito ${id} ya existe`,
        });
      }
  
      const nuevoCarrito = { id:id, products };
  
      const updatedCarritos = [...carritos, nuevoCarrito];
  
      const filePath = path.join(_dirname, 'fileManager', 'carts.json');
      await fs.promises.writeFile(filePath, JSON.stringify(updatedCarritos), "utf-8");
  
      res.status(200).json({
        message: "Carrito agregado correctamente",
        nuevoCarrito,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        message: "Hubo un error al procesar la solicitud",
      });
    }
  });



export default router;
