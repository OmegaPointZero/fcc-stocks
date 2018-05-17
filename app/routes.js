const Stocks = require('./models/stocks.js')
const yahooFinance = require('yahoo-finance')

module.exports = (function(app,passport){

    // math() and makeRand() generate random RGB value with bright colors
    var math = function(number, index){
        if(number*index < 256){
            return number*index
        } else {
            return number
        }
    }

    var makeRand = function(){
        var number = Math.floor((Math.random() * 100) % 256);
        number = math(number, 3)
        number = math(number, 2)        
        return number
    }

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
        var rgb = 'rgb('+makeRand()+','+makeRand()+','+makeRand()+',1)'
        newstock.rgb = rgb
        console.log(rgb)
        /* RANDOMLY GENERATE BRIGHT RGB VALUES  */
        console.log(newstock)
        newstock.save(function(err){
            if(err) throw err
            /* Make new independent object 
            with same qualities but add 
            Obj.type for wss client listeners
            to know if they add or delete the ticker*/
            var passObj = {}
            passObj.ticker = newstock.ticker
            passObj.rgb = newstock.rgb
            passObj.type = 'add'
            wss.broadcast(JSON.stringify(passObj))
        })

    }
    
    function removeCurrentStocks(oldStock){
        Stocks.remove({ticker: oldStock}, function(err){
            var passObj = {}
            passObj.ticker = oldStock
            passObj.type = 'remove'
            if(err) throw err
            wss.broadcast(JSON.stringify(passObj))
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
            console.log('Removing ' + stock + ' from Mongoose database...')
            removeCurrentStocks(stock)
            res.send('success')
        } else {
            res.send('Error. Ask the administrator to check the logs')
        }
    })
    
    app.get('/', function(req,res){

        Stocks.find({},{},function(err,stocks){
            console.log(stocks)            
            res.render('index.ejs', {
                data : stocks
            })
        })
    })

});
