<?php
$con = mysql_connect('localhost', 'root', 'test123');
if(!$con){
	die("Mysql Connect Error");
}
mysql_select_db("DBS", $con);


if(!empty($_POST)){
	$JsonData = rawUrlDecode(($_POST['JsonData']));
}


if(isset($JsonData)){
	$data = (array)json_decode($JsonData);


	if($data["command"] == "post"){


		$sql = $data["sql"];
		$result = mysql_query($sql);

		$id = "";
		$sql = "SELECT max(id) FROM `msg` WHERE 1";
		$result = mysql_query($sql);
		while($row = mysql_fetch_array($result)){
			$id = $row[0];
		}
		$tmpAry = array("Title" => $data['title'],
						"Owner" => $data['owner'],
						"Msg_id" => $id,
						"Msg" => $data['msg'],
						"Like" => $id,
						"Hate" => 0,
		);
		$output = json_encode((object)$tmpAry);
		print($output);
	}
	else if($data["command"] == "show"){
		$sql = $data["sql"];
		$result = mysql_query($sql);

		$resJData = array();
		while($row = mysql_fetch_array($result)){
			$tmpAry = array("Title" => $row['title'],
							"Owner" => $row['owner'],
							"Msg_id" => $row['id'],
							"Msg" => $row['msg'],
							"Like" => $row['likes'],
							"Hate" => $row['hates'],
			);
			array_push($resJData, (object)$tmpAry);
		}

		$output = json_encode((object)$resJData);
		print($output);
	}
	else if($data["command"] == "delete"){
		$sql = "delete from msg where id=".$data['msg_id']." and owner='".$data['owner']."'";
		$result = mysql_query($sql);
	}
	else if($data["command"] == "edit"){
	}
	else if($data["command"] == "like"){
		$sql = "UPDATE msg SET likes=likes+1 where id=".$data["msg_id"];
		$result = mysql_query($sql);
	}
	else if($data["command"] == "hate"){
		$sql = "UPDATE msg SET hates=hates+1 where id=".$data["msg_id"];
		$result = mysql_query($sql);
	}

}
mysql_close($con); 
?>
