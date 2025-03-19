const jwt = require("jsonwebtoken");

router.get("/usuario", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(403).json({ error: "No autorizado" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const [rows] = await pool.query("SELECT id, nombre, email FROM usuarios WHERE id = ?", [decoded.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        res.status(401).json({ error: "Token inválido" });
    }
});
