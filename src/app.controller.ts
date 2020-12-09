import { Controller, Get, UseInterceptors, UploadedFile, Post, Req, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppService } from './app.service';
import { editFileName, pFileFilter } from './utils/file-uploading.utils';
import { processFile } from './utils/convert';
import fs = require('fs');
import { join } from 'path';
import os = require('os');
import path = require('path');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('canvas')
  getCanvas(): string {
    console.log(join(__dirname, 'templates/canvas.html'));
    const api = os.platform() === 'linux' ? '/api' : ''; //My DigitalOcean is using nginx reverse proxy with location /api
    console.log('api', api);
    const html = fs.readFileSync(join(__dirname, 'templates/canvas.html'), 'utf8').replace(/{{api}}/g, api);
    return html;
  }

  @Get()
  getUpdateFile(@Req() req: Request): string {
    console.log(join(__dirname, 'templates/fileupload.html'));
    let api = os.platform() === 'linux' ? '/api/' : ''; //My DigitalOcean is using nginx reverse proxy with location /api
    api = req['host'] == 'localhost' ? '' : '/api/';
    console.log('api', api);
    const html = fs.readFileSync(join(__dirname, 'templates/fileupload.html'), 'utf8').replace(/{{api}}/g, api);
    return html;
  }

  @Get('links')
  async getLinks(@Req() req: Request): Promise<string> {
    let api = os.platform() === 'linux' ? '/api/' : ''; //My DigitalOcean is using nginx reverse proxy with location /api
    api = req['host'] == 'localhost' ? '' : '/api/';
    let html = fs.readFileSync(join(__dirname, 'templates/base.html'), 'utf8').replace(/{{api}}/g, api);
    const curdir = fs.realpathSync('.');
    const imgdir = curdir + path.sep + 'images';
    console.log(JSON.stringify(req.headers));
    console.log(req.headers['x-forwarded-proto']);
    let protocol = req.headers['x-forwarded-proto'] !== undefined ? req.headers['x-forwarded-proto'] : req['protocol'];
    const baseurl = protocol + '://' + req.headers['host'];
    console.log('baseurl', baseurl);
    let referer = req.headers['referer'];
    referer = String(referer).endsWith('/') ? String(referer).substring(0, String(referer).length - 1) : referer;
    console.log('referer', referer);
    const dir = await fs.promises.opendir(imgdir);
    let body = '';
    let alink = '';

    body += '<h2>Available presentations</h2><hr/>';

    for await (const dirent of dir) {
      console.log(dirent.name, dirent.isDirectory());
      if (dirent.isDirectory()) {
        // referer should come with 'api' if on my DigitalOcean Linux
        alink = `<a href='${referer + '/presentations/' + path.basename(dirent.name, '.json')}'>${path.basename(dirent.name, '.json')}</a>`;
        body += alink + '<br/>';
        body += '<hr/>';
      }
    }
    html = html.replace(/{{body}}/g, body);
    return html;
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: pFileFilter,
      limits: { fileSize: 1024 * 1024 * 1000 },
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      })
    }
    )
  )
  async uploadFile(@UploadedFile() file, @Req() req: Request, @Res() res: Response) {
    console.log(file);
    console.log(`${file.path}`);
    let refurl = req.headers['referer'] != undefined ? req.headers['referer'] : '';
    refurl = String(refurl).endsWith('/') ? String(refurl).substring(0, String(refurl).length - 1) : refurl;
    console.log('referer', refurl);
    const convert = await processFile(file.path, file.originalname);
    console.log(convert);
    const xresponse = {
      originalname: file.originalname,
      filename: file.filename,
      convert: convert,
      presentationurl: refurl + convert.imagesOutDir
    };
    //return xresponse;
    return res.redirect(refurl + convert.imagesOutDir);
  }

}
