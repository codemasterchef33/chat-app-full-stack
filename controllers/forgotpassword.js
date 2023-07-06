const uuid = require('uuid');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');

exports.forgotpassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });

        if (user) {
            const apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.FORGET_USER_SECRET;

            const id = uuid.v4();
            user.createForgotpassword({
                id: id,
                isActive: true,
            })
                .catch(err => {
                    throw new Error(err)
                })

            const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            sendSmtpEmail.to = [{ email: user.email }];
            sendSmtpEmail.sender = { name: "shivansh", email: "sonukhulbe27@gmail.com" };
            sendSmtpEmail.subject = "password change for your expence tracker";
            sendSmtpEmail.htmlContent = ` <!DOCTYPE html>
            <html>
            <head>
                <title>PASSWORD CHANGE</title>
            </head>
            <body>
                <h1>Hello!</h1>
                <p>This is a sample HTML email.</p>
                <p>Here's a list:</p>
                <a href="http://localhost:3000/passward/resetpassward/${id}">Reset password</a>
            </body>
            </html>`;
           

            console.log("massage ===>", sendSmtpEmail);

            apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
                console.log("okkkk ------------------------->", data);
                return res.status(202).json({ message: 'Link to reset password sent to your mail ', sucess: true })
            }).catch((error) => {
                console.log(error);
                return res.json({ message: error, sucess: false });
            });

        } else {
            throw new Error('User not exist');
        }
    } catch (err) {
        console.error(err);
        return res.json({ message: err, sucess: false });
    }
};

exports.resetpassword = async (req, res, next) => {
    const id = req.params.id;
    // console.log('-----------------------------------------------------------');
    Forgotpassword.findOne({ where: { id: id } }).then(forgotpasswordrequest => {
        if (forgotpasswordrequest) {
            forgotpasswordrequest.update({ isActive: false });
            res.status(200).send(`<html>
                                    <form action="/passward/updatepassward/${id}" method="get">
                                        <label for="newpassward">Enter New password</label>
                                        <input name="newpassward" type="password"></input>
                                        <button>Reset Password</button>
                                    </form>
                                </html>`
            );
            res.end();

        }
    })
};

exports.updatepassword = async (req, res, next) => {
   
    const { newpassward } = req.query;
    // console.log(`newpassward ====` , newpassward);
    const id = req.params.id;
    try {
        const data = await Forgotpassword.findOne({ where: { id: id } })
        // console.log(data);
        const user = await User.findOne({ where: { id: data.userId } });
        if (user) {
            console.log(`email===>`, user.email);
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, (err, salt) => {
                if(err){
                    console.log(err);
                    throw new Error(err);
                }
                bcrypt.hash(newpassward , salt , (err, hash) => {
                    if(err){
                        console.log(err);
                        throw new Error(err);
                    }
                    user.update({passward : hash})
                    .then(() => {
                        return res.status(201).json({success : true, message: 'Successfully updated new Passward'});
                    })
                })
            })
        }else{
            return res.status(400).json({success : false , error : `No user exist`})
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({success : false , error : err})
    }
}