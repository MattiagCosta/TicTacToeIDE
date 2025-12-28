var id_prefix = 'Tic-Tac-Toe-';
var id_number = 0;
var TicTacToe_list = [];

const default_info = {empty:'',first_player:'X',second_player:'O',numeric_sequence:''};

const transformations = {
	'counterclockwise90rotation':{'0':'6','1':'3','2':'0','3':'7','4':'4','5':'1','6':'8','7':'5','8':'2'},
	'clockwise90rotation':{'0':'2','1':'5','2':'8','3':'1','4':'4','5':'7','6':'0','7':'3','8':'6'},
	'0reflection':{'0':'6','1':'7','2':'8','3':'3','4':'4','5':'5','6':'0','7':'1','8':'2'},
	'90reflection':{'0':'2','1':'1','2':'0','3':'5','4':'4','5':'3','6':'8','7':'7','8':'6'},
	'45reflection':{'0':'8','1':'5','2':'2','3':'7','4':'4','5':'1','6':'6','7':'3','8':'0'},
	'135reflection':{'0':'0','1':'3','2':'6','3':'1','4':'4','5':'7','6':'2','7':'5','8':'8'}
};

const initial_point_of_view = "CBCBABCBC";
const center_point_of_view = "EDEDPDEDE";
const middle_point_of_view = "HPHIGIJFJ";
const corner_point_of_view = "PMNMKONOL";

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
		AddTicTacToe(to_id, t.info)
	}
}

function DuplicateTicTacToeDefaultId(from_id){
	const t = GetTicTacToe(from_id);
	if(t){
		AddTicTacToeDefaultId(t.info);
	}
}

function RemoveTicTacToe(id){
	const index = GetTicTacToeIndex(id);
	if(index !== null){
		document.getElementById(id).remove();
		TicTacToe_list.splice(index, 1);
	}
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

function MatchPointOfView(point_of_view, desired_square_numeric_id){
	for(let i = 0; i < 4; i++){
		if(point_of_view[desired_square_numeric_id] == 'P'){
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
	constructor(id, info = {...default_info}){
		this.id = id
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

	ChangeNumericSequence(rules){
		let new_numeric_sequence = '';
		for(let move of this.info.numeric_sequence){
			new_numeric_sequence += rules[move];
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
				board += numeric_sequence.indexOf(i) % 2 + 1;
			}
			else{
				board += '0';
			}
		}
		return board
	}

	GetAlignments(numeric_sequence){
		if(numeric_sequence.length < 5){
			return [];
		}
		const board = this.GetBoard(numeric_sequence);
		let alignments = [];
		if(board[0] == board[1] && board[1] == board[2] && board[0] != '0'){
			alignments.push('012');
		}
		if(board[0] == board[3] && board[3] == board[6] && board[0] != '0'){
			alignments.push('036');
		}
		if(board[2] == board[5] && board[5] == board[8] && board[8] != '0'){
			alignments.push('258');
		}
		if(board[6] == board[7] && board[6] == board[8] && board[8] != '0'){
			alignments.push('678');
		}
		if(board[3] == board[4] && board[4] == board[5] && board[4] != '0'){
			alignments.push('345');
		}
		if(board[1] == board[4] && board[4] == board[7] && board[4] != '0'){
			alignments.push('147');
		}
		if(board[0] == board[4] && board[4] == board[8] && board[4] != '0'){
			alignments.push('048');
		}
		if(board[2] == board[4] && board[4] == board[6] && board[4] != '0'){
			alignments.push('246');
		}
		return alignments;
	}

	GetWinner(){
		let winner = 'None';
		if(this.info.numeric_sequence >= 5){
			for(let n = 6; n <= this.info.numeric_sequence.length + 1; n++){
				let subsequence = this.info.numeric_sequence.substring(0, n);
				const alignments = this.GetAlignments(subsequence);
				if(alignments[0]){
					const board = this.GetBoard(this.info.numeric_sequence);
					winner = (board[alignments[0][0]] == '1') ? 'First player' : 'Second player';
					break;
				}
			}
			if(winner == 'None' && this.info.numeric_sequence.length == 9){
				winner = 'Tie';
			}
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

		const toggle_button = document.createElement('button');
		toggle_button.classList.add('toggle_button');
		toggle_button.innerHTML = 'Toggle';
		toggle_button.addEventListener('click', function(){
			if(body_div.classList.contains('hidden')){
				body_div.classList.remove('hidden');
			}
			else{
				body_div.classList.add('hidden');
			}
		});
		head_div.appendChild(toggle_button);

		const name = document.createElement('p');
		name.classList.add('name');
		name.innerHTML = id;
		head_div.appendChild(name);

		const delete_button = document.createElement('button');
		delete_button.classList.add('delete_button');
		delete_button.innerHTML = 'Delete';
		delete_button.addEventListener('click', function(){
			RemoveTicTacToe(id);
		});
		head_div.appendChild(delete_button);

		const clear_button = document.createElement('button');
		clear_button.classList.add('clear_button');
		clear_button.innerHTML = 'Clear';
		clear_button.addEventListener('click', function(){
			t.info = {...default_info};
			t.Update();
		});
		head_div.appendChild(clear_button);

		const duplicate_button = document.createElement('button');
		duplicate_button.classList.add('duplicate_button');
		duplicate_button.innerHTML = 'Duplicate';
		duplicate_button.addEventListener('click', function(){
			DuplicateTicTacToeDefaultId(t.id);
		});
		head_div.appendChild(duplicate_button);

		main_div.appendChild(head_div);

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
				td.classList.add('square');
				td.classList.add('square' + (3*i+j));
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

		const undo_button = document.createElement('button');
		undo_button.innerHTML = 'Undo last move';
		undo_button.addEventListener('click', function(){
			t.UndoLastMove();
			t.Update();
		});
		board_table_div.appendChild(undo_button);

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

		const transformations = ['counterclockwise90rotation','clockwise90rotation','0reflection','90reflection','45reflection','135reflection']
		const select = document.createElement('select');
		select.classList.add('transformation');
		for(let transformation of transformations){
			const option = document.createElement('option');
			option.value = transformation;
			option.innerHTML = transformation;
			select.appendChild(option);
		}
		transformations_div.appendChild(select);

		const transformation_button = document.createElement('button');
		transformation_button.innerHTML = 'Apply transformation';
		transformation_button.addEventListener('click', function(){
			t.TransformNumericSequence(document.querySelector(`#${t.id} .transformation`).value);
			t.Update();
		});
		transformations_div.appendChild(transformation_button);

		body_div.appendChild(transformations_div);

		const markers_div = document.createElement('div');
		markers_div.classList.add('markers_div');

		const input_empty = document.createElement('input');
		input_empty.classList.add('empty');
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
		input_second_player.type = 'text';
		input_second_player.maxLength = 1;
		input_second_player.value = this.info.second_player;
		input_second_player.addEventListener('change', function(){
			t.info.second_player = this.value;
			t.Update();
		});
		markers_div.appendChild(input_second_player);

		body_div.appendChild(markers_div);

		main_div.appendChild(body_div);

		document.getElementById('main').appendChild(main_div);
	}

	Update(){
		document.querySelector(`#${this.id} .numeric_sequence`).innerHTML = 'Numeric sequence: ' + this.info.numeric_sequence;
		const board = this.GetBoard(this.info.numeric_sequence);
		document.querySelector(`#${this.id} .board`).innerHTML = 'Board: ' + board;
		for(let i = 0; i < 9; i++){
			const square = document.querySelector(`#${this.id} .square${i}`);
			square.classList.remove('taken');
			let marker = this.info.empty;
			if(board[i] != '0'){
				square.classList.add('taken');
			}
			if(board[i] == '1'){
				marker = this.info.first_player;
			}
			else if(board[i] == '2'){
				marker = this.info.second_player;
			}
			square.innerHTML = marker;
		}
		const alignments = this.GetAlignments(this.info.numeric_sequence);
		document.querySelector(`#${this.id} .alignments`).innerHTML = 'Alignments: ' + JSON.stringify(alignments);
		const winner = this.GetWinner();
		document.querySelector(`#${this.id} .winner`).innerHTML = 'Winner: ' + winner;
		const universal_sequence = CreateUniversalSequence(this.info.numeric_sequence);
		document.querySelector(`#${this.id} .universal_sequence`).innerHTML = 'Universal sequence: ' + universal_sequence;
		document.querySelector(`#${this.id} .empty`).value = this.info.empty;
		document.querySelector(`#${this.id} .first_player`).value = this.info.first_player;
		document.querySelector(`#${this.id} .second_player`).value = this.info.second_player;
	}
};
