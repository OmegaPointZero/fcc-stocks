const Stocks = require('./models/stocks.js')

module.exports = (function(app,passport){

    const WebSocketServer = require('ws').Server;
    wss = new WebSocketServer({port: 40510})
    wss.on('connection', function (ws) {
        console.log("connected clients: " + wss.clients.size)
        ws.on('message', function (message) {
            console.log('received: %s', message)
        })
    })
    wss.broadcast = function broadcast(data) {
      wss.clients.forEach(function each(client) {
          client.send(data);
      });
    };

    var currentStocks = []

    function getCurrentStocks(){
        var current = []
        Stocks.find({},{},function(err,stocks){
            for(i=0;i<stocks.length;i++){
                current.push(stocks[i].ticker)
                if(current.length == stocks.length){
                    console.log(current)
                    wss.broadcast(current.join(','))
                }
            }
        })
    }

    function addCurrentStocks(newStock){
        var newstock = new Stocks();
        newstock.ticker = newStock;
        console.log(newstock)
        newstock.save(function(err){
            if(err) throw err
            getCurrentStocks()
        })

    }
    
    function removeCurrentStocks(oldStock){
        Stocks.remove({ticker: oldStock}, function(err){
            if(err) throw err
        })
    }

    app.post('/api/update', function(req,res){
        console.log(req.body)
        var type = req.body.type;
        var stock = req.body.stock;
        if(type=="add"){
            console.log('Adding ' + stock + ' to Mongoose database...')
            addCurrentStocks(stock)
            res.send('success')
        }else if(type=="remove"){
            console.log('Removing ' + stock + 'from Mongoose database...')
            removeCurrentStocks(stock)
            res.send('success')
        } else {
            res.send('Error. Ask the administrator to check the logs')
        }
    })
    
    app.get('/', function(req,res){
        Stocks.find({},{},function(err,stocks){
            res.render('index.ejs', {
                data : stocks
            })
        })
    })

});
