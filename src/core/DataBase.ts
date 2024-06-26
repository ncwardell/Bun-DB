import { DataManager } from "./data";
import { setColor } from "../helpers/colors";


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
        this.dataManager.initialize();
    }

    //Methods
    async startServer() {
        //Lol
        let that = this;

        //Server Setup
        const server = Bun.serve({
            port: this.port,
            async fetch(request) {
                let type = request.url.replace(that.hostname, '');
                switch (request.method) {
                    case 'GET':
                        console.log(await setColor(`- GET Request Received (${type})`, 'blue'));
                        switch (type) {
                            case '/api/getRootDirectory':
                                return new Response(JSON.stringify((await that.dataManager.retrieveData(that.rootDirectory))));

                            default:
                                return new Response('Not Found', { status: 404 });
                        }

                    case 'POST':
                        console.log(await setColor(`- POST Request Received (${type})`, 'cyan'));
                        let body: any;
                        switch (type) {
                            case '/api/getPathContents':
                                body = JSON.parse(JSON.stringify(await request.formData()))
                                return new Response(JSON.stringify((await that.dataManager.retrieveData(body.path))));

                            case '/api/saveFile':
                                body = JSON.parse(JSON.stringify(await request.formData()))

                                if (body.path.includes('.json') && await that.isJson(body.data)) {
                                    return new Response(JSON.stringify(await that.dataManager.saveData(body.path, JSON.parse(body.data))));
                                } else {
                                    return new Response('Bad Request', { status: 400 });
                                }


                            default:
                                return new Response('Not Found', { status: 404 });
                        }

                    default:
                        return new Response('Method not allowed', { status: 405 });
                }
            },
            tls: this.tls
        });
        console.log(await setColor(`Listening on ${this.hostname}:${server.port}`, 'green'));

    }

    async isJson(_str: any) {
        try {
            JSON.parse(_str);
        } catch (e) {
            return false;
        }
        return true;
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