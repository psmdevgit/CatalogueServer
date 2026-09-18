const { getConnection } = require("./db");
const t = async () => {
  const p = await getConnection();
  const r = await p.request().query(
    `SELECT P.ProName, COUNT(DISTINCT FTH.TagNo) AS Tags
     FROM POTJ2526.dbo.TagHistory FTH
     LEFT JOIN POTJMaster.dbo.Product P ON FTH.ProCode = P.ProCode
     LEFT JOIN POTI2526.dbo.TagImages TI ON TI.OrgRowsign = FTH.RowSign
     WHERE P.ProName IS NOT NULL
     GROUP BY P.ProName
     HAVING COUNT(DISTINCT FTH.TagNo) > 0
     ORDER BY P.ProName`
  );
  const rows = r.recordset.map((x) => x.ProName);
  const hits = rows.filter((n) =>
    /DIA|RING|PENDANT|NECKLACE|EARRING|THALI|COIN|BAR/i.test(n || "")
  );
  console.log("=== distinct ProNames that touch any keyword ===");
  for (const n of hits) console.log(n);
  console.log("total touched:", hits.length);
  process.exit(0);
};
t().catch((e) => {
  console.error(e);
  process.exit(1);
});