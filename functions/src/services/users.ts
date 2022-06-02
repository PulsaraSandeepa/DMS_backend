import {addUser, createAuthUser, setCustomUserClaims} from "./../shared/users";
import {Response} from "express";
import AuthenticatedRequest from "../common/interfaces/express/AuthenticatedRequest";
import CreateUserRequest from "../common/interfaces/requests/CreateUserRequest";
import User from "../common/models/User";
import nodemailer, {SendMailOptions} from "nodemailer";

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const body: CreateUserRequest = req.getBody(new CreateUserRequest());

  if (!body.isValidRequest()) {
    return res.json({
      success: false,
      message: "Please check request body",
      errors: body.getRequestErrors(),
    });
  }

  try {
    // create authentication
    const userRecord = await createAuthUser(body.email!, body.password!);

    const user = new User(body.firstName!, body.lastName!, body.email!, body.phone!, body.type!, userRecord.uid!);
    // set custom claim [role]
    await setCustomUserClaims(userRecord.uid, {role: user.type});
    // add firestore document
    await addUser(userRecord.uid, user.getProperties());

    // nodemailer config
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "5acc4160393dc9",
        pass: "acc95bfc306e8a",
      },
    });

    const mailOption: SendMailOptions = {
      from: "<authentication@smsb17.com>",
      to: user.email!,
      subject: "Profile Information | Student Management System",
      html: `<div> 
      <h5>Your account credentials</h5>
      <p>email: ${user.email}</p>
      <p>password: ${body.password}</p>
      </div>`,
    };

    // send mail
    transport.sendMail(mailOption, (err): any => {
      if (err) {
        return res.send({
          success: false,
          message: "Mail sending failed!",
        });
      }
      console.log(`Sent to: ${user.email}`);
    });

    return res.json({
      success: true,
      message: "User create successful!",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: `Error occured: ${error}`,

    });
  }
};
