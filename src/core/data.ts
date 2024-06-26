import fs from 'fs-extra';
import { readdir } from "node:fs/promises";
import { setColor } from '../helpers/colors';


//Generate Data Paths File Structure
class pathObject {

    paths: { [key: string]: string } = {
        dataStorage: '',
        config: '',
    };

    constructor(_dataFolder: string, _pathArray: string[]) {
        this.paths.dataStorage = _dataFolder;
        this.paths.config = _dataFolder + '/config.json';
        for (let _path of _pathArray) {
            this.paths[_path] = _dataFolder + '/' + _path;
        }
    }

    async ensurePaths() {
        //Check If Paths Exist
        for (let _dataPath of Object.entries(this.paths)) {
            //Ensure It Exists if not
            if (await fs.pathExists(_dataPath[1]) == false) {
                if (JSON.stringify(_dataPath[1]).includes('.json')) {
                    await fs.outputJson(_dataPath[1], {});
                } else {
                    await fs.ensureDir(_dataPath[1]);
                }
            }
        }
    };
}




//Create DataManager
export class DataManager {

    //Data Path Storage
    dataPaths: pathObject;

    //Constructs The Object
    constructor(_dataFolder: string, _pathArray: string[]) {
        this.dataPaths = new pathObject(_dataFolder, _pathArray);
    };

    //Initialize Storage
    async initialize() {
        await this.dataPaths.ensurePaths();
        console.log(await setColor('| Database Initialized |', 'magenta') + '\n');
    };

    async retrieveData(_path: string) {
        console.log(await setColor(' • Retrieving Data', 'yellow'));
        if (await fs.pathExists(_path) == true) {

            if (JSON.stringify(_path).includes('.json')) {
                console.log(await setColor(` ➛ Returning JSON File (${_path})`, 'orange'));
                return await Bun.file(_path).json();
            } else {
                console.log(await setColor(` ➛ Returning Directory List (${_path})`, 'orange'));
                return await readdir(_path);
            }

        } else {
            console.log(await setColor(` ➛ Retrieving Data Failed (${_path})`, 'red'));
            return false;
        }
    };

    async deleteData(_path: string) {
        console.log(await setColor(' • Deleting Data', 'yellow'));
        if (await fs.pathExists(_path) == true) {
            await fs.remove(_path);
            console.log(await setColor(` ➛ Data Deleted (${_path})`, 'orange'));
            return true;
        } else {
            console.log(await setColor(` ➛ Deleting Data Failed (${_path})`, 'red'));
            return false;
        }
    }

    async saveData(_path: string, _data: JSON) {
        console.log(await setColor(' • Saving Data', 'yellow'));
        let file = Bun.file(_path);
        await Bun.write(file, JSON.stringify(_data));

        if (await fs.pathExists(_path) == true) {
            console.log(await setColor(` ➛ Data Saved (${_path})`, 'orange'));
            return true;
        }else{
            console.log(await setColor(` ➛ Data Save Failed (${_path})`, 'red'));
            return false;
        }
    };

    async injectPath(_path: string) {
        this.dataPaths.paths[_path] = this.dataPaths.paths.dataStorage + '/' + _path;
        await this.dataPaths.ensurePaths();
        console.log(await setColor(` • Path Injected (${_path})`, 'magenta'));
    }


}



