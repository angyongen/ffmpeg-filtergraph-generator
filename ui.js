var objIdCounter = 0;

function createObjectSource() {
	var obj = document.createElement("div")
	obj.className = "obj"
	obj.draggable = true
	obj.ondragstart = function(e) {
		var objRect = obj.getBoundingClientRect()
		var offsetX = e.clientX - objRect.left
		var offsetY = e.clientY - objRect.top
		var data = {offsetX:offsetX, offsetY:offsetY}
		if (obj.id) {
			data.id = obj.id
		} else {
			data.text = obj.textContent
		}
		e.dataTransfer.setData("application/json", JSON.stringify(data));
		//console.log(e)
	}
	return obj
}

function createObject() {
	var obj = createObjectSource()
	obj.id = objIdCounter++;
	return obj
}

function createBlock() {
	var obj = createObject();
	obj.className = "block"
	return obj;
}

function restoreObject(event) {
	var json = JSON.parse(event.dataTransfer.getData("application/json"))
		//console.log(json)
	var obj;
	if (json.id) obj = document.getElementById(json.id);
	if (json.text) {
		obj = createObject()
		obj.textContent = json.text;
	}
	if (obj) {
	  obj.style.left = event.clientX - json.offsetX 
	  obj.style.top = event.clientY - json.offsetY
	}
	return obj
}

function restoreBlock(event) {
	var obj = restoreObject(event);
	obj.className = "block"
	return obj;
}

function deleteObject(event) {
	var obj = restoreObject(event);
	if (obj.parentNode) obj.parentNode.removeChild(obj) //restored obj may not be in DOM
}

document.addEventListener("drop", function(event) {
	if (event.target.className == "droptarget") {
	  event.preventDefault();
		var obj = restoreBlock(event);
		event.target.appendChild(obj)
	}
});

document.addEventListener("dragenter", function(event) {
  //if ( event.target.className == "droptarget" ) { event.target.style.border = "3px dotted red"; }
});

// By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
document.addEventListener("dragover", function(event) {
	if (event.target.className == "droptarget") {
		event.preventDefault();
	}
});