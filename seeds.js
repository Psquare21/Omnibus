 var mongoose = require("mongoose"),
 	Article =   require ("./models/articles");

var data = [{	
	text:"HIIIIII",
	author:"Harsh"
},
	{
		text:"Hello",
		author:"Yash"
	},
			{
				text:"Bonjour",
				author:"Jay"
			}
		  
		   ];


function seedDB(){
	Article.remove({}, function(err){
	if(err){
		console.log(err);
	}
	console.log("Removed articles!");
	
	
	data.forEach(function(seed){
		Article.create(seed, function(err,article){
		
			if(err){
				console.log(err);
			}else{
				console.log("Added articles!");
			}
	});	
});
});


}






module.exports = seedDB;