/**
 * Created by singgum3b on 1/1/14.
 */

//Modified from MDN example https://developer.mozilla.org/en-US/docs/HTML/Canvas/Drawing_DOM_objects_into_a_canvas
function htmlCapture(domobj) {
	var canvas = document.createElement("canvas"),
		documentBody = document.querySelector('body');
	canvas.width = documentBody.offsetWidth;
	canvas.height = documentBody.offsetHeight;
	documentBody.insertBefore(canvas, documentBody.firstChild);

	//---------------Building html ------------------------------//
	var html = document.createElement('html');
	var body = document.createElement('body');
	var header = document.createElement('head');
	header.innerHTML = '<link type="text/css" rel="stylesheet" href="css/style.css" />';
	body.innerHTML = domobj.outerHTML;
	html.appendChild(header);
	html.appendChild(body);
	html.setAttribute('xmlns', document.documentElement.namespaceURI);
	console.log(html.innerHTML);

	// Get well-formed markup
	// Webkit families generate false xml format output (eg. self-contained tag get stripped : <br/> -> <br>)
	html = (new XMLSerializer()).serializeToString(html);

	var ctx = canvas.getContext("2d");
	var data = "<svg xmlns='http://www.w3.org/2000/svg' width='" + documentBody.offsetWidth + "' height='" + documentBody.offsetHeight + "'>" +
		"<foreignObject width='100%' height='100%'>" +
		html +
		"</foreignObject>" +
		"</svg>";

	var DOMURL = self.URL || self.webkitURL || self;
	var img = new Image();
	var svg = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
	var url = DOMURL.createObjectURL(svg);

	img.onload = function () {
		ctx.drawImage(img, 0, 0);
		DOMURL.revokeObjectURL(url);
	};
	img.src = url;
}