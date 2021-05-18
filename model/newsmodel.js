var mongoose = require('mongoose');
Schema = mongoose.Schema;
var newsSchema = Schema({
    title:{type:String},
    description:{type:String},
    published:{type:String}
})

module.exports=mongoose.model('news',newsSchema,'newsList')