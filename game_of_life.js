// HTML elements
var cnvs
var size_x_input
var size_y_input
var cell_size_input
var speed_input
var run_bttn
var step_bttn
var clear_bttn
var ctx

// GLOBAL GAME VARIABLES
var board  // multidimensional array
var turns  // int
var height // int
var width  // int
var running = false
var interval_id // int
var speed

// GLOBAL GAME CONSTANTS
// Alive and dead are more intuitive terms than true and false in this situation,
// still the power of booleans is preserved.
const ALIVE = true
const DEAD  = false

window.onload = function() {
  cnvs            = document.getElementById("cnvs")
  size_x_input    = document.getElementById("size_x")
  size_y_input    = document.getElementById("size_y")
  cell_size_input = document.getElementById("cell_size")
  speed_input     = document.getElementById("speed")
  randomize_input = document.getElementById("randomize_input")
  a_color_input   = document.getElementById("alive_color")
  d_color_input   = document.getElementById("dead_color")
  run_bttn        = document.getElementById("run_bttn")
  step_bttn       = document.getElementById("step_bttn")
  clear_bttn      = document.getElementById("clear_bttn")
  randomize_bttn  = document.getElementById("randomize_bttn")
  ctx             = cnvs.getContext("2d")

  // These inputs change the board and thus reset it.
  size_y_input.onchange = init_game
  size_x_input.onchange = init_game

  cell_size_input.onchange = cell_size_change
  speed_input.onchange = speed_change
  run_bttn.onclick = start_stop
  step_bttn.onclick = step
  clear_bttn.onclick = clear
  randomize_bttn.onclick = randomize
  a_color_input.onchange = draw_board
  d_color_input.onchange = draw_board


  cnvs.addEventListener("mousedown", (event) => {
    mouse_pos = getMousePos(cnvs, event)
    cell = {
      // +1 for lines between cells
      x: Math.floor(mouse_pos.x / (cell_size+1)),
      y: Math.floor(mouse_pos.y / (cell_size+1))
    }
    board[cell.x][cell.y] = !board[cell.x][cell.y]
    draw_board()
  })

  init_game()
}

// Core functions
function init_game() {
  if (running) {
    start_stop()
  }
  set_size()
  set_speed()
  empty_board()
  draw_board()
}

function step() {
  console.log("Next turn")
  process_board()
  draw_board()
}

function process_board() {
  let new_board = []
  for (var x=0; x < width; x++) {
    new_board.push([])
    for (var y=0; y < height; y++) {
      neighbours = num_of_neighbours_alive(x, y)
      new_board[x].push(
        new_cell_state(board[x][y], neighbours)
      )
    }
  }
  board = new_board
}

function draw_board() {
 for (var x=0; x<width; x++) {
   for (var y=0; y<height; y++) {
     if (board[x][y]) {
       ctx.fillStyle = a_color_input.value
     } else {
       ctx.fillStyle = d_color_input.value
     }
     // +x and +y for lines between cells
     ctx.fillRect(
       x * cell_size + x,
       y * cell_size + y,
       cell_size,
       cell_size
     )
   }
 }
}

function set_size() {
  height = parseInt(size_y_input.value)
  width  = parseInt(size_x_input.value)
  cell_size = parseInt(cell_size_input.value)
  cnvs.height = height * cell_size + height // +height for lines between cells
  cnvs.width  = width  * cell_size + width // +width for lines between cells
}

function empty_board() {
  board = []
  for (var x=0; x < width; x++) {
    let column = []
    for (var y=0; y < height; y++) {
      column.push(DEAD)
    }
    board.push(column)
  }
}

function set_speed() {
  speed = 1000/ parseInt(speed_input.value)
}

// Control functions, called when input is changed and
function start_stop() {
  running = !running
  if (running) {
    run_bttn.innerHTML = "Stop"
    interval_id = setInterval(step, speed) // TODO: adjustable interval
  } else {
    run_bttn.innerHTML = "Start"
    clearInterval(interval_id)
  }
}

function clear() {
  if (running) {
    start_stop()
  }
  empty_board()
  draw_board()
}

function cell_size_change() {
  set_size()
  draw_board()
}

function speed_change() {
  if (running) {
    clearInterval(interval_id)
  }
  set_speed()
  if (running) {
    interval_id = setInterval(step, speed)
  }
}

function randomize() {
  let ratio = parseInt(randomize_input.value)
  for (var x=0; x<width; x++) {
    for (var y=0; y<height; y++) {
      if (Math.random()*100 < ratio) {
        board[x][y] = ALIVE
      } else {
        board[x][y] = DEAD
      }
    }
  }
  draw_board()
}

// Helper functions
function new_cell_state(current_state, neighbours) {
  if (current_state) { // ALIVE STATE
    if (neighbours == 2 || neighbours == 3) {
      return ALIVE
    } else {
      return DEAD
    }
  } else { // DEAD STATE
    if (neighbours == 3) {
      return ALIVE
    } else {
      return DEAD
    }
  }
}

function num_of_neighbours_alive(x, y) {
  // Determine whether neighbours are alive in clockwise direction.
  //  The first condition checks whether there is a neighbour on that side.
  //  The second condition checks the value.
  const coordinates_in_board = (x,y) => (x >= 0 && x < width && y >= 0 && y < height)
  const not_both_zero = (n,m) => !(n == 0 && m == 0)

  let n = 0
  for (var i=-1; i<=1; i++) {
    for (var j=-1; j<=1; j++) {
      if (coordinates_in_board(x+i,y+j) &&
          not_both_zero(i,j) &&
          board[x+i][y+j] == ALIVE)
      {
        n++
      }
    }
  }
  return n
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
