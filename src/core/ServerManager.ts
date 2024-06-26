import { setColor } from "../helpers/colors";
import type { DataManager } from "./DataManager";

export async function StartServerManager(_dataManager: DataManager, _hostname: string, _port: number, _tls: object) {

    //Server Setup
    const server = Bun.serve({
        port: _port,
        async fetch(request) {
            let type = request.url.replace(_hostname, '');
            switch (request.method) {
                case 'GET':
                    console.log(await setColor(`- GET Request Received (${type})`, 'blue'));
                    switch (type) {
                        case '/api/getRootDirectory':
                            return new Response(JSON.stringify((await _dataManager.retrieveData(await _dataManager.getRootDirectory()))));

                        default:
                            return new Response('Not Found', { status: 404 });
                    }

                case 'POST':
                    console.log(await setColor(`- POST Request Received (${type})`, 'cyan'));
                    let body: any;
                    switch (type) {
                        case '/api/getPathContents':
                            body = JSON.parse(JSON.stringify(await request.formData()))
                            return new Response(JSON.stringify((await _dataManager.retrieveData(body.path))));

                        case '/api/saveFile':
                            body = JSON.parse(JSON.stringify(await request.formData()))

                            if (body.path.includes('.json') && await isJson(body.data)) {
                                return new Response(JSON.stringify(await _dataManager.saveData(body.path, JSON.parse(body.data))));
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
        tls: _tls
    });
    console.log(await setColor(`Listening on ${_hostname}:${server.port}`, 'green'));

}

async function isJson(_str: any) {
    try {
        JSON.parse(_str);
    } catch (e) {
        return false;
    }
    return true;
}