const mysql = require('mysql');
const express = require('express')
const app = express();
const bcrypt = require('bcrypt');
const cors = require('cors')
// console.log(bcrypt)
const jwt = require('jsonwebtoken')
// console.log(jwt)

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "tnplab",
    password: ""
});

connection.connect((err) => {
    if (err) {
        console.log(err.sqlMessage)
    }
    else {
        console.log("Connect to database ::")
    }
})

app.post("/post", async (req, res) => {
    try {

        let { Email, password } = req.body;
        console.log(Email, password)

        // password hashing

        const salt = await bcrypt.genSalt(8)
        console.log(salt);

        pass = await bcrypt.hash(password, salt)
        password = pass;
        console.log(password)

        data = { Email, password }

        let query = "INSERT INTO login SET?";
        await connection.query(query, data, (error, result) => {
            if (error) {
                return res.json(error.sqlMessage)
            }
            res.json(result);
        })
    } catch (err) {
        res.json({ Error: err.message })
    }
})

app.post("/login", async (req, res) => {
    try {
        let { Email, password } = req.body;
        // data = {Email , password}
        let query = "SELECT * FROM login WHERE Email=?";
        const value = await connection.query(query, Email, async (error, result) => {
            if (error) {
                return res.json({ Error: error.sqlMessage })
            }
            // PaSSWORD compare 
            const passwordMatch = await bcrypt.compare(password, result[0].password)
            if (!passwordMatch) {
                return res.json({ Error: "oops Pasword  does not match " })
            }

            // token generate\
            const token = await jwt.sign({ Email }, "my name is deepak", { expiresIn: '24h' })
            console.log(token)

            res.json({ status: 200, response: "login", token })
        })
        // console.log(value)
    } catch (error) {
        res.json({ Error: error.message })
    }
})

app.get('/alluser', async (req, res) => {
    try {
        let token = req.header("token")
        let tokenVerify = await jwt.verify(token, "my name is deepak")
        if (!token) {
            return res.send({ Error: "token does not match" })
        }
        let query = "SELECT * FROM login"
        await connection.query(query, (error, output) => {
            if (error) {
                return res.send({ Error: error.sqlMessage })
            }
            res.send(output)
        })
    } catch (error) {
        res.send({ Error: error.message })
    }
})


app.listen(6000, () => console.log("Server is start at port 6000"))