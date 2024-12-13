"use strict";

/* -------------------------------------------------------
    EXPRESS - Personnel API
------------------------------------------------------- */

const Personnel = require("../models/personnel");
const passwordEncrypt = require("../helpers/passwordEncrypt");

module.exports = {
  list: async (req, res) => {
    /*
        #swagger.tags = ['Personnels']
        #swagger.summary = 'List Personnels'
        #swagger.description = `
            You can send query with endpoint for filter[], search[], sort[], page and limit.
            <ul> Examples:
                <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                <li>URL/?<b>page=2&limit=1</b></li>
            </ul>
        `
    */
    //! data
    const data = await res.getModelList(Personnel, {}, "departmentId");

    // console.log("------------", req.session);
    res.status(200).send({
      error: false,
      //! detail
      detail: await res.getModelListDetails(Personnel),
      data,
    });
  },

  create: async (req, res) => {
    /*
        #swagger.tags = ['Personnels']
        #swagger.summary = 'Create Personnel'
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                $ref: '#/definitions/Personnel'
            }
        }
    */
    //! sistemde bir admin olacaksa ve db de admin önceden tanımlanmışsa
    // const isFirstAccount = (await Personnel.countDocuments()) === 0;
    // req.body.isAdmin = isFirstAccount ? true : false;

    //! ya da direkt admin false
    req.body.isAdmin = false;

    //! isLead Control:

    const isLead = req.body.isLead || false;

    if (isLead) {
      await Personnel.updateMany(
        { departmentId: req.body.departmentId, isLead: true },
        { isLead: false },
        { runValidators: true }
      );
    }
    const data = await Personnel.create(req.body);
    //! Task: kendisi takım lideriyse ve bunu false'a çekerse
    res.status(201).send({
      error: false,
      data,
    });
  },

  read: async (req, res) => {
    /*
        #swagger.tags = ['Personnels']
        #swagger.summary = 'Read Single Personnel'
    */
    const data = await Personnel.findOne({ _id: req.params.id });

    res.status(200).send({
      error: false,
      data,
    });
  },

  update: async (req, res) => {
    /*
        #swagger.tags = ['Personnels']
        #swagger.summary = 'Update Personnel'
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                $ref: '#/definitions/Personnel'
            }
        }
    */
    //! isLead Control:
    const isLead = req.body.isLead || false;

    if (isLead) {
      const { departmentId } = await Personnel.findOne(
        { _id: req.params.id },
        { departmentId: 1 }
      );

      await Personnel.updateMany(
        { departmentId, isLead: true },
        { isLead: false },
        { runValidators: true }
      );
    }

    //! Does it perform update validation by default?
    const data = await Personnel.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    res.status(202).send({
      error: false,
      data,
      new: await Personnel.findOne({ _id: req.params.id }),
    });
  },
  //! Task:team lead silinirse
  delete: async (req, res) => {
    /*
        #swagger.tags = ['Personnels']
        #swagger.summary = 'Delete Personnel'
    */
    const data = await Personnel.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },

  //   //! LOGIN & LOGOUT

  //   login: async (req, res) => {
  //     const { username, password } = req.body;

  //     if (username && password) {
  //       const user = await Personnel.findOne({ username, password });
  //       if (user) {
  //         if (user.password !== passwordEncrypt(password)) {
  //           res.errorStatusCode = 401;
  //           throw new Error("Login parameters are not true.");
  //         }
  //         // Set Session:
  //         req.session = {
  //           id: user._id,
  //           password: user.password,
  //         };
  //         // Set Cookie:
  //         if (req.body?.rememberMe) {
  //           req.session.rememberMe = true;
  //           req.sessionOptions.maxAge = 1000 * 60 * 60 * 24 * 3; // 3 Days
  //         }

  //         res.status(200).send({
  //           error: false,
  //           message: "Login is OK",
  //           user,
  //         });
  //       } else {
  //         res.errorStatusCode = 401;
  //         throw new Error("Wrong Username or Password.");
  //       }
  //     } else {
  //       res.errorStatusCode = 401;
  //       throw new Error("Please enter a valid username and password.");
  //     }
  //   },

  //   logout: async (req, res) => {
  //     req.session = null;
  //     res.send({
  //       error: false,
  //       maessage: "Logout is completed",
  //     });
  //   },
};
