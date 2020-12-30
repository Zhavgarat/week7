export default (express, bodyParser, createReadStream, crypto, http, mongo) => {
    const app = express();
    const author = "itmo287668";

    const CORS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers':'x-test,Content-Type,Accept, Access-Control-Allow-Headers'
    };


    app
        .use((r, res, next) => { r.res.set(CORS); next(); })
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({ extended: true }))
        .get("/sha1/:input", ({ params }, res) => {
             const { input } = params;
             const hash = crypto.createHash("sha1").update(input).digest("hex");
             res.send(hash);
        })

        .get('/login/', (req, res) => res.send(author))
        .get('/code/', (req, res) => {
            res.set({'Content-Type': 'text/plain; charset=utf-8'});
            createReadStream(import.meta.url.substring(7)).pipe(res);
        })
       
        .get('/req/', (req, res) => {

            res.set({'Content-Type': 'text/plain; charset=utf-8'});
            const addr = req.query.addr;
            const newUrl = new URL(addr);

            let options = {
                host: `${newUrl.host}`,
                path: `${newUrl.pathname}`
            };

            console.log(options);

            http.get(options, function(r) {

                let bodyChunks = [];
                r.on('data', function(chunk) {
                    bodyChunks.push(chunk);
                }).on('end', function() {

                    let body = Buffer.concat(bodyChunks);
                    console.log('BODY: ' + body);

                    res.send(body);
                })
            });
        })
        .post('/req/', (req, res) => {

            res.set({'Content-Type': 'application/x-www-form-urlencoded'});
            let addr = req.body.addr;
            let newUrl = new URL(addr);

            let options = {
                host: `${newUrl.host}`,
                path: `${newUrl.pathname}`
            };

            console.log(options);

            http.get(options, function(r) {

                let bodyChunks = [];
                r.on('data', function(chunk) {
                    bodyChunks.push(chunk);
                }).on('end', function() {

                    let body = Buffer.concat(bodyChunks);
                    console.log('BODY: ' + body);

                    res.send(body);
                })
            });
        })
          .post("/insert/", async ({ body }, res) => {
              const { login, password, URL } = body;

              const UserSchema = mongo.Schema({
                login: String,
                password: String,
              });

             const User = mongo.model("User", UserSchema);

             const connection = await mongo.connect(URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
              });

             const user = new User({ login, password });

             user.save((e) => {
                 connection.disconnect();

                if (e) {
                   return res.send(e.message);
                }

                return res.send(user);
               });
            })
        .all('*', (req, res) => res.send(author));


    return app;

};
