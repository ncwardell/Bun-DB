import { DataManager } from "./core/DataManager";
import { StartServerManager } from "./core/ServerManager";


export class DataBase {
    //Properties
    port: number;
    tls: object
    dataManager: DataManager;
    hostname: string;
    rootDirectory: string;

    //Constructs The Object
    constructor(_rootDirectory: string, _hostname: string = 'http://localhost', _port: number = 3000, _tls: object = {}, _directoryMap: [] = []) {
        this.rootDirectory = _rootDirectory;
        this.port = _port;
        this.tls = _tls
        this.hostname = _hostname;
        this.dataManager = new DataManager(_rootDirectory, _directoryMap);
        //this.dataManager.initialize();
    };

    //Starts The Server
    async startServer() {
        await StartServerManager(this.dataManager, this.hostname, this.port, this.tls);
    }

}






/*
let tlsObject = {
    key: Bun.file("./certs/key.pem"),
    cert: Bun.file("./certs/certificate.pem"),
    passphrase: "-----",
}
*/


//let db = new DataBase('./data', 'http://localhost', 3000);
//db.startServer();