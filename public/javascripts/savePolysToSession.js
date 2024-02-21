import {fs} from 'fs';

export function saveTo()
{
    console.log("HERE");
    const dir = 'public/localPolygons';
    fs.readdir(dir, (err, files) => {
    
    console.log(files.length);
});
}