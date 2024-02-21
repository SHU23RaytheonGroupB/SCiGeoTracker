import {fs} from 'fs';

export default function saveTo()
{
    console.log("HERE");
    const dir = 'public/localPolygons';
    fs.readdir(dir, (err, files) => {
    
    console.log(files);
});
}