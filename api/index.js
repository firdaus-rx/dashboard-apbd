const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// ENABLE CORS
app.use(cors());

// OPTIONAL STATIC (aman di Vercel juga)
app.use(express.static("public"));

app.get("/api/apbd", async (req, res) => {

    try {

        const periode = req.query.periode || "1";
        const tahun = req.query.tahun || "2026";
        const provinsi = req.query.provinsi || "01";
        const pemda = req.query.pemda || "10";

        const targetUrl =
            `https://djpk.kemenkeu.go.id/portal/data/apbd?periode=${periode}&tahun=${tahun}&provinsi=${provinsi}&pemda=${pemda}`;

        const response = await axios.get(targetUrl);

        const $ = cheerio.load(response.data);

        const hasil = [];

        $("#tbl_data tbody tr").each((i, el) => {

            const td = $(el).find("td");

            if (td.length >= 5) {

                const akun = $(td[1]).text().trim();

                const style = $(td[1]).attr("style") || "";

                let level = 1;

                if (style.includes("2em")) level = 2;
                if (style.includes("4em")) level = 3;

                hasil.push({
                    akun,
                    level,
                    anggaran: $(td[2]).text().trim(),
                    realisasi: $(td[3]).text().trim(),
                    persen: parseFloat(
                        $(td[4]).text().trim().replace(",", ".")
                    )
                });

            }

        });

        // ===== RESPONSE TETAP SAMA PERSIS =====
        return res.json({
            success: true,
            metadata: {
                judul: $("#judul").text().trim(),
                wilayah: $("#wilayah").text().trim(),
                keterangan: $("#keterangan").text().trim()
            },
            data: hasil
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = app;