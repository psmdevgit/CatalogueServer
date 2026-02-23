const express = require("express");
const router = express.Router();
const { sql, getConnection } = require("../db");
const axios = require("axios");


// 👉 GET ALL PRODUCTS
router.get("/categoryGroup", async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`  
            select distinct Catname from CatMaster order by Catname asc
        `);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// 👉 INSERT PRODUCT
router.post("/products", async (req, res) => {
    try {
        const { name, price } = req.body;

        const pool = await getConnection();
        await pool.request()
            .input("name", sql.VarChar, name)
            .input("price", sql.Decimal(10,2), price)
            .query("INSERT INTO Products(Name,Price) VALUES(@name,@price)");

        res.send("Product Added ✅");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/goldProducts/search", async (req, res) => {
  try {
    const { product, fromWt, toWt } = req.query;

    const pool = await getConnection();
    let request = pool.request();

    let query = `
      SELECT 
        FTH.TagNo,
        SP.SubProName,
        FTH.NetWt,
        TI.Value
      FROM POTJ2526.dbo.TagHistory FTH
      LEFT JOIN POTJMaster.dbo.SubProduct SP 
        ON FTH.SubCode = SP.SubCode
      LEFT JOIN POTI2526.dbo.TagImages TI 
        ON TI.OrgRowsign = FTH.RowSign
      WHERE 1=1
    `;

    if (product) {
      query += ` AND SP.SubProName = @product`;
      request.input("product", sql.VarChar, product);
    }

    if (fromWt) {
      query += ` AND FTH.NetWt >= @fromWt`;
      request.input("fromWt", sql.Decimal(18, 3), parseFloat(fromWt));
    }

    if (toWt) {
      query += ` AND FTH.NetWt <= @toWt`;
      request.input("toWt", sql.Decimal(18, 3), parseFloat(toWt));
    }

    const result = await request.query(query);

    const formatted = result.recordset.map((item) => ({
      TagNo: item.TagNo,
      SubProName: item.SubProName,
      NetWt: item.NetWt,
      ImageBase64: item.Value
        ? item.Value.toString("base64")
        : null
    }));

    console.log("result images", formatted);

    res.json(formatted); // ✅ CORRECT

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/subProducts", async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT DISTINCT SubProName 
    FROM POTJMaster.dbo.SubProduct
    ORDER BY SubProName
  `);

  res.json(result.recordset); // IMPORTANT
});
module.exports = router;