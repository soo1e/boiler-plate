const express = require('express')
const app = express()
const port = 5001
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require('./models/User')
const { auth } = require('./middleware/auth')

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

app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어륾 통과해 왔다는 이야기는 Authentication이 True라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})


app.get('/logout', auth, async (req, res) => {
    try {
        // 사용자의 토큰을 빈 문자열로 업데이트하여 무효화시키기
        await User.findOneAndUpdate({ _id: req.user._id }, { token: "" });
        return res.status(200).send({
            success: true
        });
    } catch (err) {
        console.error(err);
        return res.json({ success: false, err });
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})