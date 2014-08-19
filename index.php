<!DOCTYPE html>

<html>
<head>
    <title>Page Title</title>
    <script type="text/javascript" src="jquery-1.10.2.min.js"></script>
    <link rel="stylesheet" type="text/css" href="index.css">
<style>
</style>
</head>
<body>
<script type="text/javascript" src="js/jquery.ztree.core-3.5.js"></script>
<link rel="stylesheet" href="css/zTreeStyle/zTreeStyle.css" type="text/css">
    <div>
        <header id="header">
            <span id="doc-title"></span>
            <span  id="logo">EduVance</span>
            <img id="newfolder" src="img/folder.png">
            <img id="new" src="img/new.png">
            <img id="save" src="img/save.png">    
        </header>
            <div id="FileBrowser">
                <h1 id="DropboxConnect">DropBox</h1>
					<ul id="tree" class="ztree" style="width:260px; overflow:auto;"></ul>
				<h1 id="SkyDriveConnect">Sky-Drive</h1>
				<h1 id="GoogleDriveConnect">Google-Drive</h1>
            </div> 
			
        <div id="main">
            <pre id="editor" spellcheck="true" contenteditable="true"></pre>    
        </div>
    </div>

<script src="src-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
<script>
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight"); 
    editor.getSession().setMode("ace/mode/text");
</script>
<script src="scripts/dropbox.min.js"></script>
<script src="check.js"></script>






</body>
</html>
