const express = require('express')
const app = express()
const port = 5001

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://admin:qwer1234@cluster0.nbaqq2t.mongodb.net/?retryWrites=true&w=majority', {
}
).then(()=> console.log('connected to database'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('안녕하세요')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})