const User = require("../models/userModel");
const Pelanggan = require("../models/pelangganModel");
const bcrypt = require("bcrypt");

const authController = {
    getRegister: (req, res) => {
        res.render('register');
    },

    getLogin: (req, res) => {
        res.render('login');
    },

    register: async (req, res) => {
        try {
            const { nama, alamat, telepon, username, password, role } = req.body;

            //Cek apakah user sudah ada
            const existingUser = await User.findOne({ "akun.username": username });
            if (existingUser) {
                return res.status(400).send("Username sudah digunakan");
            }

            //Hash password sebelum disimpan
            const hashedPassword = await bcrypt.hash(password, 10);

            //Buat user baru
            const newUser = new User({
                akun: {
                    username,
                    password: hashedPassword,
                    role: role || "pelanggan", // Default ke pelanggan jika role tidak dispecify
                }
            });

            await newUser.save();

            // Buat data pelanggan jika rolenya pelanggan
            if (newUser.akun.role === "pelanggan") {
                const newPelanggan = new Pelanggan({
                    namaPelanggan: nama,
                    alamat: alamat,
                    nomerTelepon: telepon,
                    user_id: newUser._id
                });

                await newPelanggan.save();
            }
            
            res.redirect("/auth/login");
        } catch (error) {
            console.error(error);
            res.status(500).send("Terjadi kesalahan saat registrasi");
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ "akun.username": username });
            if (!user) {
                return res.status(400).send("Username atau password salah");
            }

            const validPassword = await bcrypt.compare(password, user.akun.password);
            if (!validPassword) {
                return res.status(400).send("Username atau password salah");
            }

            // Dapatkan data pelanggan jika rolenya pelanggan
            let pelanggan = null;
            if (user.akun.role === "pelanggan") {
                pelanggan = await Pelanggan.findOne({ user_id: user._id });
            }

            //Simpan data user di session
            req.session.user = {
                id: user._id,
                username: user.akun.username,
                nama: pelanggan ? pelanggan.namaPelanggan : user.akun.username,
                role: user.akun.role
            };

            // Redirect berdasarkan role
            switch (user.akun.role) {
                case "admin":
                case "petugas":
                    res.redirect("/produk"); // Ke halaman daftar produk admin
                    break;
                case "pelanggan":
                    res.redirect("/produk/pelanggan"); // Ke halaman produk pelanggan
                    break;
                default:
                    res.redirect("/"); // Fallback ke homepage
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Terjadi kesalahan saat login");
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Gagal logout");
            }
            res.redirect("/auth/login");
        });
    }
};

module.exports = authController;