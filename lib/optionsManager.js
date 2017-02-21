import * as basic from './basicUtils';

export default function(options,content){
	const defaults = {
        urlPattern:'',	//regex url pattern
        runTime:'sync', // [sync, async, DOM]
        contentType:'JS', // [JS, HTML]
        runCondition:function(){} //[boolean return] run condition
    };

    options = basic.extend(defaults,options);

	if(options.urlPattern){
		content();
	}
}
