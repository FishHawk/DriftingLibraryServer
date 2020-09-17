import { Response } from 'express';

import { ControllerAdapter } from './adapter';

import { Get } from './decorator/action';
import { Res } from './decorator/param';
import { BadRequestError } from './exception';

export class SystemController extends ControllerAdapter {
  constructor() {
    super();
  }

  @Get('/test')
  test(@Res() res: Response) {
    return res.send('Hello World!');
  }
}
