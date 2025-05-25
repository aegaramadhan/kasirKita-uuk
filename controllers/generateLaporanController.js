const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const Penjualan = require('../models/penjualanModel');

const generateLaporanController = {
    getDaftarPenjualanPDF: async (req, res) => {
        try {
            // Ambil data penjualan
            const penjualan = await Penjualan.find()
                .populate({
                    path: 'items.produk_id',
                    model: 'Produk',
                    select: 'namaProduk harga'
                })
                .populate({
                    path: 'pelanggan_id',
                    model: 'Pelanggan',
                    select: 'namaPelanggan'
                })
                .sort({ tanggalPenjualan: -1 });

            // Jika tidak ada data penjualan
            if (penjualan.length === 0) {
                return res.status(404).send('Tidak ada data penjualan untuk di-export');
            }

            // Hitung total penjualan
            const totalPenjualan = penjualan.reduce((total, penjualanItem) => {
                return total + penjualanItem.totalHarga;
            }, 0);

            // Generate HTML content
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Laporan Penjualan</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        .table th, .table td {
                            border: 1px solid #ddd;
                            padding: 12px;
                            text-align: left;
                        }
                        .table th {
                            background-color: #f4f4f4;
                        }
                        .total-row {
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Laporan Penjualan KasirKita</h1>
                        <p>Tanggal: ${new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Pelanggan</th>
                                <th>Nama Produk</th>
                                <th>Tanggal</th>
                                <th>Harga</th>
                                <th>Jumlah</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${penjualan.map((penjualanItem, index) => 
                                penjualanItem.items.map((item, itemIndex) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${penjualanItem.pelanggan_id ? penjualanItem.pelanggan_id.namaPelanggan : '-'}</td>
                                        <td>${item.produk_id ? item.produk_id.namaProduk : '-'}</td>
                                        <td>${penjualanItem.tanggalPenjualan ? new Date(penjualanItem.tanggalPenjualan).toLocaleDateString('id-ID') : '-'}</td>
                                        <td>Rp ${item.harga ? item.harga.toLocaleString('id-ID') : '-'}</td>
                                        <td>${item.jumlah || '-'}</td>
                                        <td>Rp ${item.total ? item.total.toLocaleString('id-ID') : '-'}</td>
                                    </tr>
                                `).join('')
                            ).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="6">Total Penjualan</td>
                                <td>Rp ${totalPenjualan.toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="footer">
                        <p>KasirKita - Sistem Kasir Modern</p>
                    </div>
                </body>
                </html>
            `;

            // Buat direktori laporan jika belum ada
            const dir = './public/laporan';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const pdfPath = path.join(dir, 'laporan-penjualan.pdf');

            // Launch puppeteer
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set content
            await page.setContent(htmlContent);

            // Generate PDF
            await page.pdf({
                path: pdfPath,
                format: 'A4',
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                }
            });

            // Close browser
            await browser.close();

            // Store penjualan IDs in session for deletion after download
            req.session.penjualanToDelete = penjualan.map(item => item._id);

            // Send file
            res.download(pdfPath, 'laporan-penjualan.pdf', async (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    return res.status(500).send('Error downloading file');
                }

                try {
                    // Delete the PDF file
                    fs.unlinkSync(pdfPath);

                    // Clear the sales data after successful download
                    await Penjualan.deleteMany({ _id: { $in: req.session.penjualanToDelete } });
                    
                    // Clear the session data
                    delete req.session.penjualanToDelete;
                } catch (error) {
                    console.error('Error cleaning up:', error);
                }
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Error generating PDF');
        }
    }
};

module.exports = generateLaporanController; 