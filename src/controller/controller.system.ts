import { Response } from 'express';

import { ControllerAdapter } from './adapter';

import { Get } from './decorator/verb';
import { Controller } from './decorator/controller';
import { Res } from './decorator/parameter';

@Controller('/')
export class SystemController extends ControllerAdapter {
  constructor() {
    super();
  }

  @Get('/test')
  test(@Res() res: Response) {
    return res.send('Hello World!');
  }
}
