import { Controller, Get, Param } from '@nestjs/common';
import fs = require('fs');
import os = require('os');
import childProcess = require('child_process');

@Controller('presentations')
export class PresentationsController {

    @Get()
    getHello(): string {
        return 'Hola';
    }

    @Get(':imgpath')
    async getImages(@Param('imgpath') imagepath) {
        console.log('imagepath', imagepath);
        const dir = await fs.promises.opendir('./images/' + imagepath);
        console.log('images', fs.realpathSync(dir.path));
        console.log('JSON pre-process', dir.path + '0.json');
        console.log('JSON stats', dir.path + '.json');

        let text = ``;
        const api = os.platform() === 'linux' ? '/api' : ''; //My DigitalOcean is using nginx reverse proxy with location /api

        //Open JSON pre-process stat
        const jsonf0 = JSON.parse(fs.readFileSync(dir.path + '0.json').toString());
        const origFile = jsonf0.originalName;
        let pdfFile = jsonf0.name;

        if (fs.existsSync(dir.path + '.json') && fs.existsSync(pdfFile)) {
            //Open JSON stat
            const jsonf = JSON.parse(fs.readFileSync(dir.path + '.json').toString());
            pdfFile = jsonf.name;

            //PDF file has been generated, but images might still be being converted...
            const command = `pdfinfo "${pdfFile}" | grep Pages`;
            console.log('getPageCountwithPDFInfo command', command);

            const result = childProcess.execSync(command, { encoding: 'utf8' }).split(':')[1].trim();

            const slides = Number(result);

            let count = 0;
            const files = [];

            for await (const dirent of dir) {
                console.log(dirent.name);
                count++;
                files.push(dirent.name);
            }
            text = `<html><head>
                <meta charset="UTF-8" />
                    <link
                        rel="stylesheet"
                        href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css"
                    />
                    <style>
                    body {
                    margin: 0;
                    padding: 0;
                    }
                    h1 {
                    font-size: 20px;
                    margin-top: 24px;
                    margin-bottom: 24px;
                    }
                    </style>
                <meta http-equiv="refresh" content="30"></head><body><div class="col-md-6 offset-md-3 mt-5"><h3>${imagepath}</h3><br/>`;
            if (count != slides) {
                text += '<H1>Please wait...still generating images...</H1>';
            } else {
                text = `<html><head>
            <meta charset="UTF-8" />
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css"
            />
            <style>
            body {
              margin: 0;
              padding: 0;
            }
            h1 {
              font-size: 20px;
              margin-top: 24px;
              margin-bottom: 24px;
            }
            </style>
            </head><body>
            <div class="col-md-6 offset-md-3 mt-5">
            <h3>${imagepath}</h3><br/>`;
                files.sort();
                files.forEach(file => {
                    text += `<h4>${file}</h4>`;
                    text += `<img src='${api + '/' + imagepath + '/' + file}' />`;
                });

            }
            text += `</div></body></html>`;
        } else {
            //PDF has not yet been created, let's show a please wait message

            text = `<html><head>
                <meta charset="UTF-8" />
                    <link
                        rel="stylesheet"
                        href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css"
                    />
                    <style>
                    body {
                    margin: 0;
                    padding: 0;
                    }
                    h1 {
                    font-size: 20px;
                    margin-top: 24px;
                    margin-bottom: 24px;
                    }
                    </style>
                <meta http-equiv="refresh" content="30"></head><body><div class="col-md-6 offset-md-3 mt-5">`;
            text += `<H1>Please wait...'<strong>${origFile}</strong>' presentation being converted...</H1>`;
            text += `</div></body></html>`;
        }

        return text;
        dir.close();
    }
}
