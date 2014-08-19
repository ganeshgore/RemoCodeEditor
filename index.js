$(document).ready(function(){
   
    
    $('#demo').keydown(function() {
	var text = $(this).val();   
	var lines = text.split(/\r|\r\n|\n/);
	var count = lines.length;
	$('#line-nums').html('<div>'+count+'<div>');	
	});
    
    $('li').click(function() {
	    var link = $(this).text();
	    if (link == "DropBox") {
		alert("dropbox");
	    }
	});
    
    
    
});

