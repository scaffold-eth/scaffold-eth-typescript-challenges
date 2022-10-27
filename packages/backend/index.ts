
import express, { Express, Request, Response } from 'express';
import fs from 'fs';
import https from 'https';
import cors from 'cors';
import bodyParser from 'body-parser';
import { AddressInfo } from 'net';

const app: Express = express();

let transactions: any = {}

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    console.log("/")
    res.status(200).send("hello world");
});

app.get("/transaction.json", (req: Request, res: Response) => {
    console.log("/transaction")
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(transactions));
});

app.get("/clear", (req: Request, res: Response) => {
    console.log("/clear")
    transactions = {};
    res.status(200).send('');
});

app.get("/:key", (req: Request, res: Response) => {
    const key = req.params.key
    console.log("/", key)
    res.status(200).send(transactions[key]);
});

app.post('/', (request: Request, response: Response) => {
    console.log("POOOOST!!!!", request.body);      // your JSON
    response.send(request.body);    // echo the result back
    const key = request.body.address + "_" + request.body.chainId
    console.log("key:", key)
    if (!transactions[key]) {
        transactions[key] = {}
    }
    transactions[key][request.body.hash] = request.body
    console.log("transactions", transactions)
});


if (fs.existsSync('server.key') && fs.existsSync('server.cert')) {
    https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app).listen(49832, () => {
        console.log('HTTPS Listening: 49832')
    })
} else {
    var server = app.listen(49832, function () {
        const address = server.address() as AddressInfo;
        console.log("HTTP Listening on port:", address?.port);
    });
}
