/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      : 
 * Date         : 22 Aug 2017
 * Author       : Bruce Liao
 * Note         :
 * -------------------------------------------------
 * 11 Apr 2017      Bruce Liao        the first version
 * 
 *      the latest update: 25 Aug 2017 09:38
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
; (function ($, window) { 
	var formatDate = function(date){
		var yyyy = date.getFullYear();
		var mm = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1); // getMonth() is zero-based
		var dd  = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		var hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
		var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		var ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
		return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
	}

    var send = function(data){
        $.ajax({
			type: "POST",
			async: true,
			url: "trace.log",
			timeout: 5000,
			data: data,
			success: function(msg){
				
			},
			error: function(err){
				console.error(err);
			}
		})
    }

    $.extend({
		/// use: beginTrace(name) | beginTrace(name, msg)
        beginTrace: function(){
			var args = prepareData.getArgs(arguments),
				id = args.name || args.message || Math.random().toString(),
				startTime = new Date();
			
			console.log(id + " " + "trace begin..");
            
            var f = function(){
                var endTime = new Date(),
					elapsed = ((endTime - startTime) / 1000).toString();
					
				console.log(id + " " + "trace end, elapsed time: " + elapsed + " seconds" );
				
				if(args.name || args.message){					
					send({
						startTime: formatDate(startTime), 
						endTime: formatDate(endTime), 
						elapsed: elapsed,
						name: args.name || args.message, 
						url: location.href, 
						message: args.message,
						level: "trace"
						});
				}
            }

            return {
				end: f				
			}
        },					
		/// use: sendError(message) | sendError(name, message)
		sendError: function(){
			var args = prepareData.getArgs(arguments),
				data = prepareData.getData(args.name, args.message, "error");
				
			console.error(args.message);
			
			send(data);		
		},
		/// use: sendWarn(message) | sendWarn(name, message)
		sendWarn: function(){
			var args = prepareData.getArgs(arguments),
				data = prepareData.getData(args.name, args.message, "warn");
				
			console.warn(args.message);
			
			send(data);				
		},
		/// use: sendInfo(message) | sendInfo(name, message)
		sendInfo: function(){
			var args = prepareData.getArgs(arguments),
				data = prepareData.getData(args.name, args.message, "info");
				
			console.info(args.message);
			
			send(data);			
		}
    });
	
	var prepareData = {
		getArgs: function(args){
			return {
				name: args.length > 1?args[0]:"",
				message: args.length > 1?args[1]:args[0]
			};
		},
		getData: function(name, message, level){			
			return {
				startTime: formatDate(new Date()), 
				endTime: formatDate(new Date()), 
				elapsed: "0",
				name: name || "Js " + level, 
				message: message, 
				url: location.href,
				level: level
			};
		}
	}

	
	window.onerror = function(msg, url, line, col, error){
		var extra = !col ? '' : '\ncolumn: ' + col;
			extra += !error ? '' : '\nerror: ' + error;
			
		var msg = "Error: " + msg + "\nurl: " + url + "\nline: " + line + extra;
		console.error(msg);	
		
		var data = prepareData.getData("Js error", msg, "error");
		send(data);
	}
})(jQuery, window);