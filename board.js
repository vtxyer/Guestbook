var request;

/*function JData(){
	command;
	reqSql;
	reponseAry = new Array();
}*/

function login(){
	var _name = null; 
	while(_name == null){
		_name = prompt("What's your name?", "your name");
		$.cookie('dbs_user', _name);
	}
	$("#nonLogin").hide();
	$("#logout").show();
	$("#login").show();
	$("#login").html("<h2><p>Welcome User: <b>" + _name + "</b></p></h2>");
}

function logout(){
	$.cookie('dbs_user', null);
	$("#nonLogin").show();
	$("#login").hide();
	$("#logout").hide();
}



function outputEntry(Title, Owner, Msg_id, Msg, LikeNum, HateNum, entry_num)
{
	Template =  
'<div id="msg_'+ Msg_id +'" class="'+ entry_num +'" >' +
'<h3 id='+ Msg_id +'>'+ Title + '<span id="right_most"> Post By:'+ Owner +'</span></h3>'+
  '<div id="msg_body">' +
    '<p id="msg">' + Msg +'</p>' +
	'<button onclick="like(' + Msg_id + ');">Like</button><text id="likeNum">'+ LikeNum +'</text>' +
	'<button onclick="hate(' + Msg_id + ');">Hate</button><text id="hateNum">'+ HateNum +'</text>' +
  '</div>' +
'</div>';
	return Template;
}


function sendServerData(input)
{
	var JsonData = JSON.stringify(input);
	JsonData = encodeURIComponent(JsonData);
	request=new XMLHttpRequest();
	request.open('post', 'server/sql.php' ,true);
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded;");
	if(input.command == "show" ){
		request.onreadystatechange = show;
	}
	else if(input.command == "post" ){
		request.onreadystatechange = prependPost;
	}
	request.send("JsonData=" + JsonData);
}


function like(msg_id)
{
	var JDataObj = new Object();
	JDataObj.command = "like";
	JDataObj.msg_id = msg_id ;
	sendServerData(JDataObj);

	entry_id = "msg_" + msg_id;
	likesNum = $("#"+entry_id).find("#likeNum").text();
	likeNum = parseInt(likesNum, 10);
	likeNum += 1;
	$("#"+entry_id).find("#likeNum").text(likeNum);
}
function hate(msg_id)
{
	var JDataObj = new Object();
	JDataObj.command = "hate";
	JDataObj.msg_id = msg_id ;
	sendServerData(JDataObj);

	entry_id = "msg_" + msg_id;
	hatesNum = $("#"+entry_id).find("#hateNum").text();
	hateNum = parseInt(hatesNum, 10);
	hateNum += 1;
	$("#"+entry_id).find("#hateNum").text(hateNum);
}


function prependPost()
{
	if (request.readyState==4 && request.status==200)
	{
		var strJSON = decodeURIComponent(request.responseText);
		var JDataObj = JSON.parse(strJSON);
		Title = JDataObj.Title;
		Owner = JDataObj.Owner;
		Msg_id = JDataObj.Msg_id;
		Msg = JDataObj.Msg;
		var num = $.cookie('dbs_entry_num');
		num = num + 1;
		$.cookie('dbs_entry_num', num);

		var Template = outputEntry(Title, Owner, Msg_id, Msg, 0, 0, num);
	 	CKEDITOR.instances.user_input.setData("");
		$("#content").prepend(Template);

		$("#msg_" + Msg_id).draggable({ revert: 'invalid', revertDuration: 100 });
		$("#content").accordion("destroy");
		$("#content").accordion({collapsible: true, heightStyle: "content", header: '> div > h3', event: "mouseover" } );
		changeButton();
	}
}
function post()
{
	var msg = CKEDITOR.instances.user_input.getData();

	var div = document.createElement("div");
	div.innerHTML = msg;
	msgText = div.textContent || div.innerText || "";

	var msgPart = msgText.split(/\W/, 5);
	var title = "";
	for(var key in msgPart){
		title += msgPart[key] + " ";
	}
	title += "......."
	var owner = $.cookie('dbs_user');

	var JDataObj = new Object();
	JDataObj.command = "post";
	JDataObj.title = title;
	JDataObj.owner = owner;
	JDataObj.msg = msg;
	JDataObj.sql = "Insert into msg set owner='"+ owner +"', title='"+ title +"', msg='"+ msg +"'";

	sendServerData(JDataObj);
}
function show()
{
	if (request.readyState==4 && request.status==200)
	{
		var strJSON = decodeURIComponent(request.responseText);
		var objJSON = JSON.parse(strJSON);
		$.cookie('dbs_entry_num', Object.keys(objJSON).length);

		for(var key in objJSON){
			JDataObj = objJSON[key];
			Title = JDataObj.Title;
			Owner = JDataObj.Owner;
			Msg_id = JDataObj.Msg_id;
			Msg = JDataObj.Msg;
			LikeNum = JDataObj.Like;
			HateNum = JDataObj.Hate;
			var Template = outputEntry(Title, Owner, Msg_id, Msg, LikeNum, HateNum, key);
			$("#content").append(Template);
			$("#msg_" + Msg_id).draggable({ revert: function(event){
														$(this).data("uiDraggable").originalPosition = { top: 0, left:0 };
														return !event;
													}, revertDuration: 100
										  });
		}
		$("#content").accordion({collapsible: true, heightStyle: "content", header: '> div > h3', event: "mouseover" });
		changeButton();
	}
}
function showReq(arg)
{
	var JDataObj = new Object();
	JDataObj.command = "show";
	if(arg != "all"){
		JDataObj.sql = "select * from msg where user=" + arg + "ORDER BY id DESC";
	}
	else{
		JDataObj.sql = "select * from msg ORDER BY id DESC";
	}
	sendServerData(JDataObj);
}
function deletes(msg_id)
{
	var JDataObj = new Object();
	JDataObj.command = "delete";
	msg_id = msg_id.replace(/\D*/, "");
	JDataObj.msg_id = parseInt(msg_id, 10);
	JDataObj.owner = $.cookie("dbs_user");
	sendServerData(JDataObj);
	$("#"+msg_id).remove();

	$("#content").accordion("destroy");
	$("#content").accordion({collapsible: true, heightStyle: "content", header: '> div > h3', event: "mouseover" });

}


function changeButton() {
	$( "button" ).button().click(function( event ) {
		event.preventDefault();
	});
}
window.onload = function() {
	var user_name = $.cookie('dbs_user');
	if(user_name == "null" || user_name == null){
		$("#login").hide();
		$("#logout").hide();
	}
	else{
		$("#nonLogin").hide();
		$("#login").html("<h2><p>Welcome User: <b>" + user_name + "</b></p></h2>");
	}
	showReq("all");

	$("body").keypress(function(event) {
		if(event.keyCode == 110){
			var active = $( "#content" ).accordion("option", "active");
			if(active === false){
				active = 0;
			}
			else{
				active += 1;
			}
			$( "#content" ).accordion( "option", "active", active );	
		
		}
		if(event.keyCode == 112){
			var active = $( "#content" ).accordion("option", "active");
			active -= 1;
			$( "#content" ).accordion( "option", "active", active );	
		}
	});

    $( "#trash" ).droppable({
		drop: function( event, ui ) {

			var owner = $(ui.draggable).find("#right_most").text();
			owner = owner.split(":");
			owner = owner[1];
			if(owner != $.cookie("dbs_user")){
				$(ui.draggable).css({ position: 'relative', top: 0, left: 0 });
				$("<div>Delete failed!! You are not the owner	 of this post.</div>").dialog();
				return false;                                	
			}                                                	
			deletes( $(ui.draggable).attr("id") );           	
      	}                                                    	
    });                                                      	
};                                                           
                                                             	
                                                             	
                                                             


