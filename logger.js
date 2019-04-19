let fs = require("fs");

module.exports = class Logger
{
    static init()
    {
        //Logger.stream = fs.createWriteStream("Log.txt");
    }
    
    static log(message)
    {
        console.log(message);
        //Logger.stream.write(message);
    }
    
    static preLoop()
    {
        //Logger.stream.cork();
    }
    
    static postLoop()
    {
        //Logger.stream.uncork();
    }
}