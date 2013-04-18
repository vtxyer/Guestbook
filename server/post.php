<?php
$con = mysql_connect('localhost', 'root', 'test123');
if(!$con){
	die("Mysql Connect Error");
}
mysql_select_db("DBS", $con);


if(isset($_POST['user_input'])){
	$msg = $_POST['user_input'];
	print $msg;
}

}
mysql_close($con); 
?>
