
var editor_area = document.getElementById('editor');
var doc_title = document.getElementById('doc-title');
var newfolder = document.getElementById('newfolder');
var newfile = document.getElementById('new');
var save = document.getElementById('save');
var editor = ace.edit("editor");
var fileExtension = ({txt:"text",java:"java",c:"c_cpp"});

window.showdown_url_replace = function( url ) {
	var base = doc_title.getAttribute('rel').replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
	alert(base);
	client.makeUrl( base + '/' + url, { download: true }, function( error, data ) {
            alert(error);
            alert(data);
            
		if ( error )
			console.log(error);
		//else
			//preview_area.innerHTML = preview_area.innerHTML.replace( url, data.url );
	});
	return url;
}

var client = new Dropbox.Client({
		//token: "OmgelmwkX6A=|DKcxwZXyEzMxlWUoKdWi0Wmb3WDTj9JIs55wa7frZg==", 
		key:"nsdsvql165y5wer",
		secret:"gdtxkiga6o08h13",
		sandbox: true
	});

client.authDriver( new Dropbox.Drivers.Redirect({ 
	'rememberUser' : true 
}) );


client.authenticate(function( error, client ) {
	if (error)
		console.log( error );
	else
		dropbox_browser_load_folder( '/',0 );
});


var zNodes = [];

var dropbox_browser_load_folder = function( path, parent ) {
	client.readdir( path, function( error, entries, dir_stat, entry_stats ) {
               var ul = document.createElement('ul');
               
               var full_list ="";
			   var ParentID=parent;
			   var CurrentID=(parent*100)+1;
			   
			   for (var e in entries) {
					var list = entries[e];
					if (entry_stats[e].isFolder) {
						zNodes.push({id:CurrentID++, pId:ParentID, name:list, open:false});
						dropbox_browser_load_folder(entry_stats[e].path,CurrentID - 1);
					}
                }
				
               for (var e in entries) {
					var list = entries[e];
					if (entry_stats[e].isFile) {
						zNodes.push({id:CurrentID++, pId:ParentID, name:list, open:false, file:entry_stats[e].path});
					}
				}
			Treebar(zNodes);
	});
}

var editor_load_file = function( file ) {
	// Empty the editor
	//editor_area.className += 'loading';
	
	// editor_area.innerHTML = '';
    doc_title.innerHTML = file.replace(/\\/g,'/').replace( /.*\//, '' );
	client.readFile( file, function( error, data ) {
		if ( error )
			console.log( 'is error', error );       
		SetData(file,data);
	});
}


var SetData = function(fileName,data){
var extension = "";
var i = fileName.lastIndexOf('.');
if (i > 0) {
    extension = fileName.substring(i+1);
}
editor.setValue(data);
editor.getSession().setMode("ace/mode/"+fileExtension[extension]);
}


//new folder

newfolder.onclick = function(){
    var x = prompt("folder name","");
    if (x!= null) {
        client.mkdir(x,function(error, stat){
             console.log( error, stat );
        });
    }
}

//new file

newfile.onclick = function(){
    var x = prompt("please enter file name with extentions","");
    if (x != null && x.indexOf('.')!= -1) {
        client.writeFile( x, editor_area.innerText, function( error, stat ) {
	console.log( error, stat );
    });
    alert(x+" is created");
    }
    else{
    alert("not valid name please insert again");
    }
}

save.onclick = function(){
    //alert(doc_title.innerHTML.indexOf('.'));
    if (doc_title.innerHTML.indexOf('.') != -1) {
        x = "/"+doc_title.innerHTML;
            client.writeFile( x, editor_area.innerText, function( error, stat ) {
                console.log( error, stat );
            });
        alert(x+" is saved");  
    }
    else{
        alert("first select file");
    }
}


var Treebar = function(zNodes){
	var zTree;
	var demoIframe;

	var setting = {
		view: {
			dblClickExpand: false,
			showLine: true,
			selectedMulti: false
		},
		data: {
			simpleData: {
				enable:true,
				idKey: "id",
				pIdKey: "pId",
				rootPId: ""
			}
		},
		callback: {
			beforeClick: function(treeId, treeNode) {
				var zTree = $.fn.zTree.getZTreeObj("tree");
				if (treeNode.isParent) {
					zTree.expandNode(treeNode);
					return false;
				} else {
					//demoIframe.attr("src",treeNode.file + ".html");
					editor_load_file(treeNode.file);

					return true;
				}
			}
		}
	};

	$(document).ready(function(){
		var t = $("#tree");
		t = $.fn.zTree.init(t, setting, zNodes);
		demoIframe = $("#testIframe");
		demoIframe.bind("load", loadReady);
		var zTree = $.fn.zTree.getZTreeObj("tree");
		zTree.selectNode(zTree.getNodeByParam("id", 101));
	
	});

	function loadReady() {
		var bodyH = demoIframe.contents().find("body").get(0).scrollHeight,
		htmlH = demoIframe.contents().find("html").get(0).scrollHeight,
		maxH = Math.max(bodyH, htmlH), minH = Math.min(bodyH, htmlH),
		h = demoIframe.height() >= maxH ? minH:maxH ;
		if (h < 530) h = 530;
		demoIframe.height(h);
	}
}







