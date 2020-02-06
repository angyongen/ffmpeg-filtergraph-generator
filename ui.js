var objIdCounter = 1;
var connectionIdCounter = 0;
var connectionTargets = {}; //connection source will not contain information for sinks to serve as direction check
var target_stored_in_connectionTargets = "T" //flag to get info from connectionTargets instead

var mouseObject = document.createElement("div")
mouseObject.style = "display:none"
mouseObject.id = "O0"
mouseObject.getBoundingClientRect = function() {
	return {right: this.x, left:this.x, bottom:this.y, top:this.y}
}

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
		if (obj.connections) {
			data.connections = obj.connections
		}
		e.dataTransfer.setData("application/json", JSON.stringify(data));
		//console.log(e)
	}
	return obj
}

function createObject() {
	var obj = createObjectSource()
	obj.id = "O" + objIdCounter++;
	return obj
}

function createArrowElement(x1, y1, x2, y2) {
	var arrow = document.createElement("div")
	arrow.className = "arrow"
	arrow.style.left = x1
	arrow.style.top = y1
	var line = document.createElement("div")
	//line.className = "line"
	line.style.borderWidth = "1px"
	line.style.borderStyle = "solid"
	line.style.borderColor = "black"
	var lineWidth = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))
	line.style.width = lineWidth + "px"

	var arrowhead = document.createElement("div")
	arrowhead.style.borderStyle = "solid"
	arrowhead.style.borderColor = "black"
	arrowhead.style.borderWidth = "0 3px 3px 0"
  arrowhead.style.display = "inline-block"
  arrowhead.style.padding = "3px"
  arrowhead.style.transform = "rotate(-45deg)"
  arrowhead.style.marginTop = "-5px"
  arrowhead.style.marginLeft = lineWidth/2 + "px"


	var xOffset = x2 - x1
	var yOffset = y2 - y1
	var basicAngle = Math.atan(yOffset/xOffset)
	if (xOffset < 0) {
		basicAngle = basicAngle - Math.PI
	}
	arrow.style.transformOrigin =  "0 0";
	arrow.style.transform = "rotate(" + basicAngle + "rad)"
	arrow.appendChild(line);
	arrow.appendChild(arrowhead);
	return arrow;
}

function createConnectingArrow(obj1, obj2, droptarget) {
	var dropTargetRect = droptarget.getBoundingClientRect()
	var obj1Rect = obj1.getBoundingClientRect()
	var obj1midX = (obj1Rect.left + obj1Rect.right) / 2 - dropTargetRect.left
	var obj1midY = (obj1Rect.top + obj1Rect.bottom) / 2 - dropTargetRect.top
	var obj2Rect = obj2.getBoundingClientRect()
	var obj2midX = (obj2Rect.left + obj2Rect.right) / 2 - dropTargetRect.left
	var obj2midY = (obj2Rect.top + obj2Rect.bottom) / 2 - dropTargetRect.top
	var arrowElement = createArrowElement(obj1midX, obj1midY, obj2midX, obj2midY)
	arrowElement.onclick = function() {
		unconnectBlocks(obj1, this.id, obj2)
	}
	return arrowElement
}

function connectBlocks(obj1, obj2, droptarget) {
	var arrow = createConnectingArrow(obj1, obj2, droptarget)
	var arrowId = "A" + connectionIdCounter++
	arrow.id = arrowId
	obj1.connections[arrowId] = target_stored_in_connectionTargets//obj2.id
	connectionTargets[arrowId] = obj2.id
	obj2.connections[arrowId] = obj1.id
	droptarget.appendChild(arrow)
}

function deleteArrow(arrow) {
	if (arrow) {
		if (arrow.parentNode) arrow.parentNode.removeChild(arrow)
	}
}

function unconnectBlocks(obj1, arrowId, obj2) {
	var arrow = document.getElementById(arrowId)
	if (arrow) {
		deleteArrow(arrow)
		if (arrow.id) delete connectionTargets[arrow.id]
		if (obj1 && obj1.connections[arrowId]) delete obj1.connections[arrowId]
		if (obj2 && obj2.connections[arrowId]) delete obj2.connections[arrowId]
	}
}

function createBlockFromObject(obj) {
	obj.className = "block"
	obj.connections = {}
	obj.updateConnections = function() {
		var droptarget = obj.parentElement
		for (var arrowId in obj.connections) {
			deleteArrow(document.getElementById(arrowId))
			var targetId = obj.connections[arrowId]
			var arrow;
			if (targetId == target_stored_in_connectionTargets) { //obj is source
				arrow = createConnectingArrow(obj, document.getElementById(connectionTargets[arrowId]), droptarget)
			} else { // obj is sink
				arrow = createConnectingArrow(document.getElementById(targetId), obj, droptarget)
			}
			arrow.id = arrowId
			droptarget.appendChild(arrow)
		}
	}
	obj.onclick = function(e) {
		var droptarget = e.target.parentElement;
		var mouseConnections = Object.keys(mouseObject.connections)
		if (mouseConnections.length == 0) {
			connectBlocks(obj, mouseObject, droptarget)
		} else {
			var arrowId = mouseConnections[0]
			var otherObj = document.getElementById(mouseObject.connections[arrowId])
			unconnectBlocks(mouseObject, arrowId, otherObj)
			if (obj.id != otherObj.id) {
				connectBlocks(otherObj, obj, droptarget)
			}
		}
	}
	return obj
}

mouseObject = createBlockFromObject(mouseObject)

function createBlock(droptarget) {
	var obj = createObject();
	return createBlockFromObject(obj);
}

function restoreObject(event, droptarget) {
	var json = JSON.parse(event.dataTransfer.getData("application/json"))
		//console.log(json)
	var obj;
	if (json.id) obj = document.getElementById(json.id)
	if (json.text) {
		obj = createObject()
		obj.textContent = json.text;
	}
	if (obj) {
		var dropTargetLeft = 0
		var dropTargetRight = 0
		var dropTarget;
		if (obj.parentElement) dropTarget = obj.parentElement
		if (droptarget) dropTarget = droptarget
		if (dropTarget)	{
			var dropTargetRect = dropTarget.getBoundingClientRect()
			dropTargetLeft = dropTargetRect.left
			dropTargetRight = dropTargetRect.top
		}
	  obj.style.left = event.clientX - json.offsetX - dropTargetLeft
	  obj.style.top = event.clientY - json.offsetY - dropTargetRight
	}
	return obj
}

function restoreBlock(event, droptarget) {
	var obj = restoreObject(event, droptarget)
	obj = createBlockFromObject(obj)
	var json = JSON.parse(event.dataTransfer.getData("application/json"))
	if (json.connections) {
		obj.connections = json.connections //reconnect
	}
	obj.updateConnections()
	return obj;
}

function deleteObject(event) {
	var obj = restoreObject(event);
	if (obj.parentNode) obj.parentNode.removeChild(obj) //restored obj may not be in DOM
	if (obj.connections) {
		for (var arrowId in obj.connections) {
			unconnectBlocks(obj, arrowId, document.getElementById(obj.connections[arrowId]))
		}
	}
}


document.addEventListener("dragenter", function(event) {
  //if ( event.target.className == "droptarget" ) { event.target.style.border = "3px dotted red"; }
});


// By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
window.addEventListener("load", function() {
document.body.appendChild(mouseObject)
var dropTargets = document.getElementsByClassName("droptarget")
for (var i = dropTargets.length - 1; i >= 0; i--) {
	var dropTarget = dropTargets[i]
	dropTarget.addEventListener("dragover", function(event) {event.preventDefault();})
	dropTarget.addEventListener("drop", function(event) {
			event.preventDefault()
			var obj = restoreBlock(event, this)
			this.appendChild(obj)
	});
	dropTarget.addEventListener("mousemove", function(event) {
		if (!dropTarget.contains(mouseObject)) dropTarget.appendChild(mouseObject)
		mouseObject.x = event.clientX
		mouseObject.y = event.clientY
		mouseObject.updateConnections()
	})
	dropTarget.addEventListener("mousedown", function(event) {
		if (event.target.className != "block") {
			var mouseConnections = Object.keys(mouseObject.connections)
			if (mouseConnections.length > 0) {
				var arrowId = mouseConnections[0]
				var otherObj = document.getElementById(mouseObject.connections[arrowId])
				unconnectBlocks(mouseObject, arrowId, otherObj)
			}
		}
	})
}
})