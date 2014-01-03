/**
 * Created by singgum3b on 12/30/13.
 */

//It's a shame that i can't use a template engine to make this easier.

var charts = [],
	currentSelectedChart = null,
	elCanvasWrap = document.querySelector('._canvasWrapper'),
	elCanvas = document.querySelector('._canvas'),
	elCanvasGrid = document.querySelector('._canvasGrid');

function newPictos(type, color, index) {
	var p = '<div class="_pictos">' +
		'<i class="icon ' + Pictos.ICON[type] + ' ' + Pictos.COLOR[color] + '"></i>' +
		'</div>';

	var e = document.createElement('div');
	e.innerHTML = p;
	e.firstChild.dataPictos = {type: type, color: color, index: index};
	return e.firstChild;
}

function buildChart(name, data) {
	var chartID = 'myChart' + charts.length;

	var p = '<div id="' + chartID + '" class="_pictochart">' +
		'<h2 class="_chartTitle">' + name + '</h2>' +
		'<div class="_chartBody"></div>' +
		'<div class="_chartResizeBtn"><i class="icon icon-resize"></i></div>' +
		'</div>';

	var e = document.createElement('div');
	e.innerHTML = p;
	var chartBody = e.querySelector('._chartBody');
	chartBody.style.fontSize = '100%';

	//add pictos to chart body
	var index = pictosBuilder(chartBody, data);

	//draggable & resizable
	document.querySelector('._canvas').appendChild(e.firstChild);
	helper.getElement('#' + chartID).draggable('_chartTitle').resizable('_chartResizeBtn');

	//Add chart to collection
	charts.push({
		id: chartID,
		name: name,
		data: data,
		count: index,
		domObj: document.querySelector('#' + chartID)
	});

	calibrateCanvas(charts[charts.length - 1].domObj);

	//rebind event listener
	document.querySelector('._canvas').removeEventListener('mousedown', _canvasMouseDown, false);
	document.querySelector('._canvas').removeEventListener('dblclick', _canvasDblClick, false);
	document.querySelector('._canvas').addEventListener('mousedown', _canvasMouseDown, false);
	document.querySelector('._canvas').addEventListener('dblclick', _canvasDblClick, false);
	//focus new created chart
	_chartFocus(charts[charts.length - 1].domObj);
}

/**
 *
 * @param el chart DOM element
 * @private
 */
function calibrateCanvas(el) {
	if (el != null) {
		if (el.scrollHeight > el.clientHeight) {
			el.style.height = '';
		}
		if (el.offsetWidth > elCanvas.offsetWidth) {
			el.style.width = elCanvas.offsetWidth + 'px';
		}
	}
	var leftCord = 0, topCord = 0;
	for (var i = 0; i < charts.length; i++) {
		var left = charts[i].domObj.offsetWidth + charts[i].domObj.offsetLeft,
			top = charts[i].domObj.offsetHeight + charts[i].domObj.offsetTop;
		leftCord = (leftCord > left ) ? leftCord : left;
		topCord = (topCord > top) ? topCord : top;
	}
	if (leftCord > 1000 && leftCord > elCanvasWrap.offsetWidth) {
		elCanvas.style.width = (leftCord + 200) + 'px';
	} else {
		elCanvas.style.width = (elCanvasWrap.offsetWidth + 200) + 'px';
	}
	if (topCord > 1000 && topCord > elCanvasWrap.offsetHeight) {
		elCanvas.style.height = (topCord + 200) + 'px';
	}
	elCanvasGrid.style.width = elCanvas.offsetWidth + 'px';
	elCanvasGrid.style.height = elCanvas.offsetHeight + 'px';
}

function calibrateChart(el) {
	el.style.width = '';
	el.style.width = el.offsetWidth + 'px';
	el.style.height = '';
	el.style.height = el.offsetHeight + 'px';
}
/**
 *
 * @param target
 * @param data[]
 * @returns {number}
 */
function pictosBuilder(target, data) {
	var index = 0;
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].count; j++) {
			target.appendChild(newPictos(data[i].type, data[i].color, index));
			index++;
		}
	}
	return index;
}

function _canvasDblClick(event) {
	var el = event.target;

	while (el.classList !== undefined && !el.classList.contains('_canvas')) {
		if (el.classList.contains('_chartResizeBtn')) {
			while (!el.classList.contains('_pictochart')) {
				el = el.parentNode;
			}
			calibrateChart(el);
			break;
		}
		el = el.parentNode;
	}

}

function _canvasMouseDown(event) {
	var el = event.target;
	if (el.classList.contains('_canvas')) {
		_canvasFocus(el);
		event.preventDefault();
	}
	while (el.classList !== undefined && !el.classList.contains('_canvas')) {
		if (el.classList.contains('_pictochart')) {
			_chartFocus(el);
			break;
		}
		el = el.parentNode;
	}
}

function _getChartDataByID(id) {
	for (var i = 0; i < charts.length; i++) {
		if (charts[i].id == id) return charts[i];
	}
	return null;
}

function _canvasFocus(canvas) {
	//unfocus charts
	for (var i = 0; i < charts.length; i++) {
		charts[i].domObj.classList.remove('_selected');
	}
	currentSelectedChart = null;
	//switch to new panel & load pending data if available
	cfPanelNew();
}

function _chartFocus(el) {
	//modify z-index & remove selected
	if (el.style.zIndex != charts.length) {
		for (var i = 0; i < charts.length; i++) {
			if (charts[i].domObj.style.zIndex !== '' && charts[i].domObj.style.zIndex > 1) {
				charts[i].domObj.style.zIndex--;
			}
			charts[i].domObj.classList.remove('_selected');
		}
		el.style.zIndex = charts.length;
	}

	//addclass selected
	el.classList.add('_selected');

	if (currentSelectedChart == null || currentSelectedChart.id != el.id) {
		//reload panel with chart's data
		currentSelectedChart = _getChartDataByID(el.id);
		reloadPanelFromChartData(currentSelectedChart);
	}
}