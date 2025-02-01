require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 600 });

app.use(compression());
app.use(express.static(path.join(__dirname, '../client/build'), { maxAge: '1d' }));
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: 10000,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database.');
    connection.release();
});

app.get("/ofertas-laborales", (req, res) => {
    const query = `
        SELECT plataforma, nom_oferta, nom_empresa, lugar, link_pagina 
        FROM ofertas_laborales 
        ORDER BY fecha DESC, RAND();
    `;
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send("Error al obtener ofertas");
        }
        res.json(results);
    });
});

app.get("/ofertas-laborales-hoy", (req, res) => {
    const cacheKey = "ofertas-laborales-hoy";
    const cachedResults = cache.get(cacheKey);

    if (cachedResults) return res.json(cachedResults);

    const query = `
SELECT plataforma, nom_oferta, nom_empresa, lugar, link_pagina FROM ofertas_laborales WHERE fecha = (SELECT MAX(fecha) FROM ofertas_laborales) ORDER BY nom_empresa DESC;

    `;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send("Error al obtener ofertas");
        }
        cache.set(cacheKey, results);
        res.json(results);
    });
});

app.get('/sugerencias', (req, res) => {
    const palabra = req.query.palabra || '';

    if (palabra.length === 0) {
        return res.json([]);
    }

    const sql = `
        SELECT DISTINCT nom_oferta 
        FROM ofertas_laborales 
        WHERE nom_oferta COLLATE utf8mb4_unicode_ci LIKE ? 
        LIMIT 10;
    `;

    pool.query(sql, [`%${palabra}%`], (error, results) => {
        if (error) {
            console.error('Error ejecutando la consulta de sugerencias:', error);
            return res.status(500).json({ error: 'Error al obtener sugerencias' });
        }
        const sugerencias = results.map(row => row.nom_oferta);
        res.json(sugerencias);
    });
});
app.get('/sugerencias2', (req, res) => {
    const palabra = req.query.palabra || '';

    if (palabra.length === 0) {
        return res.json([]);
    }

    const sql = `
SELECT DISTINCT nom_oferta 
FROM ofertas_laborales 
WHERE fecha_insercion = (
    SELECT MAX(fecha_insercion) 
    FROM ofertas_laborales
) 
  AND nom_oferta COLLATE utf8mb4_unicode_ci LIKE ? 
LIMIT 10;

    `;

    pool.query(sql, [`%${palabra}%`], (error, results) => {
        if (error) {
            console.error('Error ejecutando la consulta de sugerencias:', error);
            return res.status(500).json({ error: 'Error al obtener sugerencias' });
        }
        const sugerencias = results.map(row => row.nom_oferta);
        res.json(sugerencias);
    });
});
app.get('/contarObservacionesDiaAnterior', (req, res) => {
    const cacheKey = "contarObservacionesDiaAnterior";
    const cachedResults = cache.get(cacheKey);

    if (cachedResults) return res.json(cachedResults);

    const query = `
        SELECT COUNT(*) AS count 
        FROM ofertas_laborales 
        WHERE DATE(fecha) = (SELECT DATE(MAX(fecha)) FROM ofertas_laborales);
    `;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).send("Error al obtener datos");
        }
        cache.set(cacheKey, results[0]);
        res.json(results[0]);
    });
});

app.get('/contarObservacionesSemana', (req, res) => {
    const cacheKey = "contarObservacionesSemana";
    const cachedResults = cache.get(cacheKey);

    if (cachedResults) return res.json(cachedResults);

    const query = `
        SELECT COUNT(*) AS count 
        FROM ofertas_laborales AS ol 
        JOIN (
            SELECT fecha 
            FROM ofertas_laborales 
            GROUP BY fecha 
            ORDER BY fecha DESC 
            LIMIT 7
        ) AS ultimas_fechas 
        ON ol.fecha = ultimas_fechas.fecha;
    `;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).send("Error al contar observaciones de la semana");
        }

        cache.set(cacheKey, results[0]);
        res.json(results[0]);
    });
});

app.get('/contarObservacionesTotal', (req, res) => {
    const cacheKey = "contarObservacionesTotal";
    const cachedResults = cache.get(cacheKey);

    if (cachedResults) return res.json(cachedResults);

    const query = `SELECT COUNT(*) AS count FROM ofertas_laborales;`;
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).send("Error al contar observaciones totales");
        }
        cache.set(cacheKey, results[0]);
        res.json(results[0]);
    });
});

app.get("/selecionardepartamento/:departamento", (req, res) => {
    const departamento = req.params.departamento;
    const query = `
        SELECT plataforma, nom_oferta, nom_empresa, lugar, link_pagina 
        FROM ofertas_laborales 
        WHERE lugar LIKE ? 
        ORDER BY fecha DESC, RAND(); 
    `;
    const values = [`%${departamento}%`];

    pool.query(query, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send("Error al obtener ofertas");
        }
        res.json(results);
    });
});

app.get("/selecionarcarrera/:carrera", (req, res) => {
    const carrera = req.params.carrera;
    const query = `
        SELECT plataforma, nom_oferta, nom_empresa, lugar, link_pagina 
        FROM ofertas_laborales 
        WHERE nom_oferta REGEXP ? 
        ORDER BY fecha DESC, RAND();
    `;

    pool.query(query, [carrera], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send("Error al obtener ofertas");
        }
        res.json(results);
    });
});

app.use(express.static(path.join(__dirname, '../wwwroot')));

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '../wwwroot/sitemap.xml'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../wwwroot/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
