let fs = require("fs");

module.exports = class Logger
{
    static init()
    {
        //Logger.stream = fs.createWriteStream("Log.log");
    }
    
    static log(message)
    {
        console.log(message);
        //Logger.stream.write(message + "\n");
    }
    
    static preLoop()
    {
    }
    
    static postLoop()
    {
    }
}