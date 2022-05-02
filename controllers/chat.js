const fs = require('fs');
const path = require('path');
const formatMessage = require('../other/msg');
const moment = require('moment');

const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

const ChatIO = (io) => {
	//list of all user is in here
	users = [];
	io.on('connection', socket => {
		socket.on('setUsername', function(data) {
			
      		//check if the user is already in data
			if (users.some(e => e.user == data.user)) {
				socket.emit(
					'userExists',
					data.user + ' username is taken! Try some other username.'
				);

			} else {
				socket.emit("goTochatPage", "your in" )
				console.log('username: ' + data.user);console.log('username: ' + data.user);
				//push the value into the users
				users.push({id:socket.id,user:data.user, room:data.room});

				socket.emit('userSet', { user: data.user , room:data.room  });


				socket.on ('joinRoom',(user) => {
					socket.join(user.room)
					console.log( 'a user connected');
					// welcome message
					socket.emit('newmsg', formatMessage("Welcome here friend!!",""));

					// Broadcast when a new user connects
					socket.broadcast.to(user.room).emit('newmsg', formatMessage("System",`${data.user} has joined the chat`));
				
					//getting the user and room for dom ( but only we use it for the username)
					var room11 = users.filter(user1 => user1.room === user.room);
					console.log("this "+JSON.stringify(room11))
					io.to(user.room).emit('roomUser',room11)
				})				
			}
		});
			
		// typing......
		socket.on('typing',(data)=>{
			var data_user = users.filter(user => user.id === socket.id);
			var name = data_user.map(user => user.user);
			var room = data_user.map(user => user.room);

			socket.to(room.toString()).emit('typing',{isTyping: data.isTyping,name:name})
		})

		
		//when semone stops typing
		socket.on("stopTyping", () => { 
			var data_user = users.filter(user => user.id === socket.id);
			var room = data_user.map(user => user.room);
			socket.to(room.toString()).emit("notifyStopTyping"); 
		});

		//sending message
		socket.on('msg', function(data) {
			async function insertdDb() {
				await client.connect();
				console.log('Connected successfully to server');
				const db = client.db(dbName);
				const collection = db.collection('documents');
				const insertResult = await collection.insertMany([{...data, time: moment().format('h:mm a')}]);
				console.log('Inserted documents =>', insertResult);
			}
			insertdDb();
			
			socket.broadcast.to(data.room).emit("newmsg", formatMessage(data.user,data.message));
			socket.emit("newmsg1", formatMessage(data.user,data.message));
			console.log(users)
			console.log(socket.id)
			
		});

		//if they close the tab
		socket.on('disconnect', function(data) {
			//getting user using id 
			var data_user = users.filter(user => user.id === socket.id);
			
			var room = data_user.map(user => user.room);
			var name = data_user.map(user => user.user);

			console.log('user disconnected');
			socket.to(room.toString()).emit('newmsg', formatMessage("System",`${name} disconnected`));

			// deleting user base on index
			var index1 = users.findIndex(img => img.id === socket.id);
			console.log(index1)
			if (index1!== -1){
				users.splice(index1,1)[1];
			}

			//getting the user and room for dom ( but only we use it for the username)
			var room11 = users.filter(user => user.room === room.toString());
			io.to(room.toString()).emit('roomUser',room11)
		});



		//serving images

		socket.on('base64 file', function (msg) {
			var data_user = users.filter(user => user.id === socket.id);
			var name = data_user.map(user => user.user);
			var room = data_user.map(user => user.room);
			console.log('received base64 file from' + socket.username);
			//console.log(msg.filename);
			// socket.broadcast.emit('base64 image', //exclude sender
			console.log("you are in")
			socket.broadcast.to(room).emit('base64 file1',  //include sender
			{	
				username:name,
				file: msg.file,
				fileName: msg.fileName,
				time: moment().format('h:mm a')
			}
			);

			socket.emit('base64 file',  //include sender
			{
				username: name,
				file: msg.file,
				fileName: msg.fileName,
				time: moment().format('h:mm a')
			}
			);
		});

	});

};

const ChatController = (req, res) => {
	const filePath = path.resolve(__dirname + '/../public/html/chat.html');
	const chatHTML = fs.readFileSync(filePath);
	console.log("fp " + filePath)
	res.write(chatHTML);
	res.end();
};

module.exports = {
	ChatIO,
	ChatController
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////// soon kapag my data base na haha
