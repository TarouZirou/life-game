extern crate life_game;
use life_game::Universe;

use wasm_bindgen_test::wasm_bindgen_test;
use wasm_bindgen_test::wasm_bindgen_test_configure;

wasm_bindgen_test_configure!(run_in_browser);

macro_rules! log{
	( $( $t:tt )* ) => {
		web_sys::console::log_1(&format!( $( $t )* ).into());
	};
}

macro_rules! error {
	( $( $t:tt )* ) => {
		web_sys::console::error_1(&format!( $( $t )* ).into());
	};
}

#[cfg(test)]
pub fn input_spaceship() -> Universe {
	let mut uni = Universe::new();
	uni.set_width(6);
	uni.set_height(6);
	uni.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
	uni
}

#[cfg(test)]
pub fn expected_spaceship() -> Universe {
	let mut uni = Universe::new();
	uni.set_width(6);
	uni.set_height(6);
	uni.set_cells(&[(2, 1), (2, 3), (3, 2), (3, 3), (4, 2)]);
	uni
}

#[wasm_bindgen_test]
pub fn test_tick() {
	let mut inp = input_spaceship();

	let exp = expected_spaceship();

	inp.tick();
	assert_eq!(&inp.get_cells(), &exp.get_cells());
}
