const express = require('express')
const app = express()
const port = 5001
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require('./models/User')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());



const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    }
).then(()=> console.log('connected to database'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('오늘도 화이팅')
})

app.post('/register', async (req, res) => {
    // 회원 가입 할 때 필요한 정보들을 클라이언트에서 가져오면
    // 그것들을 데이터베이스에 넣어준다.
    const user = new User(req.body)

    await user
        .save()
        .then(() => {
            res.status(200).json({
                success: true,
            });
        })
        .catch((err) => {
            console.error(err);
            res.json({
                success: false,
                err: err,
            });
        });
})

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }

        const isMatch = await user.comparePassword(req.body.password);

        if (!isMatch) {
            return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." });
        }

        const updatedUser = await user.generateToken();

        res.cookie("x_auth", updatedUser.token)
            .status(200)
            .json({ loginSuccess: true, userId: updatedUser._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ loginSuccess: false, message: "서버 오류입니다." });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})