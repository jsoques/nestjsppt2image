
import moment = require('moment-timezone');
import dateFormat = require('dateformat');

import childProcess = require('child_process');
import os = require('os');
import path = require('path');
import fs = require('fs');
const out = fs.openSync('./logs/out.log', 'a');
const err = fs.openSync('./logs/err.log', 'a');

console.log('OS', os.platform());
console.log('freemem', os.freemem());
console.log('tempdir', os.tmpdir());

const pcmd = os.platform() == 'linux' ? '&' : '';
let convertCmd = os.platform() == 'win32' ? 'magick convert' : 'convert';
const curdir = fs.realpathSync('.'); // (await fs.promises.opendir('.')).path


async function processPPTXthenPDF(file, pdfFile, outdir) {
    if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
    } else {
        fs.readdir(outdir, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(outdir, file), err => {
                    if (err) throw err;
                });
            }
        });
    }
    const mem = String((os.freemem() / 1024 / 1024) * 0.90);
    const limitmem = parseInt(mem);
    const tempdir = os.tmpdir();

    const pptx2pdf = `soffice --headless --convert-to pdf "${file}" --outdir .${path.sep}output`;

    convertCmd = os.platform() == 'win32' ? 'pdftocairo' : 'pdftocairo';
    const subCommand = os.platform() == 'win32' ? '' : '';
    //let pdf2img = `${convertCmd} ${subCommand} -define registry:temporary-path=${tempdir} -limit area ${limitmem}mb -limit memory ${limitmem}mb -limit map ${limitmem}mb -density 400 ${pdfFile}[600x400] ${outdir + path.sep}image%d.jpg ${pcmd}`;
    let pdf2img = `${convertCmd} -jpeg -r 30 "${pdfFile}" "${outdir + path.sep}image" ${pcmd}`;

    const command = pptx2pdf + ' && ' + pdf2img;

    console.log('Combined command', command);

    let args = command.split(' ');

    args = args.splice(0, args.length - 1);

    const proc = childProcess.spawn(`${command}`, {
        shell: true,
        detached: true,
        windowsHide: true,
        stdio: ['ignore', out, err], // piping stdout and stderr to out.log
    });

    console.log('processALL command ', proc.spawnargs.join(' '));
    console.log('PID', proc.pid);

    proc.unref();

    return proc.pid;

}

export const processFile = async (theFile, originalName) => {

    //Datetime stuff
    const tz = moment.tz.guess();
    const startdateiso = new Date().toISOString();
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);
    const local = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');

    //PDF output folder
    const outdirpath = curdir + path.sep + 'output';

    //Rename file to remove spaces
    const origFile = fs.realpathSync(theFile);
    fs.renameSync(origFile, origFile.replace(/ /g, '_'));
    const newFile = fs.realpathSync(origFile.replace(/ /g, '_'));

    console.log('outdirpath', outdirpath);
    console.log('Original', origFile);
    console.log('Renamed', newFile);

    //PDF filename
    //const pdfFile = fs.realpathSync(outdirpath + path.sep + path.basename(newFile, '.pptx').replace('.key', '').replace('.odp', '') + '.pdf');
    const pdfFile = outdirpath + path.sep + path.basename(newFile, '.pptx').replace('.key', '').replace('.odp', '') + '.pdf';
    console.log(pdfFile);
    //Delete previous pdfFile if it exists
    if (fs.existsSync(pdfFile)) {
        fs.unlinkSync(pdfFile);
    }

    //Images folder
    const imagesOutDir = curdir + path.sep + 'images' + path.sep + path.basename(theFile, '.pptx').replace('.key', '').replace('.odp', '').replace(/ /g, '_');
    console.log('images', imagesOutDir);

    //Create JSON file for monitoring pre-process
    const fptr0 = fs.openSync(curdir + path.sep + 'images' + path.sep + path.basename(pdfFile, '.pdf') + '0.json', 'w');
    fs.write(fptr0, JSON.stringify({ originalName, name: pdfFile, imagesOutDir, local, startdateiso, startdate: now, tz, 'stage': 'pre-process' }), (e, w, d) => { console.log(d); });
    fs.close(fptr0, () => { });

    const pid = await processPPTXthenPDF(newFile, pdfFile, imagesOutDir);

    console.log('Processing in background...');

    console.log();
    console.log('-'.repeat(100));

    //Create JSON file for monitoring process
    const fptr = fs.openSync(curdir + path.sep + 'images' + path.sep + path.basename(pdfFile, '.pdf') + '.json', 'w');
    fs.write(fptr, JSON.stringify({ name: pdfFile, imagesOutDir, local, startdateiso, startdate: now, tz, pid }), (e, w, d) => { console.log(d); });
    fs.close(fptr, () => { });

    const api = os.platform() === 'linux' ? '/' : ''; //My DigitalOcean is using nginx reverse proxy with location /api

    return { startdate: now, pdfFile: 'output' + path.sep + path.basename(pdfFile), imagesOutDir: api + 'presentations/' + path.basename(imagesOutDir), message: 'Processing in background...', pid };

}

console.log('argv', process.argv);

