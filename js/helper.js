/**
 * Created by singgum3b on 12/27/13.
 */

//----------------------------------------------------------------------------------//

var helper = {
	getElement: function (selectors) {
		var p = Object.create(helper.getElement.prototype);
		p.nodelist = document.querySelectorAll(selectors);
		return p;
	},
	//This should've get in to prototype of getElement function,but it'd introduce more complexity
	//After all i'm not building a new framework.
	getStyle: function getStyle(el, styleProp) {
		return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
	}
};
/**
 *
 * @param handleSelector handle selector for the resize action
 * @returns {getElement}
 */
helper.getElement.prototype.resizable = function (handleSelector) {
	for (var i = 0; i < this.nodelist.length; i++) {
		this.nodelist[i].classList.add('_resizable');
		this.nodelist[i].querySelector('.' + handleSelector).resizeHandle = true;
		window.removeEventListener('mousedown', _resizeMouseDownHandler, true);
		window.addEventListener('mousedown', _resizeMouseDownHandler, true);
	}
	return this;
};

/**
 * @param handleSelector Passing an additional drag handler classSelector(must be child element)
 * @returns {getElement}
 */
helper.getElement.prototype.draggable = function (handleSelector) {

	for (var i = 0; i < this.nodelist.length; i++) {
		this.nodelist[i].classList.add('_draggable');
		this.nodelist[i].querySelector('.' + handleSelector).dragHandle = true;
		window.removeEventListener('mousedown', _dragMouseDownHandler, false);
		window.addEventListener('mousedown', _dragMouseDownHandler, false);
	}
	return this;
};

//--------------------------RESIZE-----------------------------------------------------------------------------------//

function _initResize(element, event) {
	element.mouseStartPos = {x: event.clientX, y: event.clientY};
	element.elementStartSize = {
		width: element.offsetWidth,
		height: element.offsetHeight
	};
	element.limitSize = {
		width: element.parentNode.offsetWidth,
		height: element.parentNode.offsetHeight
	};
}

function _executeResize(element, event) {
	if (!document.body.classList.contains('_resizing')) document.body.classList.add('_resizing');
	//Resizing logic
	var _newWidth = ( element.elementStartSize.width + (event.clientX - element.mouseStartPos.x)),
		_newHeight = (element.elementStartSize.height + (event.clientY - element.mouseStartPos.y)),
		_curWidth = element.clientWidth;

	//Never allow size smaller than paddings
	//if (_newHeight < element.paddingBottom) _newHeight = element.paddingBottom;
	if (_newWidth < 0) _newWidth = 1;
	if (_newHeight < 0) _newHeight = 1;

	//Resizing
	if (_newWidth >= element.limitSize.width) {
		element.style.width = element.limitSize.width + 'px';
	} else {
		element.style.width = _newWidth + 'px';
		//Correcting width if overflow
		element.style.width = (element.scrollWidth + element.paddingRight) + 'px';

		//Check height again so it won't surpass limit
		element.style.height = '';
		if (element.clientHeight >= element.limitSize.height) {
			//Revert old width
			element.style.width = _curWidth + 'px';
		}
	}

	if (_newHeight >= element.limitSize.height) {
		element.style.height = element.limitSize.height + 'px';
	} else {
		element.style.height = '';
		if (element.offsetHeight < _newHeight) {
			element.style.height = _newHeight + 'px';
		}
	}
}

function _resizeMouseDownHandler(event) {
	var el = event.target;
	var flag = false;
	//try delegate to resize button
	while (el.classList !== undefined && !el.classList.contains('_resizable')) {
		if (el.resizeHandle) {
			flag = true;
		}
		el = el.parentNode;
	}
	if (flag) {
		//Add some simple expando to element
		_initResize(el, event);
		//bind event to determine & handle drag
		el.paddingRight = parseInt(helper.getStyle(el, 'padding-right'), 10);
		el.paddingBottom = parseInt(helper.getStyle(el, 'padding-bottom'), 10);
		window._resizeTarget = el;
		window.addEventListener('mousemove', _resizeMouseMoveHandler, false);
		window.addEventListener('mouseup', _resizeMouseUpHandler, false);
	}
}

function _resizeMouseMoveHandler(event) {
	_executeResize(window._resizeTarget, event);
}

function _resizeMouseUpHandler(event) {
	calibrateCanvas();
	document.body.classList.remove('_resizing');
	window._resizeTarget = null;
	window.removeEventListener('mousemove', _resizeMouseMoveHandler, false);
	window.removeEventListener('mouseup', _resizeMouseUpHandler, false);

}
//--------------------------DRAG-----------------------------------------------------------------------------------//

/**
 * Init the element with required drag cordinate info
 * @param element
 * @private
 */
function _initDrag(element, event) {
	element.mouseStartPos = {x: event.clientX, y: event.clientY};
	element.elementStartPos = {
		left: element.offsetLeft,
		top: element.offsetTop
	};
	element.limitPos = {
		left: element.parentNode.offsetWidth - element.offsetWidth,
		top: element.parentNode.offsetHeight - element.offsetHeight
	};
}

/**
 * Handle the dragging
 * @param element
 * @param event
 * @private
 */
function _excuteDrag(element, event) {

	if (!document.body.classList.contains('_dragging')) document.body.classList.add('_dragging');

	var deltaLeft = event.clientX - element.mouseStartPos.x,
		deltaTop = event.clientY - element.mouseStartPos.y;
	//Dragging logic
	var _newLeft = ( element.elementStartPos.left + deltaLeft ),
		_newTop = (element.elementStartPos.top + deltaTop);

	if (event.clientX <= 0) {
		elCanvasWrap.scrollLeft -= 20;
	}
	if (event.clientY <= 0) {
		elCanvasWrap.scrollTop -= 20;
	}
	if (event.clientX >= elCanvasWrap.offsetWidth) {
		elCanvasWrap.scrollLeft += 20;
	}
	if (event.clientY >= elCanvasWrap.offsetHeight) {
		elCanvasWrap.scrollTop += 20;
	}

	if (_newLeft < 0) {
		element.style.left = '0px';
	} else if (_newLeft > element.limitPos.left) {
		element.style.left = element.limitPos.left + 'px';
	} else {
		element.style.left = _newLeft + 'px';
	}

	if (_newTop < 0) {
		element.style.top = '0px';
	} else if (_newTop > element.limitPos.top) {
		element.style.top = element.limitPos.top + 'px';
	} else {
		element.style.top = _newTop + 'px';
	}
}

/**
 * Listen to drag event
 * @param event
 * @private
 */
function _dragMouseDownHandler(event) {
	var el = event.target;
	if (el.classList.contains('_draggable')) {
		//Add some simple expando to element
		_initDrag(el, event);
	} else if (el.dragHandle) {
		while (!el.classList.contains('_draggable')) {
			el = el.parentNode;
		}
		if (el !== null) _initDrag(el, event);
	} else {
		return;
	}
	//bind event to determine & handle drag
	window._dragTarget = el;
	window.addEventListener('mousemove', _dragMouseMoveHandler, false);
	window.addEventListener('mouseup', _dragMouseUpHandler, false);
}
/**
 *
 * @param event
 * @private
 */
function _dragMouseMoveHandler(event) {
	_excuteDrag(window._dragTarget, event);
}

/**
 *
 * @param event
 * @private
 */
function _dragMouseUpHandler(event) {
	//Clean up
	calibrateCanvas();
	document.body.classList.remove('_dragging');
	window._dragTarget = null;
	window.removeEventListener('mousemove', _dragMouseMoveHandler, false);
	window.removeEventListener('mouseup', _dragMouseUpHandler, false);
}