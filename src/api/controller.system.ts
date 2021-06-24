import { Response } from 'express';

import { Get } from './decorator/verb';
import { Controller } from './decorator/controller';
import { Res } from './decorator/parameter';

@Controller('/')
export class SystemController {
  @Get('/test')
  test(@Res() res: Response) {
    return res.send('Hello World!');
  }
}
