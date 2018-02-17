/**
 * Module dependencies
 */

var express = require('express');			// express module
var app = express();						// initiating express app
var http = require('http');					// http module
http.globalAgent.maxSockets = 100;			// limiting socket connections to 100
var bodyParser = require('body-parser');	// body-parser module for reading request body
var fs = require('fs');						// fs module for handling file operations
var server = http.createServer(app);		// creating server
var io = require('socket.io');				// using sockets
var ios = io.listen(server);				// listening sockets
var formidable = require('formidable');		// file upload module
var util = require('util');
var FCM = require('fcm-node');

// var fcmServerKey = "AIzaSyCzPtrkDQXL1JJ6jlG6CJ5PZ-dJTbABJVY";
var fcmServerKey = "AAAAww1MU00:APA91bHFe3YgJkxdOpQ5btg4zra6UGpWAOih_gpNKOKpVNBd1_bo7or81a2qRPz4J7bI-Sk8Zeu6aluukjU60YNCwn2mye5yc08-ubxn2YDuTiTWPpWxD8Sv3rNm52Uosa99OVhtuvwc";
var clientToken = "fQh3ckLcvRo:APA91bH4y1SOXuYosnRrwGwKLgVD04lLSmoqNfkhYgHVFGpZziKZhX3TE6myk0_9kse9j_cHamuKHQF9N6NMgE8EIzMCSb6zYqvHfmUx_inEbURYF6_3yl4FuvbBhdjtb-Bppl_lPb0h";


/**
 * MONGO DB
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test',{
    useMongoClient:true
});

var db = mongoose.connection;
db.on('error',console.error);
db.once('open',function(){
    console.log("Connected to mognod server");
});

var chatSchema = mongoose.Schema({
	// userName : "admin",
	// userAvatar : "Avatar1.jpg",

	// hasFile :false,
	// msgTime: "2:54 pm",
	// roomKey:"51a0ff",

    /*msg : "fads",
    hasMsg :true,
	userName:"admin",
	userAvatar:"Avatar1.jpg",
	hasFile:true,
	isImageFile:true,
	istype:"image",
	showme:true,
	dwimgsrc:"app/images/gallery_icon5.png",
	dwid:"admindwid1517032598264",
	msgTime:"2:56 pm",
	roomKey:"51a0ff"*/
    msg : String,
    hasMsg :Boolean,
    userName:String,
    userAvatar:String,
    hasFile:Boolean,
    isImageFile:Boolean,
    istype:String,
    showme:Boolean,
    dwimgsrc:String,
    dwid:String,
    msgTime:String,
    // roomKey:String

    // repeatMsg : true,
	repeatMsg : Boolean,
    // serverfilename : baseName(files.file.path),
    serverfilename : String,
    // filename : files.file.name,
    filename : String,
    // size : bytesToSize(files.file.size)
	size : String,
    isMapFile : Boolean

});
var scheduleSchema = mongoose.Schema({
    roomKey : String,
    scheduleTitle : String,
    scheduleDate : String,
    scheduleAddress : String
});

var roomSchema = mongoose.Schema({
    roomKey : String,
    roomName : String
})



// Initializing Variables
var nickname = [];
var i = [];
var x = [];
var online_member = [];
var temp1;
var socket_id;
var socket_data;
var files_array  = [];
var expiryTime = 8;
var routineTime = 1;


server.listen(8282);		// server starting on port '8282'

// cofiguring body-parser
app.use(bodyParser.json({	// setting json limit
    limit: 1024 * 10000
}));
app.use(bodyParser.text({ 	// setting text limit
    limit: 1024 * 10000
}));
app.use(bodyParser.raw({ 	// setting raw limit
    limit: 1024 * 10000
}));
app.use(bodyParser.urlencoded({		// setting url encoding
        extended: true,
        limit:1024*1024*20
}));
//static file configuration
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/app/upload/images'));
app.use(express.static(__dirname + '/public/app/upload/music'));
app.use(express.static(__dirname + '/public/app/upload/doc'));
app.use(express.static(__dirname + '/public/app/upload/mongo'));
app.use(express.static(__dirname + '/public/app/upload/map'));

// CORS Issue Fix
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//sockets handling
ios.on('connection', function(socket){
	console.log("here is a socket io connection"+socket);


	// creating new user if nickname doesn't exists
	socket.on('new user', function(data, callback){
		console.log("here is a socket.io new user"+JSON.stringify(data));
        console.log(data.roomKey);
        if(nickname[data.userName])
			{
				callback({success:false});
			}else{
				callback({success:true});
				socket.userName = data.userName;
				socket.userAvatar = data.userAvatar;
				socket.roomKey = data.roomKey;
				socket.userNo = data.userNo;
				nickname[data.userName] = socket;
			}
		socket.join(data.roomKey);
        console.log("socket.join==>"+ data.roomKey);
	});



// ================================== Online Members List ===============================
	socket.on('get-online-members', function(data){

		var online_member = [];

        var clients_in_the_room = ios.sockets.adapter.rooms[data.roomKey].sockets;
        for (var clientId in clients_in_the_room ) {
            // console.log('client: '+ clientId); //Seeing is believing
            var client_socket = ios.sockets.connected[clientId];//Do whatever you want with this
			// console.log("client2==>"+client_socket.userName);
            temp1 = {"userName": client_socket.userName, "userAvatar":client_socket.userAvatar, "roomKey":client_socket.roomKey, "userNo":client_socket.userNo};
            online_member.push(temp1);
        }

		console.log("get-online-members==>"+data.roomKey);
        console.log("get-online-members==>"+data.userName);


        /*var online_member = [];
		i = Object.keys(nickname);
		console.log("i==>"+i);
		for(var j=0;j<i.length;j++ )
		{

			socket_id = i[j];
			console.log("+here is a for Loof == > "+socket_id);
			socket_data = nickname[socket_id];
			temp1 = {"userName": socket_data.userName, "userAvatar":socket_data.userAvatar, "roomKey":socket_data.roomKey};
			if(data.roomKey == socket_data.roomKey){
                online_member.push(temp1);
			}


		}*/
        if (nickname[data.userName]) {
            ios.sockets.in(data.roomKey).emit('online-members', online_member);
            console.log("online_member ==> "+JSON.stringify(online_member));
        }
		// ios.sockets.in(data.roomKey).emit('online-members', online_member);

	});

// ================================== MongoDB History ===============================
    socket.on('history request', function(data) {
        console.log("history request ==> "+ JSON.stringify(data));
        var Chat = mongoose.model('Chat',chatSchema,'chat'+data.roomKey);
        var history = [];
        Chat.find(function(err,result) {
            for (var i = 0; i < result.length; i++) {
                var dbData = {
                    // name: result[i].userName,
					// message: result[i].message

					msg : result[i].msg,
                    hasMsg :result[i].hasMsg,
                    userName:result[i].userName,
                    userAvatar:result[i].userAvatar,
                    hasFile:result[i].hasFile,
                    isImageFile:result[i].isImageFile,
                    istype:result[i].istype,
                    showme:result[i].showme,
                    dwimgsrc:result[i].dwimgsrc,
                    dwid:result[i].dwid,
                    msgTime:result[i].msgTime,


                    repeatMsg : result[i].repeatMsg,
                    // serverfilename : baseName(files.file.path),
                    serverfilename : result[i].serverfilename,
                    // filename : files.file.name,
                    filename : result[i].filename,
                    // size : bytesToSize(files.file.size)
                    size : result[i].size,
                    isMapFile : result[i].isMapFile,
                    length : ""
                };
                history.push(dbData);

            }
            socket.emit('history response', {
                history: history
            });
        });
    });
// ================================== Schedule Check Event ===============================
    socket.on('schedule check', function(data, callback){
        var Schedule = mongoose.model('Schedule',scheduleSchema,'schedules');
        Schedule.findOne({'roomKey' : data.roomKey},function(err, result){
            if(result != null){
                var dbData = {
                    isSchedule : true,
                    scheduleTitle : result.scheduleTitle,
                    scheduleDate : result.scheduleDate,
                    scheduleAddress : result.scheduleAddress
                };
            }else{
                var dbData = {
                    isSchedule : false
                }
            }

            socket.emit('schedule',{
                schedule : dbData
            });
        });
        var Room = mongoose.model('room',roomSchema);
        Room.findOne({'roomKey' : data.roomKey},function(err,result){
            socket.emit('room name',{
                roomName : result.roomName
            });

        });
    });
// ================================== sending new message ==================================
	socket.on('send-message', function(data, callback){

        //****************************************************************
        /** 발송할 Push 메시지 내용 */
        var push_data = {
            // 수신대상
            to: clientToken,
            // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
            notification: {
                // title: "Hello Node",
                title : data.userName,
                // body: "Node로 발송하는 Push 메시지 입니다.",
                body : data.msg,
                sound: "default",
                click_action: "FCM_PLUGIN_ACTIVITY",
                icon: "fcm_push_icon"
            },
            // 메시지 중요도
            priority: "high",
            // App 패키지 이름
            restricted_package_name: "com.twiio.good.twiio",
            // App에게 전달할 데이터
            data: {
                num1: 2000,
                num2: 3000
            }
        };

        /** 아래는 푸시메시지 발송절차 */
        var fcm = new FCM(fcmServerKey);

        fcm.send(push_data, function(err, response) {
            if (err) {
                console.error('Push메시지 발송에 실패했습니다.');
                console.error(err);
                return;
            }

            console.log('Push메시지가 발송되었습니다.');
            console.log(response);
        });

        //****************************************************************
        var Chat = mongoose.model('Chat',chatSchema,'chat'+data.roomKey);
		console.log('here is a send-message ==>' + JSON.stringify(data));
		if (nickname[data.userName]) {
			if(data.hasMsg){
			    console.log("data.hasMsg");
				// ios.sockets.emit('new message', data);
				ios.sockets.in(data.roomKey).emit('new message', data);

				var chat = new Chat({userName:data.userName,
									userAvatar:data.userAvatar,
									msg:data.msg,
									hasMsg:data.hasMsg,
									hasFile:data.hasFile,
									msgTime:data.msgTime,
									// "roomKey":data.roomKey
									});
				chat.save(function(err,data){
					if(err){
						console.log("error");
					}
					console.log("message is inserted");
				});
				callback({success:true});
			}
			else if(data.hasFile){
				if(data.istype == "image"){
                    console.log("here is data.istype=image");
					// socket.emit('new message image', data);
					ios.sockets.in(data.roomKey).emit('new message image', data);
					callback({success:true});
				} else if(data.istype == "music"){
					// socket.emit('new message music', data);
                    ios.sockets.in(data.roomKey).emit('new message music', data);
					callback({success:true});
				} else if(data.istype == "PDF"){
					// socket.emit('new message PDF', data);
                    ios.sockets.in(data.roomKey).emit('new message PDF', data);
					callback({success:true});


				} else if(data.istype == "map"){
                    console.log("here is a send message map");

                    var chat = new Chat({userName:data.userName,
                        userAvatar:data.userAvatar,
                        msg:data.msg,
                        hasMsg:data.hasMsg,
                        hasFile:data.hasFile,
                        msgTime:data.msgTime,
                        // "roomKey":data.roomKey
                        istype:data.istype,
                        isImageFile:data.isImageFile,
                        serverfilename:data.serverfilename,
                        isMapFile:data.isMapFile
                    });
                    chat.save(function(err,data){
                        if(err){
                            console.log("error");
                        }
                        console.log("message is inserted");
                    });


                    ios.sockets.in(data.roomKey).emit('new message map', data);
                    callback({success:true});
                }
			}
			else{
				callback({ success:false});
			}
		}
	});

// ================================== disconnect user handling ==================================
	socket.on('disconnect', function () {
	    console.log("here is a disconnect");
		delete nickname[socket.userName];
		online_member = [];
		x = Object.keys(nickname);
		for(var k=0;k<x.length;k++ )
    	{
        	socket_id = x[k];
        	socket_data = nickname[socket_id];
        	temp1 = {"userName": socket_data.userName, "userAvatar":socket_data.userAvatar, "roomKey": socket_data.roomKey};
            online_member.push(temp1);
    	}
		ios.sockets.emit('online-members', online_member);
   	});
});

// ================================== route for uploading images asynchronously ==================================
app.post('/v1/uploadImage',function (req, res){

    console.log("here is a uploadImage");

	var imgdatetimenow = Date.now();
	var form = new formidable.IncomingForm({
      	uploadDir: __dirname + '/public/app/upload/images',
      	keepExtensions: true
      });


    
    form.parse(req,function(err,fields,files){
        var Chat = mongoose.model('Chat',chatSchema,'chat'+fields.roomKey);
		var data = {
            userName : fields.userName,
				userAvatar : fields.userAvatar, 
				repeatMsg : true, 
				hasFile : fields.hasFile, 
				isImageFile : fields.isImageFile, 
				istype : fields.istype, 
				showme : fields.showme, 
				dwimgsrc : fields.dwimgsrc,
				dwid : fields.dwid,
				serverfilename : baseName(files.file.path), 
				msgTime : fields.msgTime,
				filename : files.file.name,
				size : bytesToSize(files.file.size)
		};

		console.log("image Data in form ==>" +JSON.stringify(data));


	    var image_file = { 
		        dwid : fields.dwid,
		        filename : files.file.name,
		        filetype : fields.istype,
		        serverfilename : baseName(files.file.path),
		        serverfilepath : files.file.path,
		        expirytime : imgdatetimenow + (3600000 * expiryTime)           
	    };



        files_array.push(image_file);
        ios.sockets.in(fields.roomKey).emit('new message image', data);
        // ios.sockets.emit('new message image', data);

        /**
         * MONGO
         */

        var chat = new Chat({
            userName : fields.userName,
            userAvatar : fields.userAvatar,
            repeatMsg : true,
            hasFile : fields.hasFile,
            isImageFile : fields.isImageFile,
            istype : fields.istype,
            showme : fields.showme,
            dwimgsrc : fields.dwimgsrc,
            dwid : fields.dwid,
            serverfilename : baseName(files.file.path),
            msgTime : fields.msgTime,
            filename : files.file.name,
            size : bytesToSize(files.file.size)
        });

        chat.save(function(err,data){
            if(err){
                console.log("error");
            }
            console.log("message is inserted");
        });
        /**
		 *
         */

        form.on('end', function() {
            res.end();
        });




    });
});

app.post('/v1/uploadMap',function(req,res){



    console.log("here is a /v1/uploadMap");


    var form = new formidable.IncomingForm({
        uploadDir: __dirname + '/public/app/upload/map',
        keepExtensions: true,
        encoding: 'binary'
    });


    form.parse(req,function(err,fields,files) {

        console.log("tqtqtqtqtqtq"+fields.userName);
        var userName = fields.userName;
        console.log("tqtqtqtq==>"+fields.filename);
        var fileName = 'public/app/upload/map/map('+fields.filename+').png';

        var base64Data = fields.file.replace(/^data:image\/png;base64,/,"");
        var binaryData  =   new Buffer(base64Data, 'base64').toString('binary');
        fs.writeFileSync(fileName, binaryData, 'binary', function (err) {
        });


    });

    form.on('end', function() {
        res.end();
    });




});

// route for uploading audio asynchronously
app.post('/v1/uploadAudio',function (req, res){
	var userName, useravatar, hasfile, ismusicfile, isType, showMe, DWimgsrc, DWid, msgtime;
	var imgdatetimenow = Date.now();
	var form = new formidable.IncomingForm({
      	uploadDir: __dirname + '/public/app/upload/music',
      	keepExtensions: true
      });


	form.on('end', function() {
      res.end();
    });
    form.parse(req,function(err,fields,files){
		console.log("files : ",files);
		console.log("fields : ", fields);
		var data = {
            userName : fields.userName,
				userAvatar : fields.userAvatar,
				repeatMsg : true,
				hasFile : fields.hasFile,
				isMusicFile : fields.isMusicFile,
				istype : fields.istype,
				showme : fields.showme,
				dwimgsrc : fields.dwimgsrc,
				dwid : fields.dwid,
				serverfilename : baseName(files.file.path),
				msgTime : fields.msgTime,
				filename : files.file.name,
				size : bytesToSize(files.file.size)
		};
	    var audio_file = {
		        dwid : fields.dwid,
		        filename : files.file.name,
		        filetype : fields.istype,
		        serverfilename : baseName(files.file.path),
		        serverfilepath : files.file.path,
		        expirytime : imgdatetimenow + (3600000 * expiryTime)
	    };
	    files_array.push(audio_file);
		ios.sockets.emit('new message music', data);
    });
});

// route for uploading document asynchronously
app.post('/v1/uploadPDF',function (req, res){
	var imgdatetimenow = Date.now();
	var form = new formidable.IncomingForm({
      	uploadDir: __dirname + '/public/app/upload/doc',
      	keepExtensions: true
      });

	form.on('end', function() {
      res.end();
    });
    form.parse(req,function(err,fields,files){
		var data = {
            userName : fields.userName,
				userAvatar : fields.userAvatar, 
				repeatMsg : true, 
				hasFile : fields.hasFile, 
				isPDFFile : fields.isPDFFile, 
				istype : fields.istype, 
				showme : fields.showme, 
				dwimgsrc : fields.dwimgsrc, 
				dwid : fields.dwid,
				serverfilename : baseName(files.file.path), 
				msgTime : fields.msgTime,
				filename : files.file.name,
				size : bytesToSize(files.file.size)
		};
	    var pdf_file = { 
		        dwid : fields.dwid,
		        filename : files.file.name,
		        filetype : fields.istype,
		        serverfilename : baseName(files.file.path),
		        serverfilepath : files.file.path,
		        expirytime : imgdatetimenow + (3600000 * expiryTime)           
	    };
	    files_array.push(pdf_file);
		ios.sockets.emit('new message PDF', data);
    });
});

// route for checking requested file , does exist on server or not
app.post('/v1/getfile', function(req, res){
    var data = req.body.dwid;
    var filenm = req.body.filename;
    var dwidexist = false;
    var req_file_data;
    var serverFile = req.body.serverfilename;

    // fs.readdir("public/app/upload/images", function(err, files) {
    //
    //     for (var i=0; i<files.length; i++) {
    //         console.log(files[i]);
    //         if(serverFile == files[i])
    //         {
    //             dwidexist = true;
    //             req_file_data = files[i];
    //             break;
    //         }
    //
    //     }
    // });
	var files = fs.readdirSync('public/app/upload/images');
    for (var i=0; i<files.length; i++) {
		console.log(files[i]);
		if(serverFile == files[i])
		{
			dwidexist = true;
			req_file_data = files[i];
			break;
		}

	}

    
    /*for(var i = 0; i<files_array.length; i++)
    {
        if(files_array[i].dwid == data)
        {
            dwidexist = true;
            req_file_data = files_array[i];
        }
    }*/

    console.log('here is app.post(/v1/getfile) ==>'+data);
    console.log('here is app.post(/v1/getfile) ==>'+filenm);
    console.log('here is app.post(/v1/getfile) ==>'+dwidexist);
    console.log('here is app.post(/v1/getfile) ==>'+req_file_data);
    console.log('here is app.post(/v1/getfile) ==>'+serverFile);


    // CASE 1 : File Exists
    if(dwidexist == true)
    {
    	//CASE 2 : File Expired and Deleted
        if(req_file_data.expirytime < Date.now())
        {
	        var deletedfileinfo = { 
                isExpired : true,
	            expmsg : "File has beed removed."
	        	};
	            fs.unlink(req_file_data.serverfilepath, function(err){
	               	if (err) {
	                   	return console.error(err);
	                }
	    				res.send(deletedfileinfo);           
	            });
               var index = files_array.indexOf(req_file_data);
               files_array.splice(index,1);           
        }else{
        	// CASE 3 : File Exist and returned serverfilename in response
            var fileinfo = {
            	isExpired : false, 
            	filename : req_file_data.filename,            
            	serverfilename : req_file_data.serverfilename };
            res.send(fileinfo);
        }
    }else{  
    		// CASE 4 : File Doesn't Exists.       
	    	var deletedfileinfo = { 
	                isExpired : true,
	                expmsg : "File has beed removed."
	        };
	        res.send(deletedfileinfo);       
        }
});

app.post('/v1/getMongo',function(req,res){

    //MongoExport
    console.log("here is a app.post(getMongo)");
    var roomKey = req.body.roomKey;
    var userName = req.body.userName;

    fs.open('./public/app/upload/mongo/TwiioChat('+userName+').txt', 'w', function(err, fd){
        if(err) throw err;

	var Chat = mongoose.model('Chat',chatSchema,'chat'+roomKey);
	Chat.find(function(err,result) {
        for (var i = 0; i < result.length; i++) {
            var dbData = {
                msg: result[i].msg,
                hasMsg: result[i].hasMsg,
                userName: result[i].userName,
                hasFile: result[i].hasFile,
                isImageFile: result[i].isImageFile,
                istype: result[i].istype,
                msgTime: result[i].msgTime,
                serverfilename: result[i].serverfilename,
                filename: result[i].filename,
                size: result[i].size
            };

            console.log('==>' + JSON.stringify(dbData));
            var buffer2 = new Buffer(JSON.stringify(dbData)+"\n");
            var offset2 = 0;
            var length2 = buffer2.length;
            var position2 = null;
            fs.write(fd, buffer2, offset2, length2, position2, function(err, bytesWritten, buffer){
                if(err) fs.close(fd, function(){ done(err); });
                else{
                    console.log(bytesWritten+' 바이트를 썼습니다.\n');
                    fs.close(fd,function(){ done(err); });
                }
            })


            // ------FS 모듈과 스트림(파일 열기)
            function done(err) {
                if (err) console.log("File I/O Error:" + err.message);
                else console.log("File work complete");
            }

        	}
    	});
	});

    var mongoFile = {
    	mongoFile : true,
        fileName : 'TwiioChat('+userName+').txt'
    };

    res.send(mongoFile);

	

});

// Routine Clean up call
setInterval(function() {routine_cleanup();}, (3600000 * routineTime));

// Size Conversion
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i]; 
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};
//get file name from server file path
function baseName(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1);     
   return base;
}

// Routine cleanup function (files delete after specific interval)
function routine_cleanup()
{
    for(var i=0; i<files_array.length; i++)
    {
            if(Date.now() > files_array[i].expirytime)
            {
                fs.unlink(files_array[i].serverfilepath, function(err) 
                          {
                   if (err) {
                       return console.error(err);
                            }
                            });
                   files_array.splice(i,1);
            }
    }
};
