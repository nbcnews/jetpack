import * as basic from 'lib/basicUtils';

export default function(options,content){
	var options = basic.extend({
		urlPattern:'',	//regex url pattern
		runTime:'sync', // [sync, async, DOM]
		contentType:'JS', // [JS, HTML]
		runCondition:function(){} //[boolean return] run condition
	},options);

	if(urlPattern){
		content();
	}
}
