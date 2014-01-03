/**
 * Created by singgum3b on 12/27/13.
 */

var _cfPanel = document.querySelector('._configPanel'),
	elCname = _cfPanel.querySelector('#chartTitle'),
	elColor = _cfPanel.querySelector('#pictosColor'),
	elType = _cfPanel.querySelector('#pictosType'),
	elTotal = _cfPanel.querySelector('#pictosCount'),
	elCount = _cfPanel.querySelector('#pictosQuantity'),
	elBody = _cfPanel.querySelector('#pictosTable tbody'),
	_currentPendingChart = {
		name: '',
		data: [],
		count: 0
	};

var _validateHandler = {
	newChart: function () {
		var result = true
		if (elCname.value == '') {
			result = false;
			elCname.parentNode.classList.add('_invalid');
		} else {
			elCname.parentNode.classList.remove('_invalid');
		}
		return result;
	},
	addPictos: function () {
		var result = true;
		if (elColor.value == null || elType == null || elCount == null) {
			result = false;
			elCount.parentNode.classList.add('_invalid');
		} else {
			if (/^([0-9]\d*)$/.test(elCount.value) && elCount.value <= 100 && elCount.value > 0) {
				elCount.parentNode.classList.remove('_invalid');
			} else {
				result = false;
				elCount.parentNode.classList.add('_invalid');
			}
		}
		return result;
	},
	removePictos: function () {
		return true;
	},
	colorSelect: function () {
		return true;
	},
	logChart: function () {
		return true;
	},
	captureEditor: function () {
		return true;
	}
};

var _controlHandler = {
	newChart: function () {
		buildChart(elCname.value, _currentPendingChart.data);
		_currentPendingChart = {
			name: '',
			data: [],
			count: 0
		};
	},
	addPictos: function () {
		var data = {
			color: elColor.value,
			type: elType.value,
			count: parseInt(elCount.value, 10)
		};
		if (currentSelectedChart != null) {
			_addPictos(currentSelectedChart, data);
		} else {
			_addPictos(_currentPendingChart, data);
		}
	},
	removePictos: function (event) {
		var el = event.target;
		while (el.tagName.toLowerCase() != 'tr') {
			el = el.parentNode;
		}
		_removePictos(el.pictosData);
	},
	colorSelect: function (event) {
		var el = event.target;
		var newColor = el.value;
		while (el.tagName.toLowerCase() != 'tr') {
			el = el.parentNode;
		}
		_colorSelect(el.pictosData, newColor);
		el.pictosData.color = newColor;
	},
	logChart: function () {
		console.log(currentSelectedChart);
	},
	captureEditor: function () {
		htmlCapture(document.querySelector('#myPictogram'));
	}
};

function _colorSelect(data, newColor) {
	if (data != null) {
		if (currentSelectedChart != null) {
			var chartBody = currentSelectedChart.domObj.querySelector('._chartBody'),
				picList = chartBody.querySelectorAll('._pictos');
			for (var j = data.end; j >= data.start; j--) {
				picList[j].querySelector('i').classList.remove(Pictos.COLOR[data.color]);
				picList[j].querySelector('i').classList.add(Pictos.COLOR[newColor]);
			}
			_colorUpdate(currentSelectedChart, data, newColor);
		} else {
			_colorUpdate(_currentPendingChart, data, newColor);
		}
	}
}

function _colorUpdate(chart, data, newColor) {
	var index = 0;
	for (var i = 0; i < chart.data.length; i++) {
		index += chart.data[i].count;
		if (index - 1 == data.end) {
			chart.data[i].color = newColor;
			break;
		}
	}
}

/**
 *
 * @param data JSON {type,color,start,end}
 * @private
 */
function _removePictos(data) {
	if (data != null) {
		if (currentSelectedChart != null) {
			var chartBody = currentSelectedChart.domObj.querySelector('._chartBody'),
				picList = chartBody.querySelectorAll('._pictos');
			for (var j = data.end; j >= data.start; j--) {
				chartBody.removeChild(picList[j]);
			}
			_updatePictos(currentSelectedChart, data);
		} else {
			_updatePictos(_currentPendingChart, data);
		}
	}

}

function _updatePictos(chart, data) {
	//remove logic - based on sets make it complicated
	var index = 0;
	for (var i = 0; i < chart.data.length; i++) {
		index += chart.data[i].count;
		if (index > data.start && index <= data.end) {
			chart.data[i].count -= (index - data.start + 1);
		}
		if (index > data.end) {
			chart.data[i].count -= (chart.data[i].count - (index - data.end - 1));
			break;
		}
	}
	//clear blank entry
	for (var k = 0; k < chart.data.length; k++) {
		if (chart.data[k].count <= 0) {
			chart.data.splice(k, 1);
		}
	}
	chart.count -= (data.end - data.start + 1);
	_reloadSumTable(chart.data);
}

function _addPictos(chartObj, data) {
	chartObj.data.push(data);
	_rowBuilder(elBody, data, chartObj.count);
	if (chartObj.domObj != null) {
		pictosBuilder(chartObj.domObj.querySelector('._chartBody'), [data]);
		calibrateCanvas(chartObj.domObj);
	}
	chartObj.count += data.count;
	elTotal.value = chartObj.count;
}

function _rowBuilder(target, data, count) {
	var row = document.createElement('tr'),
		content = '';
	for (var i in data) {
		if (data.hasOwnProperty(i)) {
			if (i == 'count') {
				content += '<td>' + (count + 1) + ' -> ' + (count + data[i]) + '</td>';
			} else if (i == 'color') {
				var select = _selectBuilder(Pictos.COLOR, data[i].toUpperCase(), 'colorSelect');
				//select.setAttribute('onchange', '_controlHandler.colorChange(event)');
				content += '<td>' + select.outerHTML + '</td>';
			} else {
				content += '<td>' + data[i] + '</td>';
			}
		}
	}
	content += '<td><button type="button" data-action="removePictos">Remove</button></td>';
	row.innerHTML = content;
	row.pictosData = {color: data.color, type: data.type, start: count, end: (count + data.count - 1)};
	target.appendChild(row);
	//return number of new rows added
	return data.count;
}

function _selectBuilder(options, selectedVal, action) {
	var select = document.createElement('select');
	for (var i in options) {
		var opt = document.createElement('option');
		opt.value = i;
		if (i == selectedVal) opt.setAttribute('selected', 'selected');
		opt.innerHTML = i;
		select.appendChild(opt);
	}
	if (action != null) select.setAttribute('data-action', action);
	return select;
}

function _optionBuilder(target, options) {
	for (var i in options) {
		var opt = document.createElement('option');
		opt.value = i;
		opt.innerHTML = i;
		target.appendChild(opt);
	}
}

/**
 * Init control Panel
 * @param isFromChart
 * @private
 */
function _initPanel(isFromChart) {
	if (!isFromChart) {
		_optionBuilder(elColor, Pictos.COLOR);
		_optionBuilder(elType, Pictos.ICON);
	}
}

//Delegate according to id or data - command pattern in Java
function _controlPanelClick(event) {
	var el = event.target;
	//TODO: Rely on data-action only
	if (_controlHandler[el.id] != null) {
		if (_validateHandler[el.id](event)) _controlHandler[el.id](event);
	}

	if (_controlHandler[el.getAttribute('data-action')] != null) {
		if (el.getAttribute('data-action') == 'colorSelect') {
			return;
		}
		if (_validateHandler[el.getAttribute('data-action')](event)) _controlHandler[el.getAttribute('data-action')](event);
	}
}

function _controlPanelChange(event) {
	var el = event.target;
	if (_controlHandler[el.getAttribute('data-action')] != null) {
		if (_validateHandler[el.getAttribute('data-action')](event)) _controlHandler[el.getAttribute('data-action')](event);
	}
}

function cfPanelNew() {
	_cfPanel.classList.remove('_edit');
	elCname.value = _currentPendingChart.name;
	elTotal.value = _currentPendingChart.count;
	_reloadSumTable(_currentPendingChart.data);
}

function reloadPanelFromChartData(chartData) {
	_cfPanel.classList.add('_edit');
	elCname.value = chartData.name;
	elTotal.value = chartData.count;
	_reloadSumTable(chartData.data);
}

function _reloadSumTable(data) {
	elBody.innerHTML = '';
	var idx = 0;
	for (var i = 0; i < data.length; i++) {
		idx += _rowBuilder(elBody, data[i], idx);
	}
	return idx;
}

//App startpoint
(function _app() {
	_cfPanel.addEventListener('click', _controlPanelClick, false);
	_cfPanel.addEventListener('change', _controlPanelChange, false);
	_initPanel(false);
})();

//------------TESTING----------------------------------------------------------//
var data = [
	{color: 'RED', type: 'KNIFE', count: 3},
	{color: 'BLUE', type: 'DISH', count: 2},
	{color: 'GREEN', type: 'FORK', count: 2}
];

for (var i = 0; i < 1; i++) {
	buildChart('Sample Chart', data);
}

//---------------------------------------------------------------------------//