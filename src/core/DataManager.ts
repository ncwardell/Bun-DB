import fs from 'fs-extra';
import { readdir } from "node:fs/promises";
import { setColor } from '../helpers/colors';


interface paths {
    RootDirectory: string,
    ConfigFile: string,
    DirectoryList: { [key: string]: any }
}

//Generate Data Paths File Structure
class pathObject {

    paths: paths = {
        RootDirectory: '',
        ConfigFile: '',
        DirectoryList: {}
    }


    constructor(_rootDirectory: string, _pathArray: string[]) {
        this.paths.RootDirectory = _rootDirectory;
        this.paths.ConfigFile = _rootDirectory + '/config.json';
        for (let _path of _pathArray) {
            this.paths.DirectoryList[_path] = _rootDirectory + '/' + _path;
        }
    }

    async ensurePaths() {

        //Check If Root Directory Exists
        if ((await fs.pathExists(this.paths.RootDirectory)) == false) {
            await fs.ensureDir(this.paths.RootDirectory);
        }

        //Check If Config File Exists
        if ((await fs.pathExists(this.paths.ConfigFile)) == false) {
            await fs.outputJson(this.paths.ConfigFile, {});
        }

        //load Config File
        this.paths = await fs.readJson(this.paths.ConfigFile);

        //Check If Directory Paths Exist
        for (let _dataPath of Object.entries(this.paths.DirectoryList)) {
            console.log(_dataPath);
            //Ensure It Exists if not
            if ((await fs.pathExists(_dataPath[1])) == false) {
                if (_dataPath[1].includes('.json')) {
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
        this.dataPaths.paths.DirectoryList[_path] = this.dataPaths.paths.RootDirectory + '/' + _path;
        await this.dataPaths.ensurePaths();
        console.log(await setColor(` • Path Injected (${_path})`, 'magenta'));
    }

    async loadDataBase(_path: string) {

        if(await this.retrieveData(_path)){
            
            
            
            
            console.log(await setColor(` • Database Loaded (${_path})`, 'magenta'));
        }

    }

    async saveDataBase() {
        //await this.retrieveData(this.dataPaths.paths.config);

        await this.saveData(this.dataPaths.paths.ConfigFile, JSON.parse(JSON.stringify(this.dataPaths.paths)));


    }

    async getRootDirectory() {
        return this.dataPaths.paths.RootDirectory;
    }


}



