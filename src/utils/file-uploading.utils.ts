import { extname } from "path";

export const pFileFilter = (req, file, callback) => {
    // console.log(file);
    if (!file.originalname.match(/\.(pptx|ppt|key|odp|pdf)$/)) {
        return callback(new Error('Only presentation files are allowed!'), false);
    }
    callback(null, true);
};

export const editFileName = (req, file, callback) => {
    //const name = String(file.originalname.split('.')[0]).replace(/ /g, '_');
    const name = file.originalname.substr(0, file.originalname.lastIndexOf('.')).replace(/ /g, '_');
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    // callback(null, `${name}-${randomName}${fileExtName}`);
    console.log(randomName);
    callback(null, `${name}${fileExtName}`);
};