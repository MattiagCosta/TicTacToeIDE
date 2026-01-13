var id_prefix = 'Tic-Tac-Toe-';
var id_number = 0;
var TicTacToe_list = [];

const default_info = {empty:'',first_player:'X',second_player:'O',numeric_sequence:'',body_div_visibility:true,settings_div_visibility:false,settings:[],number_of_transformations:0};

const settings = [
	{
		type:'Show alignments',
		option:'allowed',
		targets:['.cell']
	},
	{
		type:'Enable hover',
		option:'hover',
		targets:['.cell']
	},
	{
		type:'Enable danger hover',
		option:'danger_hover',
		targets:['.cell']
	},
	{
		type:'Disable cursor',
		option:'hidden_cursor',
		targets:['.board_table']
	},
	{
		type:'Hide',
		option:'hidden',
		targets:['.control_div','.data_div','.transformations_div','.markers_div']
	},
	{
		type:'Hide controls',
		option:'hidden',
		targets:['.undo_move_button','.clear_board_button']
	},
	{
		type:'Hide data',
		option:'hidden',
		targets:['.numeric_sequence','.board','.alignments','.winner','.universal_sequence']
	}
];

var transformations = {
	'counterclockwise90rotation':'630741852',
	'clockwise90rotation':'258147036',
	'0reflection':'678345012',
	'90reflection':'210543876',
	'45reflection':'852741630',
	'135reflection':'036147258'
};

var empty_status = '0';
var first_player_status = '1';
var second_player_status = '2';
var alignments = ['012','036','258','678','345','147','048','246'];
var position_id = 'P'
var initial_point_of_view = 'CBCBABCBC';
var center_point_of_view = 'EDEDPDEDE';
var middle_point_of_view = 'HPHIGIJFJ';
var corner_point_of_view = 'PMNMKONOL';

function AddTicTacToe(id, info = null){
	TicTacToe_list.push(new TicTacToe(id, info ? info : undefined));
}

function AddTicTacToeDefaultId(info = null){
	AddTicTacToe(id_prefix + id_number, info);
	id_number++;
}

function GetTicTacToe(id){
	let x = null;
	for(let t of TicTacToe_list){
		if(t.id == id){
			x = t;
			break;
		}
	}
	return x;
}

function GetTicTacToeIndex(id){
	let x = null;
	for(let i = 0; i < TicTacToe_list.length; i++){
		if(TicTacToe_list[i].id == id){
			x = i;
			break;
		}
	}
	return x;
}

function DuplicateTicTacToe(from_id, to_id){
	const t = GetTicTacToe(from_id);
	if(t){
		AddTicTacToe(to_id, structuredClone(t.info))
	}
}

function DuplicateTicTacToeDefaultId(from_id){
	const t = GetTicTacToe(from_id);
	if(t){
		AddTicTacToeDefaultId(structuredClone(t.info));
	}
}

function RemoveTicTacToe(id){
	const index = GetTicTacToeIndex(id);
	if(index !== null){
		document.getElementById(id).remove();
		TicTacToe_list.splice(index, 1);
	}
}

function FillInfoSettings(info){
	for(let setting of settings){
		if(info.settings[setting.type] === undefined){
			info.settings[setting.type] = {};
		}
		for(let target of setting.targets){
			if(info.settings[setting.type][target] === undefined){
				info.settings[setting.type][target] = false;
			}
		}
	}
}

function AppendTransformationListItems(){
	document.getElementById('transformations_list').innerHTML = '';
	for(let name in transformations){
		const after = transformations[name]

		const li = document.createElement('li');

		const name_span = document.createElement('span');
		name_span.innerHTML = name;

		const transformation_span = document.createElement('span');
		transformation_span.innerHTML = '012345678 → ' + after;

		const remove_button = document.createElement('button');
		remove_button.classList.add('danger_button');
		remove_button.innerHTML = 'Remove';
		remove_button.addEventListener('click', function(){
			delete transformations[name];
			li.remove();
		});

		li.appendChild(name_span);
		li.appendChild(transformation_span);
		li.appendChild(remove_button);

		document.getElementById('transformations_list').appendChild(li);
	}
}

function AppendAlignmentListItems(){
	document.getElementById('alignments_list').innerHTML = '';
	for(let alignment of alignments){
		const li = document.createElement('li');

		const span = document.createElement('span');
		span.innerHTML = alignment;

		const remove_button = document.createElement('button');
		remove_button.classList.add('danger_button');
		remove_button.innerHTML = 'Remove';
		remove_button.addEventListener('click', function(){
			alignments.splice(alignments.indexOf(alignment), 1);
			li.remove();
		});

		li.appendChild(span);
		li.appendChild(remove_button);

		document.getElementById('alignments_list').appendChild(li);
	}
}

function CheckNumericId(numeric_id){
	if('012345678'.includes(numeric_id)){
		return true;
	}
	return false;
}

function CheckAfter(after){
	if(after.length != 9){
		return false;
	}
	for(let id of after){
		if(!CheckNumericId(id)){
			return false;
		}
	}
	return true;
}

function CheckAlignment(alignment){
	if(alignment.length != 3){
		return false;
	}
	for(let id of alignment){
		if(!CheckNumericId(id)){
			return false;
		}
	}
	return true;
}

function RotatePointOfView(point_of_view){
	let rotated_point_of_view = "";
	rotated_point_of_view += point_of_view[2];
	rotated_point_of_view += point_of_view[5];
	rotated_point_of_view += point_of_view[8];
	rotated_point_of_view += point_of_view[1];
	rotated_point_of_view += point_of_view[4];
	rotated_point_of_view += point_of_view[7];
	rotated_point_of_view += point_of_view[0];
	rotated_point_of_view += point_of_view[3];
	rotated_point_of_view += point_of_view[6];
	return rotated_point_of_view
}

function MatchPointOfView(point_of_view, desired_cell_numeric_id){
	for(let i = 0; i < 4; i++){
		if(point_of_view[desired_cell_numeric_id] == position_id){
			break;
		}
		point_of_view = RotatePointOfView(point_of_view);
	}
	return point_of_view;
}

function CountMoveIds(move){
	let counts = {};
	for(let moveId of move){
		if(!counts[moveId]){
			counts[moveId] = 0;
		}
		counts.moveId++;
	}
	return counts;
}

function AreSimilarMoves(move0, move1){
	if(move0.length != move1.length){
		return false;
	}
	const counts0 = CountMoveIds(move0);
	const counts1 = CountMoveIds(move1);
	for(let moveId in counts0){
		if(counts0[moveId] != counts1[moveId]){
			return false;
		}
	}
	return true;
}

function CreateUniversalSequence(numeric_sequence){
	let universal_sequence = "";
	let point_of_views = [initial_point_of_view];
	for(let move of numeric_sequence){
		if(point_of_views.length > 1){
			universal_sequence += '-';
		}
		for(let point_of_view of point_of_views){
			universal_sequence += point_of_view[move];
		}
		if(move == '4'){
			point_of_views.push(center_point_of_view);
		}
		else if(move == '1' || move == '3' || move == '5' || move == '7'){
			point_of_views.push(MatchPointOfView(middle_point_of_view, move));
		}
		else{
			point_of_views.push(MatchPointOfView(corner_point_of_view, move));
		}
	}
	return universal_sequence;
}

class TicTacToe{
	constructor(id, info = structuredClone(default_info)){
		this.id = id
		FillInfoSettings(info);
		this.info = info;
		this.AppendDiv(id);
		this.Update();
	}

	AddMove(numeric_id){
		if(!this.info.numeric_sequence.includes(numeric_id)){
			this.info.numeric_sequence += numeric_id;
		}
	}

	RemoveMove(numeric_id){
		if(this.info.numeric_sequence.includes(numeric_id)){
			const parts = this.info.numeric_sequence.split(numeric_id);
			this.info.numeric_sequence = parts[0] + parts[1];
		}
	}

	UndoLastMove(){
		this.info.numeric_sequence = this.info.numeric_sequence.substring(0, this.info.numeric_sequence.length - 1);
	}

	ChangeNumericSequence(after){
		let new_numeric_sequence = '';
		for(let move of this.info.numeric_sequence){
			new_numeric_sequence += after[move];
		}
		this.info.numeric_sequence = new_numeric_sequence;
	}

	TransformNumericSequence(transformation){
		if(transformations[transformation]){
			this.ChangeNumericSequence(transformations[transformation]);
		}
	}

	GetBoard(numeric_sequence){
		let board = '';
		for(let i = 0; i < 9; i++){
			if(numeric_sequence.includes(i)){
				board += numeric_sequence.indexOf(i) % 2 == 0 ? first_player_status : second_player_status;
			}
			else{
				board += empty_status;
			}
		}
		return board
	}

	GetAlignments(numeric_sequence){
		const board = this.GetBoard(numeric_sequence);
		let alignments_made = [];
		for(let alignment of alignments){
			if(board[alignment[0]] == board[alignment[1]] && board[alignment[1]] == board[alignment[2]] && board[alignment[0]] != empty_status){
				alignments_made.push(alignment);
			}
		}
		return alignments_made;
	}

	GetWinner(){
		let winner = 'None';
		for(let n = 0; n <= this.info.numeric_sequence.length + 1; n++){
			let subsequence = this.info.numeric_sequence.substring(0, n);
			const alignments = this.GetAlignments(subsequence);
			if(alignments[0]){
				const board = this.GetBoard(this.info.numeric_sequence);
				winner = (board[alignments[0][0]] == first_player_status) ? 'First player' : 'Second player';
				break;
			}
		}
		if(winner == 'None' && this.info.numeric_sequence.length == 9){
			winner = 'Tie';
		}
		return winner;
	}

	AppendDiv(id){
		const t = this;
		const main_div = document.createElement('div');
		main_div.classList.add('main_div');
		main_div.id = id;

		const head_div = document.createElement('div');
		head_div.classList.add('head_div');

		const name = document.createElement('p');
		name.classList.add('name');
		name.innerHTML = id;
		name.contentEditable = true;

		const toggle_button = document.createElement('button');
		toggle_button.classList.add('toggle_button');
		toggle_button.innerHTML = 'Toggle';
		toggle_button.addEventListener('click', function(){
			if(body_div.classList.contains('hidden')){
				t.info.body_div_visibility = true;
				body_div.classList.remove('hidden');
			}
			else{
				t.info.body_div_visibility = false;
				body_div.classList.add('hidden');
			}
		});

		const settings_button = document.createElement('button');
		settings_button.classList.add('settings_button');
		settings_button.innerHTML = 'Settings';
		settings_button.addEventListener('click', function(){
			if(settings_div.classList.contains('hidden')){
				t.info.settings_div_visibility = true;
				settings_div.classList.remove('hidden');
			}
			else{
				t.info.settings_div_visibility = false;
				settings_div.classList.add('hidden');
			}
		});

		const delete_button = document.createElement('button');
		delete_button.classList.add('delete_button');
		delete_button.classList.add('danger_button');
		delete_button.innerHTML = 'Delete';
		delete_button.addEventListener('click', function(){
			RemoveTicTacToe(id);
		});

		const duplicate_button = document.createElement('button');
		duplicate_button.classList.add('duplicate_button');
		duplicate_button.innerHTML = 'Duplicate';
		duplicate_button.addEventListener('click', function(){
			DuplicateTicTacToeDefaultId(t.id);
		});

		const reset_button = document.createElement('button');
		reset_button.classList.add('reset_button');
		reset_button.classList.add('danger_button');
		reset_button.innerHTML = 'Reset';
		reset_button.addEventListener('click', function(){
			t.info = structuredClone(default_info);
			const checkboxes = settings_div.getElementsByClassName('setting_checkbox');
			for(let checkbox of checkboxes){
				checkbox.checked = false;
			}
			FillInfoSettings(t.info);
			for(let setting of settings){
				for(let target of setting.targets){
					const input_id = id + setting.type + target;
					const input = document.getElementById(input_id);
					if(t.info.settings[setting.type][target] !== input.checked){
						input.checked = t.info.settings[setting.type][target];
						input.dispatchEvent(new Event('change'));
					}
				}
			}
			t.Update();
		});

		const update_button = document.createElement('button');
		update_button.classList.add('update_button');
		update_button.innerHTML = 'Force update';
		update_button.addEventListener('click', function(){
			t.Update();
		});

		head_div.appendChild(duplicate_button);
		head_div.appendChild(name);
		head_div.appendChild(delete_button);
		head_div.appendChild(settings_button);
		head_div.appendChild(reset_button);
		head_div.appendChild(toggle_button);
		head_div.appendChild(update_button);

		const body_div = document.createElement('div');
		body_div.classList.add('body_div');

		const board_table_div = document.createElement('div');
		board_table_div.classList.add('board_table_div');

		const board_table = document.createElement('table');
		board_table.classList.add('board_table');
		for(let i = 0; i < 3; i++){
			const tr = document.createElement('tr');
			for(let j = 0; j < 3; j++){
				const td = document.createElement('td');
				td.classList.add('cell');
				td.classList.add('cell' + (3*i+j));
				td.addEventListener('click', function(){
					if(this.classList.contains('taken')){
						t.RemoveMove(3*i+j);
						t.Update();
					}
					else{
						t.AddMove(3*i+j);
						t.Update();
					}
					
				});
				tr.appendChild(td);
			}
			board_table.appendChild(tr);
		}
		board_table_div.appendChild(board_table);

		const control_div = document.createElement('div');
		control_div.classList.add('control_div');

		const undo_move_button = document.createElement('button');
		undo_move_button.classList.add('undo_move_button');
		undo_move_button.innerHTML = 'Undo last move';
		undo_move_button.addEventListener('click', function(){
			t.UndoLastMove();
			t.Update();
		});
		control_div.appendChild(undo_move_button);

		const clear_board_button = document.createElement('button');
		clear_board_button.classList.add('clear_board_button');
		clear_board_button.classList.add('danger_button');
		clear_board_button.innerHTML = 'Clear board';
		clear_board_button.addEventListener('click', function(){
			t.info.numeric_sequence = '';
			t.Update();
		});
		control_div.appendChild(clear_board_button);

		board_table_div.appendChild(control_div);

		body_div.appendChild(board_table_div);

		const data_div = document.createElement('div');
		data_div.classList.add('data_div');

		const numeric_sequence = document.createElement('p');
		numeric_sequence.classList.add('numeric_sequence');
		data_div.appendChild(numeric_sequence);

		const board = document.createElement('p');
		board.classList.add('board');
		data_div.appendChild(board);

		const alignments = document.createElement('p');
		alignments.classList.add('alignments');
		data_div.appendChild(alignments);

		const winner = document.createElement('p');
		winner.classList.add('winner');
		data_div.appendChild(winner);

		const universal_sequence = document.createElement('p');
		universal_sequence.classList.add('universal_sequence');
		data_div.appendChild(universal_sequence);

		body_div.appendChild(data_div);

		const transformations_div = document.createElement('div');
		transformations_div.classList.add('transformations_div');

		const transformations_select = document.createElement('select');
		transformations_select.classList.add('transformations_select');
		transformations_div.appendChild(transformations_select);

		const transformation_button = document.createElement('button');
		transformation_button.innerHTML = 'Apply transformation';
		transformation_button.addEventListener('click', function(){
			t.TransformNumericSequence(document.querySelector(`#${t.id} .transformations_select`).value);
			t.Update();
		});
		transformations_div.appendChild(transformation_button);

		body_div.appendChild(transformations_div);
		body_div.classList.add('body_div');
		if(this.info.body_div_visibility == false){
			body_div.classList.add('hidden');
		}

		const markers_div = document.createElement('div');
		markers_div.classList.add('markers_div');

		const input_empty = document.createElement('input');
		input_empty.classList.add('empty');
		input_empty.classList.add('one_char_input');
		input_empty.type = 'text';
		input_empty.maxLength = 1;
		input_empty.value = this.info.empty;
		input_empty.addEventListener('change', function(){
			t.info.empty = this.value;
			t.Update();
		});
		markers_div.appendChild(input_empty);

		const input_first_player = document.createElement('input');
		input_first_player.classList.add('first_player');
		input_first_player.classList.add('one_char_input');
		input_first_player.type = 'text';
		input_first_player.maxLength = 1;
		input_first_player.value = this.info.first_player;
		input_first_player.addEventListener('change', function(){
			t.info.first_player = this.value;
			t.Update();
		});
		markers_div.appendChild(input_first_player);

		const input_second_player = document.createElement('input');
		input_second_player.classList.add('second_player');
		input_second_player.classList.add('one_char_input');
		input_second_player.type = 'text';
		input_second_player.maxLength = 1;
		input_second_player.value = this.info.second_player;
		input_second_player.addEventListener('change', function(){
			t.info.second_player = this.value;
			t.Update();
		});
		markers_div.appendChild(input_second_player);

		body_div.appendChild(markers_div);

		const settings_div = document.createElement('div');
		settings_div.classList.add('settings_div');
		if(this.info.settings_div_visibility == false){
			settings_div.classList.add('hidden');
		}
		const callback_function = function(selector, option){
			const targets = body_div.querySelectorAll(selector);
			for(let target of targets){
				target.classList.toggle(option);
			}
		};
		for(let setting of settings){
			this.info.settings
			const setting_div = document.createElement('div');
			const type_div = document.createElement('div');
			type_div.classList.add('type_div');
			const type = document.createElement('p');
			type.innerHTML = setting.type;
			type_div.appendChild(type);
			const checkbox = document.createElement('input');
			checkbox.classList.add('setting_checkbox');
			checkbox.type = 'checkbox';
			checkbox.checked = false;
			checkbox.addEventListener('change', function(){
				const inputs = setting_div.querySelectorAll('div input');
				for(let input of inputs){
					if(input.checked != this.checked){
						input.checked = this.checked;
						input.dispatchEvent(new Event('change'));
					}
				}
			});
			type_div.appendChild(checkbox);
			setting_div.appendChild(type_div);
			for(let target of setting.targets){
				if(this.info.settings[setting.type][target]){
					callback_function(target, setting.option);
				}
				const target_div = document.createElement('div');
				const target_input = document.createElement('input');
				const target_input_id = id + setting.type + target;
				target_input.id = target_input_id;
				target_input.type = 'checkbox';
				target_input.checked = this.info.settings[setting.type][target];
				target_input.addEventListener('change', function(){
					callback_function(target, setting.option);
					t.info.settings[setting.type][target] = this.checked;
				});
				target_div.appendChild(target_input);
				const target_label = document.createElement('label');
				target_label.htmlFor = target_input_id;
				target_label.innerHTML = target;
				target_div.appendChild(target_label);
				setting_div.appendChild(target_div);
			}
			settings_div.appendChild(setting_div);
		}

		main_div.appendChild(head_div);
		main_div.appendChild(settings_div);
		main_div.appendChild(body_div);

		document.getElementById('main').appendChild(main_div);
	}

	Update(){
		const current_number_of_transformations = Object.keys(transformations).length;
		if(this.number_of_transformations != current_number_of_transformations){
			const transformations_select = document.querySelector(`#${this.id} .transformations_select`);
			transformations_select.innerHTML = '';
			for(let transformation in transformations){
				const option = document.createElement('option');
				option.value = transformation;
				option.innerHTML = transformation;
				transformations_select.appendChild(option);
			}
			this.number_of_transformations = current_number_of_transformations;
		}
		
		document.querySelector(`#${this.id} .numeric_sequence`).innerHTML = 'Numeric sequence: ' + this.info.numeric_sequence;
		const board = this.GetBoard(this.info.numeric_sequence);
		document.querySelector(`#${this.id} .board`).innerHTML = 'Board: ' + board;
		for(let i = 0; i < 9; i++){
			const cell = document.querySelector(`#${this.id} .cell${i}`);
			cell.classList.remove('taken');
			cell.classList.remove('alignment_cell');
			let marker = this.info.empty;
			if(board[i] != empty_status){
				cell.classList.add('taken');
			}
			if(board[i] == first_player_status){
				marker = this.info.first_player;
			}
			else if(board[i] == second_player_status){
				marker = this.info.second_player;
			}
			cell.innerHTML = marker;
		}
		const alignments = this.GetAlignments(this.info.numeric_sequence);
		document.querySelector(`#${this.id} .alignments`).innerHTML = 'Alignments: ' + JSON.stringify(alignments);
		for(let alignment of alignments){
			for(let numeric_id of alignment){
				document.querySelector(`#${this.id} .cell${numeric_id}`).classList.add('alignment_cell');
			}
		}
		const winner = this.GetWinner();
		document.querySelector(`#${this.id} .winner`).innerHTML = 'Winner: ' + winner;
		const universal_sequence = CreateUniversalSequence(this.info.numeric_sequence);
		document.querySelector(`#${this.id} .universal_sequence`).innerHTML = 'Universal sequence: ' + universal_sequence;
		document.querySelector(`#${this.id} .empty`).value = this.info.empty;
		document.querySelector(`#${this.id} .first_player`).value = this.info.first_player;
		document.querySelector(`#${this.id} .second_player`).value = this.info.second_player;
	}
};
