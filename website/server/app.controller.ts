import { Controller, Post, Get, Next, Req, Res, HostParam } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import mailchimp from '@mailchimp/mailchimp_marketing';

require('dotenv').config();

@Controller()
export class AppController {
  @Post('/callback')
  callbackMonitoring(@Req() req: Request) {
    return JSON.stringify(host);
  }

  @Get('*')
  site(@Res() res: Response, @Next() next: NextFunction, @Req() req: Request, @HostParam() host) {
    // console.log(host);
    if (req.path.includes('graphql')) return next();

    return res.render('index', {
      ROOT_PATH: process.env.ROOT_PATH || '/',
      host: JSON.stringify(host),
      path: req.path,
    });
  }
}

@Controller('mailer')
export class Mailer {
  @Post('post')
  async sendEmail(@Res() res: Response, @Req() req: Request) {
    const listID = process.env.LISTID;
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMPKEY1,
      server: process.env.MAILCHIMPSERVER,
    });
    const email = req.body.email;
    const jsonData = {
      email_address: email,
      status: 'subscribed',
    };
    try {
      await mailchimp.lists.addListMember(listID, jsonData);
      res.json({
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.json({
        success: false,
      });
    }
  }
}
