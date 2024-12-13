"use strict"
const Personel = require("../models/personnel")
const Token = require("../models/token")
const passwordEncrypt = require("../helpers/passwordEncrypt")
module.exports = {
    //!Giriş çıkış işlemleri

    login: async (req, res) => {
        /*
            #swagger.tags = ['Authentication']
            #swagger.summary = 'Login'
            #swagger.description = `Login with username & password`
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    username: '*String',
                    password: '*String'
                }
            }
            _swagger.ignore = true
            _swagger.deprecated = true
        */

        const { username, password } = req.body //'bir personelin sistem girişi yapmasını sağlayacak parametler

        if (username && password) {
            const user = await Personel.findOne({ username, password })
            if (user && user.isActive) {
                //!Token
                //*token var mıdır? kullanıcı _id özelliği her kayıt için benzersiz bir tanımlayıcıydı.Eğer token modelinde userId alanı _id eşit olan bir kaydı bulursa kullanıcın kaydı var demektir
                let tokenData = await Token.findOne({ userId: user._id })

                if (!tokenData) {
                    //'tokenData undefined ya da null ise
                    const tokenKey = passwordEncrypt(user._id + Date.now()) //! burada kullanıcının benzersiz ıd si ile,o anın zamanı birleşir elde edilem girdi passwordEncrypt fonksiyonuna verilir ve sonuç olarak benzersiz bir ıd oluşur
                    console.log(tokenKey)
                    tokenData = await Token.create({ userId: user._id, token: tokenKey })
                    //? yeni oluşturalan tokenkey kullanıcının ıd si ile beraber modele göre(modelde vermişti userId ve token) veritabanına eklenir ve buna da dokenData der. Yani şöyle bir somut örnek olabilri tokenData={userId:"123456", token: "12h64jdsak53"}
                }

                res.status(200).send({
                    error: false,
                    token: tokenData.token,
                    user
                })
            } else {
                res.errorStatusCode = 401;
                throw new Error("Yanlış kullanıcı adı ve şifre")

            }
        } else {
            res.errorStatusCode = 403;
            throw new Error("Lütfen kullanıcı adı ve şifre giriniz")
        }
    },
    logout: async (req, res) => {
        /*
            #swagger.tags = ['Authentication']
            #swagger.summary = 'Logout'
        */
        req.session = null //'oturum bilgileri temizlendi

        const auth = req.headers?.authorization || null
        const tokenKey = auth ? auth.split(" ") : null
        let deleted = null
        if (tokenKey && tokenKey[0] == "Token") {
            deleted = await Token.deleteOne({ token: tokenKey[1] })
            res.status(200).send({
                message: "logout: token deleted",
                deleted //!silinen gösterilsin
            })
        }
    }
}