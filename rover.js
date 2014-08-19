var dropbox_browser = document.getElementById('dropbox-browser');
var editor_area = document.getElementById('rover');
var doc_title = document.getElementById('doc-title');
var preview_area = document.getElementById('preview');
var save = document.getElementById('save');
var newfile = document.getElementById('new');
var newfolder = document.getElementById('folder');
var showdown = new Showdown.converter();

window.showdown_url_replace = function( url ) {
	var base = doc_title.getAttribute('rel').replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
	
	client.makeUrl( base + '/' + url, { download: true }, function( error, data ) {
		if ( error )
			console.log(error);
		else
			preview_area.innerHTML = preview_area.innerHTML.replace( url, data.url );
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
	'rememberUser' : false 
}) );

client.authenticate(function( error, client ) {
	if (error)
		console.log( error );
	else
		dropbox_browser_load_folder( '/' );
});


var dropbox_browser_load_folder = function( path, parent ) {
	client.readdir( path, function( error, entries, dir_stat, entry_stats ) {
		if (error) {
			console.log(error);
			return;
		}

		// Build the file list
		var ul = document.createElement('ul');

		for ( var e in entries ) {
			var li = document.createElement('li');

			// Create file anchor
			var link = document.createElement('a');
			link.innerHTML = entry_stats[e].name;
			//alert("anchor info ");
			link.href = entry_stats[e].path;
			//alert(entry_stats[e].path);
			//li.appendChild( link );

			if ( entry_stats[e].isFile ){
				li.appendChild( link );
				li.className = 'file';
			}
			else if ( entry_stats[e].isFolder ){
				li.appendChild( link );
				li.className = 'folder';
			}

			if ( entry_stats[e].isFile && entry_stats[e].name.indexOf('.txt') == -1 )
				li.className += ' disabled';

			ul.appendChild( li );
		}

		if ( parent )
			parent.appendChild( ul );
		else {
			dropbox_browser.appendChild( ul );
			//dropbox_browser.style.visibility = 'visible';
			document.getElementById('dropbox-auth').style.visibility = 'hidden';
		}
	});
}


var editor_load_file = function( file ) {
	// Empty the editor
	editor_area.className += 'loading';
	editor_area.innerText = '';
	doc_title.innerText = file.replace(/\\/g,'/').replace( /.*\//, '' );
	doc_title.setAttribute( 'rel', file );

	client.readFile( file, function( error, data ) {
		if ( error )
			console.log( 'is error', error );

		editor_area.innerText = data;

		if ( file.indexOf('.md') !== -1 || file.indexOf('.txt') !== -1) {
			hljs.highlightBlock( editor_area, false, true );
			preview_area.innerHTML = showdown.makeHtml( editor_area.innerText );
		}

		editor_area.className = editor_area.className.replace( 'loading', '' );
		editor_area.focus();
	});
}


var panes = new Swipe( document.getElementById('pages'), {
		callback: function( a, b ) {
			// Make only the current pane scroll, while the rest are overflow:hidden
			for ( s in this.slides )
				if ( s == this.index )
					this.slides[s].style.height = null;
				else if ( s > -1 )
					this.slides[s].style.height = 'inherit';

			// Update the preview pane, if moving to preview pane
			if ( b == 2 ) {
				preview_area.innerHTML = showdown.makeHtml( editor_area.innerText );
			} else {
				editor_area.blur();
			}
		}
	});

var posi_key = '語';
var posi = document.createTextNode( posi_key );
var posi_location = 0;
var keys_ignore = [ 91, 17, 18, 8, 9, 229, 16, 32 ];

editor_area.onkeydown = function(e) {
	if ( e.keyCode == 9 )
		e.preventDefault();

	if ( e.metaKey || e.shiftKey || e.keyLocation )
		return;

	if ( keys_ignore.indexOf( e.keyCode ) == -1 )
		window.getSelection().getRangeAt(0).insertNode( posi );
}

editor_area.onpaste = function(e) {
	e.preventDefault();

	var clipboard = e.clipboardData.getData('text/plain');
	var an = window.getSelection().anchorNode;
	var offset = window.getSelection().anchorOffset + clipboard.length + 0;

	if ( an.nodeValue ) {
		an.nodeValue = an.nodeValue + clipboard;
		window.getSelection().collapse( an, offset );
	}
}

editor_area.onkeypress = function(e) {
	// Apply highlighting only if position indicator is present
	if ( this.innerText.indexOf( posi_key ) == -1 )
		return;

	hljs.highlightBlock( this, false, true );
	
	remove_posi( this );
}

var remove_posi = function( el ) {
	// Remove position indicator from the markup
	for ( child in el.childNodes ) {
		var cn = el.childNodes[ child ];

		if ( cn.nodeValue ) {
			var cn_posi = cn.nodeValue.indexOf( posi_key );

			if ( cn_posi !== -1 ) {
				cn.nodeValue = cn.nodeValue.replace( posi_key, '' );
				window.getSelection().collapse( cn, cn_posi );
			}
		} else {
			remove_posi( cn );
		}
	}
}

document.onkeydown = function(e) { 
	// Override Cmd+S for saving
	if ( e.metaKey && e.keyCode >= 65 && e.keyCode <= 93 ) {
		if ( String.fromCharCode(e.keyCode) == 'S' ) {
			client.writeFile( 'index.md', editor_area.innerText, function( error, stat ) {
				console.log( error, stat );
			});
			
			return false;
		}
	}
}

var dropbox_touch_handler = function(e) {
	
	// This is a file that we can't edit, bail out
	if ( e.target.offsetParent.className.indexOf('disabled') !== -1 )
		return false;

	if ( e.target.offsetParent.className.indexOf('file') !== -1 ) {
		history.pushState( 'edit', 'edit', '#/edit' + e.target.pathname );
		panes.slide(1);

		// Load the file into editor
		editor_load_file( e.target.pathname );

	} else if ( e.target.offsetParent.className.indexOf('folder') !== -1 ) {
		// Unfold the folder
		if ( ! e.target.nextSibling )
			dropbox_browser_load_folder( e.target.pathname, e.target.offsetParent );

		// Toggle expand state
		if ( e.target.offsetParent.className.indexOf('expanded') == -1 )
			e.target.offsetParent.className += ' expanded';
		else
			e.target.offsetParent.className = e.target.offsetParent.className.replace(' expanded', '');
	}

	e.stopPropagation();
	e.preventDefault();
}

dropbox_browser.onclick = dropbox_touch_handler;
dropbox_browser.ontouchstart = dropbox_touch_handler;

window.addEventListener( 'popstate', function(e) {
	 alert("hello");
   	if ( history.state == 'edit' ) {
   		editor_load_file( location.hash.replace( '#/edit', '' ) );
		panes.slide(1);
   	} else {
   		panes.slide(0);
   	}

   	editor_area.blur();
   	return false;
});


save.onclick = function(){
	var x = doc_title.innerHTML;
	client.writeFile( x, editor_area.innerText, function( error, stat ) {
				console.log( error, stat );
		});
	alert(x+" is saved");
}


newfile.onclick = function(){
	var x = prompt("please enter file name with extentions","");
	if (x != null) {
		client.writeFile( x, editor_area.innerText, function( error, stat ) {
				console.log( error, stat );
		});
		alert(x+" is created");
	}
}

newfolder.onclick = function(){
	client.readdir( "/", function( error, entries, dir_stat, entry_stats ){
		var d=[];
		for( var e in entries){
			if (entry_stats[e].isFolder) {
				//alert(entry_stats[e].name);
				d.push(entry_stats[e].name);
			}
			}
		for (var i in d) {
		}
	});	
}





