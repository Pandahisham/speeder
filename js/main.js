var STATE = {
	Empty: 		{value: 0, text: 'Empty'},
	Loaded: 	{value: 1, text: 'Loaded'},
	Reading: 	{value: 2, text: 'Reading'},
	Paused: 	{value: 3, text: 'Paused'},
	Modal:		{value: 4, text: 'Modal'} 
};

var wpm;
var chunk;
var txt;

var eState = STATE.Empty;
var ePrevState = STATE.Empty;

$(document).ready(function(){
	InitEngine();
	setupAttributes();
	onNewText();
});

function onKeyPress(event) {
	var k = (event.keyCode ? event.keyCode : event.which);

	if (eState == STATE.Modal) return;

	if (k == 78 || k == 110) { // N pressed
		Engine.pause();
		$('#txtaInput').focus();
		changeState(STATE.Modal);
		$('#modalInput').modal('show');
	}
	else if (k == 32) { // Space pressed
		if (eState == STATE.Loaded) {
			changeState(STATE.Reading);
			Engine.start();
		}
		else if (eState == STATE.Reading) {
			Engine.pause();
		}
		else if (eState == STATE.Paused) {
			changeState(STATE.Reading);
			Engine.resume();
		}
	}
	else if (k == 71 || k == 103) { // G pressed
		changeChunkSize(-1);
	}
	else if (k == 72 || k == 104) { // H pressed
		changeChunkSize(1);
	}
	else if (k == 70 || k == 102) { // F pressed
		changeWPM(-10);
	}
	else if (k == 74 || k == 106) { // J pressed
		changeWPM(10);
	}
}

function onKeyDown(e) {
	if (eState == STATE.Modal) {
		if (e.ctrlKey && e.keyCode == 13) { // Ctrl+Enter
			$('#modalInput').modal('hide');
			onNewText();
		}
	}
}


function EngineCallback(state, text) {
	if (state == EngSTATE.Finished) {
		changeState(STATE.Loaded);
		return;
	}	
	else if (state == EngSTATE.Paused) {
		changeState(STATE.Paused);
		return;
	}	

	$('#divCanvas').text(text);
}

function InitEngine() {
	wpm = 600;
	chunk = 3;

	changeWPM(0);
	changeChunkSize(0);
	Engine.setCallback(EngineCallback);
}

function onNewText() {
	txt = $.trim($('#txtaInput').val());
	var res = Engine.setText(txt);

	if (res > 0) {
		changeState(STATE.Loaded);
	} else {
		changeState(STATE.Empty);
	}

	$('#divCanvas').text(Engine.getNextChunk());
}

function changeWPM(delta) {
	if (wpm + delta < 0) return;

	wpm += delta;
	Engine.setWPM(wpm);
	$('#divWPM').text(wpm);
}

function changeChunkSize(delta) {
	if (chunk + delta < 0) return;

	chunk += delta;
	Engine.setChunk(chunk);
	$('#divChunk').text(chunk);
}

function setupAttributes() {
	$(document).keypress(function(e){
		onKeyPress(e);
	}).keydown(function(e){
		onKeyDown(e);
	});

	var legend = "[N]: new_____[SPACE]: start/pause_____[J]/[F]: +/- WPM_____[H]/[G]: +/- chunk size";
	$('#divLegend').html(formatLegend(legend));

	$('#txtaInput').val("Once the quietness arrived, it stayed and spread in Estha. It reached out of his head and enfolded him in its swampy arms. It rocked him to the rhythm of an ancient, fetal heartbeat. It sent its stealthy, suckered tentacles inching along the insides of his skull, hoovering the knolls and dells of his memory; dislodging old sentences, whisking them off the tip of his tongue.");

	var mod = $('#modalInput');

	mod.on('shown', function() {
		$('#txtaInput').val(txt).select().focus();
	}).on('hidden', function() {
		if (eState == STATE.Modal) changeState(ePrevState);
	});

	$('#modalLegend').html(formatLegend("[Ctrl]+[ENTER]: Use this text_____[ESC]: Cancel"));
}

function changeState(state) {
	ePrevState = eState;
	eState = state;
}

function formatLegend(str) {
	return str.replace(/\[/g, '<strong class="label">').replace(/\]/g, '</strong>')
		.replace(/_/g, '&nbsp;');
}

